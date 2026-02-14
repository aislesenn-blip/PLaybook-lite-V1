from playwright.sync_api import sync_playwright
import time
import sys

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    print("Navigating to http://localhost:4173/")

    sw_registered = False

    # Listen for console logs
    def handle_console(msg):
        nonlocal sw_registered
        text = msg.text
        print(f"CONSOLE: {text}")
        if "[SW]" in text:
            sw_registered = True

    page.on("console", handle_console)

    try:
        response = page.goto("http://localhost:4173/", timeout=10000)
        print(f"Page load status: {response.status}")
    except Exception as e:
        print(f"Error loading page: {e}")
        browser.close()
        sys.exit(1)

    # Wait for app to settle
    time.sleep(5)

    # Check for specific UI element (e.g., "Playbook")
    try:
        # Looking for generic welcome text or app shell
        page.wait_for_selector("text=Playbook", timeout=5000)
        print("UI Verification: 'Playbook' text found.")
    except:
        print("UI Verification: 'Playbook' text NOT found. Checking for alternative text...")
        try:
             page.wait_for_selector("text=Give your child the confidence", timeout=5000)
             print("UI Verification: Headline found.")
        except:
             print("UI Verification: content not found.")


    if sw_registered:
        print("SUCCESS: Service Worker registration detected via console logs.")
    else:
        print("WARNING: Service Worker registration NOT detected in console logs (yet).")

    # Take Screenshot
    page.screenshot(path="verification_sw.png")
    print("Screenshot saved to verification_sw.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
