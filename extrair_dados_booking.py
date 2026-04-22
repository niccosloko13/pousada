import json
import pathlib
from playwright.sync_api import sync_playwright

URL = (
    "https://www.booking.com/hotel/br/pousada-em-pedrinhas-ilha-comprida.pt-br.html"
    "?aid=360920&label=New_Portuguese_PT_ROW_6409090206-_9oPl604g33uUPimd0_L7QS217921514283"
    "%3Apl%3Ata%3Ap1%3Ap2%3Aac%3Aap%3Aneg&sid=983fc30ddabc9ef77186b4a1d9251cfa&dest_id=900050988"
    "&dest_type=city&dist=0&group_adults=2&group_children=0&hapos=1&hpos=1&no_rooms=1&req_adults=2"
    "&req_children=0&room1=A%2CA&sb_price_type=total&sr_order=popularity&srepoch=1776838547"
    "&srpvid=1f082bfe47480142&type=total&ucfs=1&"
)

OUT_PATH = pathlib.Path("booking_dump.json")


def main() -> None:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(locale="pt-BR")
        page = context.new_page()
        page.goto(URL, wait_until="domcontentloaded", timeout=120000)
        page.wait_for_timeout(8000)

        page_text = page.inner_text("body")
        title = page.title()
        ld_json = page.evaluate(
            """
            () => Array
                .from(document.querySelectorAll("script[type='application/ld+json']"))
                .map((el) => el.textContent || "")
            """
        )
        hotel_images = page.evaluate(
            """
            () => Array
                .from(document.querySelectorAll("img"))
                .map((img) => ({
                    src: img.currentSrc || img.src || "",
                    alt: img.alt || ""
                }))
                .filter((x) => x.src.includes("bstatic.com/xdata/images/hotel/"))
            """
        )

        dump = {
            "url": URL,
            "title": title,
            "body_text": page_text,
            "ld_json": ld_json,
            "hotel_images": hotel_images,
        }
        OUT_PATH.write_text(json.dumps(dump, ensure_ascii=False, indent=2), encoding="utf-8")
        browser.close()

    print(f"Dump salvo em: {OUT_PATH}")


if __name__ == "__main__":
    main()
