import json
import pathlib
import re
from urllib.parse import parse_qs, urlparse

import requests
from playwright.sync_api import TimeoutError as PlaywrightTimeoutError
from playwright.sync_api import sync_playwright

URL = (
    "https://www.booking.com/hotel/br/pousada-em-pedrinhas-ilha-comprida.pt-br.html"
    "?aid=360920&label=New_Portuguese_PT_ROW_6409090206-_9oPl604g33uUPimd0_L7QS217921514283"
    "%3Apl%3Ata%3Ap1%3Ap2%3Aac%3Aap%3Aneg&sid=983fc30ddabc9ef77186b4a1d9251cfa&dest_id=900050988"
    "&dest_type=city&dist=0&group_adults=2&group_children=0&hapos=1&hpos=1&no_rooms=1&req_adults=2"
    "&req_children=0&room1=A%2CA&sb_price_type=total&sr_order=popularity&srepoch=1776838547"
    "&srpvid=1f082bfe47480142&type=total&ucfs=1&"
)
BASE_DIR = pathlib.Path("fotos_pousada")
ROOM_DIR = BASE_DIR / "quarto"
OTHER_DIR = BASE_DIR / "outros"
META_PATH = BASE_DIR / "metadados.json"
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "pt-BR,pt;q=0.9",
}
IMAGE_EXT = re.compile(r"\.(jpg|jpeg|png|webp)(\?|$)", re.IGNORECASE)
ROOM_HINTS = (
    "quarto",
    "suite",
    "suíte",
    "cama",
    "bedroom",
    "room",
    "dormitório",
    "banheiro",
)


def is_image_url(url: str) -> bool:
    return bool(url and IMAGE_EXT.search(url))


def normalize_url(url: str) -> str:
    return url.replace("\\/", "/").strip()


def score_size(url: str) -> int:
    query = parse_qs(urlparse(url).query)
    max_v = 0
    for key in ("k", "w", "h"):
        if key in query:
            for val in query[key]:
                if val.isdigit():
                    max_v = max(max_v, int(val))
    return max_v


def choose_best(candidates: list[str]) -> str:
    return sorted(candidates, key=score_size, reverse=True)[0]


def classify(title: str) -> str:
    t = (title or "").strip().lower()
    for hint in ROOM_HINTS:
        if hint in t:
            return "quarto"
    return "outros"


