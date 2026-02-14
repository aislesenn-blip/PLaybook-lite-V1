from playwright.sync_api import sync_playwright
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    print("Navigating to http://localhost:5173/")

    # Listen for console logs
    page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))

    response = page.goto("http://localhost:5173/")
    print(f"Page load status: {response.status}")

    # Check if UI is restored (Look for "Give your child the confidence")
    try:
        page.wait_for_selector("text=Give your child the confidence", timeout=5000)
        print("UI Restored: Headline FOUND.")
    except:
        print("UI Restored: Headline NOT found.")

    # Check SW
    sw = page.evaluate("navigator.serviceWorker.controller")
    print(f"Service Worker Controller: {sw}")

    # Check /sw.js status
    try:
        res = page.request.get("http://localhost:5173/sw.js")
        print(f"/sw.js status: {res.status}")
    except:
        print("/sw.js fetch failed")

    # Take Screenshot
    page.screenshot(path="verification_restored.png")
    print("Screenshot saved to verification_restored.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
