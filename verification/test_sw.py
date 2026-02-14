
from playwright.sync_api import sync_playwright, expect
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Create a context to capture logs
        context = browser.new_context()
        page = context.new_page()

        # Capture console logs
        logs = []
        page.on("console", lambda msg: logs.append(msg.text))

        print("Navigating to http://localhost:4173")
        try:
            page.goto("http://localhost:4173")
        except Exception as e:
            print(f"Failed to navigate: {e}")
            return

        # Wait for load
        page.wait_for_load_state("networkidle")

        # Verify Hero Section
        print("Verifying Hero Section...")
        try:
            expect(page.get_by_text("Playbook Lite")).to_be_visible(timeout=10000)
            print("✅ Hero Section visible.")
        except Exception as e:
            print(f"❌ Hero Section not visible: {e}")

        # Check logs for SW registration
        print("Checking for Service Worker logs...")
        sw_found = False
        for i in range(5): # Retry a few times
            for log in logs:
                if "App is ready for offline use." in log or "ServiceWorker registration successful" in log:
                    print(f"✅ Found SW Log: {log}")
                    sw_found = True
                    break
            if sw_found:
                break
            time.sleep(1)

        if not sw_found:
             # Check controller manually
            print("Logs not found, checking navigator.serviceWorker.controller...")
            is_controlled = page.evaluate("() => navigator.serviceWorker.controller !== null")
            if is_controlled:
                print("✅ navigator.serviceWorker.controller is active.")
            else:
                print("❌ Service Worker not registered or active.")
                print("Logs captured:")
                for log in logs:
                    print(f" - {log}")

        # Take screenshot
        page.screenshot(path="verification_sw.png")
        print("Screenshot saved to verification_sw.png")

        browser.close()

if __name__ == "__main__":
    run()
