from playwright.sync_api import sync_playwright
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # 1. Landing Page
    print("Navigating to Landing Page...")
    page.goto("http://localhost:5173/")
    time.sleep(2) # Wait for animations
    page.screenshot(path="verification_1_landing.png")
    print("Screenshot 1 saved.")

    # 2. Enter Mobile Number
    print("Entering mobile number...")
    page.fill('input[type="tel"]', "1234567890")
    page.click('button[type="submit"]')
    time.sleep(2) # Wait for animation
    page.screenshot(path="verification_2_welcome.png")
    print("Screenshot 2 saved.")

    # 3. Go to App (Onboarding)
    print("Navigating to App...")
    page.goto("http://localhost:5173/app")
    time.sleep(2)
    page.screenshot(path="verification_3_onboarding.png")
    print("Screenshot 3 saved.")

    # 4. Complete Onboarding
    print("Completing Onboarding...")
    page.fill('input[placeholder="e.g. Amani"]', "Jules")
    # English is default
    page.click('button[type="submit"]')
    time.sleep(2)
    page.screenshot(path="verification_4_dashboard.png")
    print("Screenshot 4 saved.")

    # 5. Start Day 1
    print("Starting Day 1...")
    # Find button containing "Day 1"
    page.click('text="Day 1"')
    time.sleep(2)
    page.screenshot(path="verification_5_sponge.png")
    print("Screenshot 5 saved.")

    # 6. Wait for Sponge to finish (5s)
    print("Waiting for Sponge phase...")
    time.sleep(6)
    page.screenshot(path="verification_6_echo.png")
    print("Screenshot 6 saved.")

    # 7. Wait for Echo to finish (3s)
    print("Waiting for Echo phase...")
    time.sleep(4)
    page.screenshot(path="verification_7_hunter.png")
    print("Screenshot 7 saved.")

    # 8. Hunter Phase - Click Apple
    print("Hunter Phase - Clicking Apple...")
    # There are 3 options. The correct one is "Apple".
    # Since I used random distractors, I need to find the button with "Apple".
    # The button contains text "Apple".
    page.click('text="Apple"')
    time.sleep(2) # Wait for success animation and transition
    page.screenshot(path="verification_8_performer.png")
    print("Screenshot 8 saved.")

    # 9. Performer Phase
    print("Performer Phase...")
    # It auto-completes after 5s + 2s = 7s.
    time.sleep(8)
    page.screenshot(path="verification_9_dashboard_completed.png")
    print("Screenshot 9 saved.")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
