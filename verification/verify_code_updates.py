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

    # Check Manifest
    manifest_link = page.locator('link[rel="manifest"]')
    if manifest_link.count() > 0:
        href = manifest_link.get_attribute("href")
        print(f"Manifest found: {href}")
        # Fetch manifest content
        manifest_response = page.request.get("http://localhost:5174" + href)
        print(f"Manifest content: {manifest_response.text()}")
    else:
        print("Manifest link NOT found!")

    # Check PWA Icons
    # We can try to fetch them directly
    icon1 = page.request.get("http://localhost:5174/pwa-192x192.png")
    print(f"Icon 192 status: {icon1.status}")

    icon2 = page.request.get("http://localhost:5174/pwa-512x512.png")
    print(f"Icon 512 status: {icon2.status}")

    # Check SW Registration
    # Evaluate JS to check navigator.serviceWorker.controller
    sw_active = page.evaluate("navigator.serviceWorker.controller !== null")
    print(f"Service Worker Active: {sw_active}")

    # Take Screenshot
    page.screenshot(path="verification_report.png")
    print("Screenshot saved to verification_report.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