def collect_gallery_items() -> list[dict]:
    items = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(locale="pt-BR")
        page = context.new_page()
        page.set_extra_http_headers({"Accept-Language": "pt-BR,pt;q=0.9"})

        page.goto(URL, wait_until="domcontentloaded", timeout=120000)
        try:
            page.wait_for_load_state("networkidle", timeout=20000)
        except PlaywrightTimeoutError:
            pass

        clicked = False
        click_selectors = [
            "div.b221e13efa",
            "[data-testid='property-gallery'] img",
            "img[data-testid='image']",
            "img",
        ]
        for sel in click_selectors:
            try:
                if page.locator(sel).first.count() > 0:
                    page.locator(sel).first.click(timeout=5000)
                    clicked = True
                    break
            except Exception:
                continue

        if clicked:
            try:
                page.wait_for_timeout(2000)
                page.wait_for_load_state("networkidle", timeout=20000)
            except PlaywrightTimeoutError:
                pass

        js = """
        () => {
          const out = [];
          const seen = new Set();
          const imageRegex = /\\.(jpg|jpeg|png|webp)(\\?|$)/i;

          const add = (src, title) => {
            if (!src || !imageRegex.test(src)) return;
            src = src.replaceAll('\\\\/', '/').trim();
            if (!src.includes('bstatic.com/xdata/images/hotel/')) return;
            const key = src.split('?')[0] + '|' + (title || '').trim();
            if (seen.has(key)) return;
            seen.add(key);
            out.push({ src, title: (title || '').trim() });
          };

          document.querySelectorAll('img').forEach((img) => {
            const srcs = [img.currentSrc, img.src, img.getAttribute('data-src')].filter(Boolean);
            const title = img.alt || img.title || '';
            srcs.forEach((s) => add(s, title));
          });

          document.querySelectorAll('[data-testid*="gallery"], [class*="gallery"], [class*="photo"]').forEach((el) => {
            const title = el.getAttribute('aria-label') || el.getAttribute('title') || '';
            const style = el.getAttribute('style') || '';
            const m = style.match(/url\\(([^)]+)\\)/i);
            if (m && m[1]) {
              const raw = m[1].replace(/^['"]|['"]$/g, '');
              add(raw, title);
            }
          });

          return out;
        }
        """

        raw = page.evaluate(js)

        # Try to iterate modal gallery by clicking next.
        next_selectors = [
            "button[aria-label*='Próxima foto']",
            "button[aria-label*='Próxima']",
            "button[aria-label*='Next photo']",
            "button[aria-label*='Next']",
            "[data-testid='gallery-next']",
        ]

        def collect_current_modal_image() -> None:
            modal_imgs = page.locator("img")
            max_count = min(modal_imgs.count(), 40)
            for i in range(max_count):
                try:
                    el = modal_imgs.nth(i)
                    src = el.get_attribute("src") or el.get_attribute("currentSrc") or ""
                    alt = el.get_attribute("alt") or ""
                    src = normalize_url(src)
                    if is_image_url(src) and "bstatic.com/xdata/images/hotel/" in src:
                        raw.append({"src": src, "title": alt.strip()})
                except Exception:
                    continue

        def click_next() -> bool:
            for sel in next_selectors:
                loc = page.locator(sel)
                if loc.count() > 0:
                    try:
                        loc.first.click(timeout=3000)
                        return True
                    except Exception:
                        continue
            return False

        for _ in range(40):
            collect_current_modal_image()
            if not click_next():
                break
            page.wait_for_timeout(700)

        # Group by base URL and keep best size variant
        grouped = {}
        for it in raw:
            src = normalize_url(it.get("src", ""))
            title = (it.get("title") or "").strip()
            if not is_image_url(src):
                continue
            base = src.split("?")[0]
            grouped.setdefault((base, title), []).append(src)

        for (base, title), urls in grouped.items():
            items.append({"url": choose_best(urls), "title": title})

        browser.close()

    return items


def sanitize_filename(name: str) -> str:
    clean = re.sub(r"[\\\\/:*?\"<>|]+", "_", name).strip()
    return clean[:80] if clean else "sem_titulo"


def download_items(items: list[dict]) -> dict:
    ROOM_DIR.mkdir(parents=True, exist_ok=True)
    OTHER_DIR.mkdir(parents=True, exist_ok=True)
    session = requests.Session()
    session.headers.update(HEADERS)
    saved = []
    idx_room = 1
    idx_other = 1

    for item in items:
        url = item["url"]
        title = item.get("title", "").strip()
        bucket = classify(title)
        ext = ".jpg"
        lower = url.lower()
        if ".jpeg" in lower:
            ext = ".jpeg"
        elif ".png" in lower:
            ext = ".png"
        elif ".webp" in lower:
            ext = ".webp"

        if bucket == "quarto":
            prefix = f"quarto_{idx_room:03d}"
            idx_room += 1
            folder = ROOM_DIR
        else:
            prefix = f"outros_{idx_other:03d}"
            idx_other += 1
            folder = OTHER_DIR

        title_part = sanitize_filename(title)
        filename = folder / f"{prefix}__{title_part}{ext}"

        try:
            r = session.get(url, timeout=30)
            r.raise_for_status()
            filename.write_bytes(r.content)
            saved.append(
                {
                    "arquivo": str(filename),
                    "categoria": bucket,
                    "titulo": title,
                    "url": url,
                }
            )
            print(f"Baixada: {filename}")
        except Exception as exc:
            print(f"Falha: {url} -> {exc}")

    META_PATH.write_text(json.dumps(saved, ensure_ascii=False, indent=2), encoding="utf-8")
    return {
        "total": len(saved),
        "quarto": sum(1 for x in saved if x["categoria"] == "quarto"),
        "outros": sum(1 for x in saved if x["categoria"] == "outros"),
    }


def main() -> None:
    items = collect_gallery_items()
    print(f"Itens únicos encontrados na galeria: {len(items)}")
    result = download_items(items)
    print(
        f"Concluído: {result['total']} imagens "
        f"(quarto={result['quarto']}, outros={result['outros']})"
    )
    print(f"Metadados salvos em: {META_PATH}")


if __name__ == "__main__":
    main()
