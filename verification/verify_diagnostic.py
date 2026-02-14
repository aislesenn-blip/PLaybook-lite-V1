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

    # Wait for debug element
    try:
        page.wait_for_selector("text==== DIAGNOSTIC REPORT ===", timeout=10000)
        print("Diagnostic Header FOUND.")

        # Capture the report content
        report_text = page.locator("pre").text_content()
        print("\n--- CAPTURED REPORT ---")
        print(report_text)
        print("-----------------------\n")

    except:
        print("Diagnostic Header NOT found.")

    # Take Screenshot
    page.screenshot(path="verification_diagnostic.png")
    print("Screenshot saved to verification_diagnostic.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
