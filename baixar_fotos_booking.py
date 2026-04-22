import pathlib
import re
from urllib.parse import urlsplit

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

OUTPUT_DIR = pathlib.Path("fotos_pousada")
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "pt-BR,pt;q=0.9",
}


def extract_image_urls_from_page(url: str) -> list[str]:
    collected = set()
    image_pattern = re.compile(r"https://[^\"'\\s>]+(?:jpg|jpeg|png|webp)", re.IGNORECASE)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(locale="pt-BR")
        page = context.new_page()
        page.set_extra_http_headers({"Accept-Language": "pt-BR,pt;q=0.9"})

        page.goto(url, wait_until="domcontentloaded", timeout=120000)
        try:
            page.wait_for_load_state("networkidle", timeout=20000)
        except PlaywrightTimeoutError:
            pass

        html = page.content().replace("\\/", "/")
        for match in image_pattern.findall(html):
            if "bstatic.com/xdata/images/hotel/" in match:
                collected.add(match)

        image_sources = page.eval_on_selector_all(
            "img",
            "els => els.map(e => e.currentSrc || e.src).filter(Boolean)",
        )
        for src in image_sources:
            src = src.replace("\\/", "/")
            if re.search(r"\.(jpg|jpeg|png|webp)(\\?|$)", src, re.IGNORECASE) and (
                "bstatic.com/xdata/images/hotel/" in src
            ):
                collected.add(src)

        browser.close()

    return sorted(collected)


def get_extension(url: str) -> str:
    path = urlsplit(url).path.lower()
    if path.endswith(".jpeg"):
        return ".jpeg"
    if path.endswith(".png"):
        return ".png"
    if path.endswith(".webp"):
        return ".webp"
    return ".jpg"


def download_images(urls: list[str]) -> int:
    OUTPUT_DIR.mkdir(exist_ok=True)
    count = 0

    for idx, image_url in enumerate(urls, start=1):
        ext = get_extension(image_url)
        filename = OUTPUT_DIR / f"pousada_{idx:03d}{ext}"
        try:
            response = requests.get(image_url, headers=HEADERS, timeout=30)
            response.raise_for_status()
            filename.write_bytes(response.content)
            count += 1
            print(f"Baixada: {filename}")
        except Exception as exc:
            print(f"Falha ao baixar {image_url}: {exc}")

    return count


def main() -> None:
    image_urls = extract_image_urls_from_page(URL)

    print(f"Total de URLs de fotos encontradas: {len(image_urls)}")
    downloaded = download_images(image_urls)
    print(f"Total de fotos baixadas em '{OUTPUT_DIR}': {downloaded}")


if __name__ == "__main__":
    main()
