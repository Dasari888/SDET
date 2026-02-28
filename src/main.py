from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from action_driver import ActionDriver
from login import login_and_get_token
from location_check import check_locations
# from All_locations_notifyMe import all_loc_notifyMe
import os

# To run:
# behave -f json -o report.json features/boneplus.feature
# behave -f json -o report.json --no-capture features/boneplus.feature

BASE_URL = "https://boneplus.b1automation.com"


def main():
    uname = input("Enter your user Email ID: ")
    pword = input("Enter your password: ")

    driver_path = os.getenv("CHROMEDRIVER_PATH")
    if not driver_path:
        raise ValueError("CHROMEDRIVER_PATH not set in environment variables")

    service = Service(driver_path)
    driver = webdriver.Chrome(service=service)

    # ✅ Initialize ActionDriver (GLOBAL helper)
    action = ActionDriver(driver)

    try:
        print("🚀 Launching application")
        driver.get(BASE_URL)
        driver.maximize_window()

        # ✅ Robust waits (NO sleep)
        action.wait_for_page_load()
        action.wait_for_js_and_ajax()

        # ✅ Login and fetch token
        print("🔐 Logging in")
        headers = login_and_get_token(driver, uname, pword)

        # ✅ Post-login stabilization
        action.wait_for_page_load()
        action.wait_for_js_and_ajax()

        # ✅ Location validation
        print("📍 Starting location validations")
        check_locations(driver, headers, BASE_URL)

        # all_loc_notifyMe(driver, headers, BASE_URL)

        print("✅ Execution completed successfully")

    except Exception as e:
        # ❌ DO NOT call _fail() directly from here
        # Let this be a hard failure
        print("❌ Execution failed:", e)
        raise

    finally:
        print("🧹 Closing browser")
        driver.quit()


if __name__ == "__main__":
    main()
