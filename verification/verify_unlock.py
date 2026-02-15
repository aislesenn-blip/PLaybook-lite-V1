from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Navigating to home...")
        page.goto("http://localhost:5173/")

        # Inject user data
        page.evaluate("""() => {
            localStorage.setItem('childName', 'Jules');
            localStorage.setItem('childLang', 'english');
            localStorage.setItem('completedDays', '[]');
        }""")

        print("Navigating to dashboard...")
        page.goto("http://localhost:5173/app")
        page.wait_for_load_state("networkidle")

        # Check if Day 2 is unlocked (should be, even if Day 1 is not completed)
        print("Checking Day 2 unlock status...")
        # Button for Day 2 should NOT have 'disabled' attribute if unlocked.
        # Or checking class for opacity.
        # The 'Day 2' text is inside the button.
        day2_btn = page.locator("button").filter(has_text="Day 2")

        if day2_btn.is_disabled():
            print("Day 2 is LOCKED (Fail)")
        else:
            print("Day 2 is UNLOCKED (Pass)")

        page.screenshot(path="verification/unlock_verification.png")
        browser.close()

if __name__ == "__main__":
    run()
