from playwright.sync_api import sync_playwright
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    print("Navigating to http://localhost:5174/")

    # Listen for console logs
    page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
    page.on("dialog", lambda dialog: print(f"DIALOG: {dialog.message}") or dialog.accept())

    response = page.goto("http://localhost:5174/")
    print(f"Page load status: {response.status}")

    # Wait for debug element
    try:
        page.wait_for_selector("text=DEBUG MODE: VERSION 5.0", timeout=5000)
        print("Debug watermark FOUND.")
    except:
        print("Debug watermark NOT found.")

    # Click Diagnostic Button
    try:
        page.click("text=TEST AUDIO PATHS")
        print("Clicked 'TEST AUDIO PATHS'. Check DIALOG output above.")
        time.sleep(2) # Wait for async alerts
    except:
        print("Button not found.")

    # Take Screenshot
    page.screenshot(path="verification_debug_ui.png")
    print("Screenshot saved to verification_debug_ui.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
