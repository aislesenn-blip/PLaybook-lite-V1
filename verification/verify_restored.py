from playwright.sync_api import sync_playwright
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    print("Navigating to http://localhost:5174/")

    # Listen for console logs
    page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))

    response = page.goto("http://localhost:5174/")
    print(f"Page load status: {response.status}")

    # Check if UI is restored (Look for "Give your child the confidence")
    try:
        page.wait_for_selector("text=Give your child the confidence", timeout=5000)
        print("UI Restored: Headline FOUND.")
    except:
        print("UI Restored: Headline NOT found.")

    # Take Screenshot
    page.screenshot(path="verification_restored.png")
    print("Screenshot saved to verification_restored.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
