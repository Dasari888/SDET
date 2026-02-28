from selenium.webdriver.common.by import By
import json
from src.action_driver import ActionDriver


def login_and_get_token(driver, uname, pword):
    utils = ActionDriver(driver)

    try:
        print("🔐 Logging in")

        # Enter email
        utils.safe_send_keys((By.XPATH, "//input[@id='mat-input-0']"), uname)
        print("✅ Email entered")

        # Click first login button
        utils.safe_click((By.XPATH, "//input[@value='Login']"))
        print("✅ Clicked first login button")
        import time
        time.sleep(2)  # Give time for the password field to appear

        # Wait for page transition and password field to appear
        # First wait for the email field to disappear or password field to appear
        utils.wait_for_ajax()
        utils.wait_for_page_load()
        
        # Wait for password field to appear - try multiple locators
        password_field = None
        password_locators = [
            (By.XPATH, "//input[@id='pass_log_id']"),
            (By.XPATH, "//input[@type='password']"),
            (By.XPATH, "//input[contains(@id,'pass')]"),
            (By.CSS_SELECTOR, "input[type='password']"),
        ]
        
        for locator in password_locators:
            try:
                print(f"⏳ Waiting for password field with: {locator}")
                # First wait for presence, then visibility
                password_field = utils.wait_for_presence(locator, timeout=30)
                # Additional wait to ensure it's visible and enabled
                utils.wait().until(
                    lambda d: password_field.is_displayed() and password_field.is_enabled()
                )
                print(f"✅ Found password field with: {locator}")
                break
            except Exception as e:
                print(f"⚠️ Password field not found with {locator}: {e}")
                continue
        
        if not password_field:
            utils.fail("Password field not found after clicking first login button")
        
        # Enter password
        password_field.clear()
        password_field.send_keys(pword)
        print("✅ Password entered")

        # Click final login
        utils.safe_click((By.XPATH, "//button[normalize-space()='Login']"))
        print("✅ Clicked final login button")

        # Wait for dashboard load (Location text)
        utils.wait_for_visibility((By.XPATH, "//*[contains(text(),'Location')]"))
        print("✅ Dashboard loaded (Location text found)")

        # Wait for token to be available in localStorage
        utils.wait().until(
            lambda d: d.execute_script(
                "return window.localStorage.getItem('token') != null"
            )
        )

        # Fetch token
        token_str = driver.execute_script(
            "return window.localStorage.getItem('token');"
        )

        token = json.loads(token_str)
        access_token = token.get("value")

        if not access_token:
            utils.fail("Access token not found after login")

        # Prepare headers for API calls
        headers = {
            "access_token": access_token
        }

        print("✅ Login successful")

        return headers

    except Exception as e:
        utils.fail(f"Login failed: {e}")

