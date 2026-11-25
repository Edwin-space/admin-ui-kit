"""Run: python tests/smoke.py (requires Playwright and Chromium)."""
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
import os

url = (Path(__file__).resolve().parents[1] / "index.html").as_uri()
with sync_playwright() as p:
    opts = {"headless": True}
    if os.environ.get("CHROMIUM_PATH"):
        opts["executable_path"] = os.environ["CHROMIUM_PATH"]
    browser = p.chromium.launch(**opts)
    page = browser.new_page(viewport={"width": 1440, "height": 960})
    errors, external = [], []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.on("request", lambda request: external.append(request.url) if request.url.startswith(("http:", "https:")) else None)
    page.goto(url + "#overview")
    expect(page.get_by_role("heading", level=1)).to_contain_text("관리자 UI 키트")
    page.get_by_role("link", name="컴포넌트 탐색").click()
    expect(page.locator(".demo-card")).to_have_count(22)
    page.get_by_text("사용 코드", exact=True).first.click()
    expect(page.locator("#snippet-stat")).to_contain_text("AdminKit.stat")
    page.get_by_role("button", name="코드 복사").first.click()
    expect(page.locator("#announcement")).to_contain_text("복사")
    assert not page.evaluate("AdminKit.badge('<img src=x onerror=alert(1)>').includes('<img')")
    page.goto(url + "#blocks")
    expect(page.locator(".rb-metrics .rb-metric")).to_have_count(4)
    expect(page.locator(".rb-event-list li")).to_have_count(5)
    page.locator("#query").fill("보고서")
    expect(page.locator(".rb-event-list li")).to_have_count(1)
    page.locator("#filter").select_option("실패")
    expect(page.get_by_text("조건에 맞는 활동이 없습니다")).to_be_visible()
    page.locator("#query").clear()
    expect(page.locator(".rb-event-list li")).to_have_count(1)
    page.locator("#filter").select_option("all")
    for scenario, phrase in [("loading", "불러오는 중"), ("empty", "처리할 일이 없습니다"), ("error", "활동을 불러오지 못했어요")]:
        page.locator("#scenario").select_option(scenario)
        expect(page.get_by_text(phrase, exact=True).first).to_be_attached()
    page.get_by_role("button", name="다시 시도").click()
    expect(page.locator(".rb-event-list li")).to_have_count(5)
    page.locator("#scenario").select_option("offline")
    expect(page.get_by_role("button", name="검토").first).to_be_disabled()
    page.get_by_role("button", name="다시 시도").click()
    expect(page.get_by_text("연결 복구됨")).to_be_visible()
    expect(page.get_by_role("button", name="검토").first).to_be_enabled()
    page.get_by_role("link", name="처리 대기열").first.click()
    page.get_by_role("button", name="검토").first.click()
    expect(page.get_by_role("dialog")).to_be_visible()
    page.keyboard.press("Escape")
    expect(page.get_by_role("dialog")).not_to_be_visible()
    for _ in range(3):
        page.get_by_role("button", name="검토").first.click()
        page.get_by_role("button", name="예제에서 완료 처리").click()
    expect(page.get_by_text("처리할 일이 없습니다")).to_be_visible()
    for width in [1440, 1024, 768, 390, 320]:
        page.set_viewport_size({"width": width, "height": 850})
        for route in ["overview", "components", "blocks", "queue"]:
            page.goto(url + "#" + route)
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth"), (width, route)
    assert not errors, errors
    assert not external, external
    browser.close()
    print("PASS: four views, 22 catalog entries, copy, search/filter, five scenarios, simulated review, 5 widths, no external requests.")
