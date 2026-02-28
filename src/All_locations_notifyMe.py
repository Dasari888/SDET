from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from src.location_check import location_ids_count
from src.action_driver import ActionDriver
import requests


def all_loc_notifyMe(driver, headers, Base_url):
    action = ActionDriver(driver)
    
    # Select the first location
    initial_location = action.wait_for_presence(
        (By.XPATH, "//span[@class='mat-radio-outer-circle'][1]")
    )
    driver.execute_script("arguments[0].scrollIntoView(true);", initial_location)
    driver.execute_script("arguments[0].click();", initial_location)
    action.wait_for_ajax()

    # Click next
    action.wait_after_action(
        lambda: action.safe_click((By.CSS_SELECTOR, ".mat-button-wrapper")),
        wait_type="ajax"
    )

    # Open profile menu
    action.wait_after_action(
        lambda: action.safe_click((By.CSS_SELECTOR, "#Icon_awesome-user-circle")),
        wait_type="ajax"
    )

    # Get location details
    api_locations, location_ids, country_ids, timezone_ids, length_loc, sort_ids = location_ids_count(Base_url, headers)

    for i in range(1, length_loc + 1, 1):
        print(f"###### Location is {api_locations[i-1]}: id is {location_ids[i-1]}")

        # Select location radio
        radio_btn = action.wait_for_presence(
            (By.XPATH, f"(//span[@class='mat-radio-outer-circle'])[{i}]")
        )
        driver.execute_script("arguments[0].scrollIntoView(true);", radio_btn)
        driver.execute_script("arguments[0].click();", radio_btn)
        action.wait_for_ajax()

        # API call for this location's preferences
        print(location_ids[i-1])
        loc_api_resp = requests.get(f"{Base_url}/v1/location/preference/{location_ids[i-1]}/get", headers=headers)
        if loc_api_resp.status_code != 200:
            raise Exception(f"Location API failed with status {loc_api_resp.status_code}")

        print("Full API Response:", loc_api_resp.json())

        # Go to "Home" then "Settings"
        action.wait_after_action(
            lambda: action.safe_click((By.XPATH, "(//button[@class='mat-tooltip-trigger py-3 optsel'])[1]")),
            wait_type="ajax"
        )

        action.wait_after_action(
            lambda: action.safe_click((By.XPATH, "(//button[@class='mat-tooltip-trigger py-3 optsel'])[5]")),
            wait_type="ajax"
        )

        try:
            api_json = loc_api_resp.json()
            app_notify_value = api_json["data"]["app_notify"]
            enabled_flag = app_notify_value.split("$$")[0]  # API flag before $$ if exists

            # Wait for toggle input
            toggle_input = action.wait_for_presence(
                (By.XPATH, "//mat-slide-toggle//input[@type='checkbox']"),
                timeout=20
            )

            # Read attributes
            aria_checked = toggle_input.get_attribute("aria-checked")
            toggle_label = toggle_input.find_element(By.XPATH, "./ancestor::mat-slide-toggle")
            toggle_classes = toggle_label.get_attribute("class")

            # Debug print
            print(f"[DEBUG] aria-checked: {aria_checked}, toggle_classes: {toggle_classes}")

            # UI state check
            is_enabled_in_ui = (aria_checked and aria_checked.lower() == "true") or ("mat-checked" in toggle_classes)

            # Compare API vs UI
            if enabled_flag == "1":
                if is_enabled_in_ui:
                    print("✅ app_notify toggle is ENABLED in UI and API matches")
                else:
                    print("❌ app_notify toggle is NOT enabled in UI but API says enabled")
            else:
                if not is_enabled_in_ui:
                    print("✅ app_notify toggle is DISABLED in UI and API matches")
                else:
                    print("❌ app_notify toggle is ENABLED in UI but API says disabled")

        except Exception as e:
            print(f"⚠️ Error checking app_notify toggle: {e}")

        # Reopen profile menu for next location
        action.wait_after_action(
            lambda: action.safe_click((By.CSS_SELECTOR, "#Icon_awesome-user-circle")),
            wait_type="ajax"
        )

    print("\n🎯 NOTIFY ME VALIDATION COMPLETED")
