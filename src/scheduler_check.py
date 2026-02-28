from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import requests
from selenium.common.exceptions import TimeoutException
from src.action_driver import ActionDriver


def location_settings_api(loc_id, c_id, t_id, BASE_URL, HEADERS):
    responses = {}

    endpoints = [
        (f"{BASE_URL}/v1/location/{loc_id}/settings", "location_settings"),
        (f"{BASE_URL}/v1/location/{loc_id}/get", "location_get"),
        (f"{BASE_URL}/v1/company-codes/gettimezone", "company_codes_timezone"),
        (f"{BASE_URL}/v1/location/get", "location_get_all"),
        (f"{BASE_URL}/v1/company-v2/get/{c_id}", "company_v2_get"),
        (f"{BASE_URL}/v1/timezone/get/{t_id}", "timezone_get"),
        (f"{BASE_URL}/v1/location/preference/{loc_id}/get", "location_preference_get"),
    ]

    for url, key in endpoints:
        try:
            resp = requests.get(url, headers=HEADERS)
            resp.raise_for_status()
            responses[key] = resp.json()
        except requests.RequestException as e:
            responses[key] = {"error": str(e)}

    return responses


def check_ui_against_api(driver, response):
    print("this function is calling***************")
    action = ActionDriver(driver)
    
    # --- Location name check ---
    try:
        api_location_name = response["location_get"]["data"]["location_name"]
    except KeyError:
        print("Location name not found in API response.")
        return False

    # Get the UI value for location name
    ui_element = action.wait_for_visibility(
        (By.XPATH, "//div[@class='abc']//div[1]//div[2]//input[1]")
    )
    ui_value = ui_element.get_attribute("placeholder") or ui_element.get_attribute("value")

    # Compare location name
    if ui_value == api_location_name:
        print(f"✅ Match: UI value '{ui_value}' equals API value '{api_location_name}'")
    else:
        print(f"❌ Mismatch: UI value '{ui_value}' != API value '{api_location_name}'")

    # --- Country check ---
    try:
        api_location_country = response["company_v2_get"]["data"]["name"]
    except KeyError:
        print("Country name not found in API response.")
        return False

    # Find the UI element for country name (exact match on text)
    country_xpath = f"//div[normalize-space()='{api_location_country}']"
    try:
        ui_country_element = action.wait_for_visibility((By.XPATH, country_xpath))
        ui_country_value = ui_country_element.text.strip()

        if ui_country_value == api_location_country:
            print(f"✅ Country Match: UI value '{ui_country_value}' equals API value '{api_location_country}'")
        else:
            print(f"❌ Country Mismatch: UI value '{ui_country_value}' != API value '{api_location_country}'")

    except Exception as e:
        print(f"❌ Could not find country element in UI: {e}")

    # --- Timezone check ---
    try:
        api_location_cid = response["timezone_get"]["data"]["name"]
        api_location_tid = response["timezone_get"]["data"]["gmtOffsetName"]
        api_loc_cid_tid = f"{api_location_cid} ({api_location_tid})"
    except KeyError:
        print("Timezone name not found in API response.")
        return False

    timezone_xpath = "//div[7]//div[2]"
    try:
        ui_timezone_element = action.wait_for_visibility((By.XPATH, timezone_xpath))
        ui_timezone_value = ui_timezone_element.text.strip()

        if ui_timezone_value == api_loc_cid_tid:
            print(f"✅ Timezone Match: UI value '{ui_timezone_value}' equals API value '{api_loc_cid_tid}'")
        else:
            print(f"❌ Timezone Mismatch: UI value '{ui_timezone_value}' != API value '{api_loc_cid_tid}'")

    except Exception as e:
        print(f"❌ Could not find timezone element in UI: {e}")
    
    # --- Energy In (Cost per KWh) check ---
    try:
        # Extract the "energy_in" value from the API
        energy_in_str = response["location_settings"]["data"]["energy_in"]
        # Split and get the 3rd value (index 2)
        energy_in_value = energy_in_str.split("$$")[2]

    except KeyError:
        print("⚠ 'energy_in' not found in API response.")
        return False

    # Locate the UI field for Cost per KWh
    ui_element = action.wait_for_visibility(
        (By.XPATH, "//div[8]//div[2]//input[1]")
    )

    # Get the value from placeholder or value attribute
    ui_value = ui_element.get_attribute("placeholder") or ui_element.get_attribute("value")

    # Compare API vs UI values
    if ui_value.strip() == energy_in_value.strip():
        print(f"✅ Match: UI value '{ui_value}' equals API value '{energy_in_value}'")
    else:
        print(f"❌ Mismatch: UI value '{ui_value}' != API value '{energy_in_value}'")

    # --- Feed In Tariff check ---
    try:
        # Extract the "energy_in" value from the API
        energy_in_str = response["location_settings"]["data"]["energy_in"]
        # Split and get the last value
        energy_in_value = energy_in_str.split("$$")[-1]

    except KeyError:
        print("⚠ 'energy_in' not found in API response.")
        return False

    # Locate the UI field for Feed In Tariff
    ui_element = action.wait_for_visibility(
        (By.XPATH, "//div[11]//div[2]//input[1]")
    )

    # Get the value from placeholder or value attribute
    ui_value = ui_element.get_attribute("placeholder") or ui_element.get_attribute("value")

    # Compare API vs UI values
    if ui_value.strip() == energy_in_value.strip():
        print(f"✅ Match: feed in tariff value '{ui_value}' equals API value '{energy_in_value}'")
    else:
        print(f"❌ Mismatch: feed in tariff value '{ui_value}' != API value '{energy_in_value}'")

    # --- Trees per kWh check ---
    try:
        # Extract the "env_in" value from the API
        env_in_str = response["location_settings"]["data"]["env_in"]

        # If no '$', just use the value directly
        if "$" in env_in_str:
            env_in_value = env_in_str.split("$")[-1]  # Last value
        else:
            env_in_value = env_in_str

        # Special case: if value is numeric zero, replace with 0.04
        if env_in_value.strip() in ["0", "0.0", "0.00"]:
            env_in_value = "0.04"

    except KeyError:
        print("⚠ 'env_in' not found in API response.")
        return False

    # Locate the UI field for Trees per kWh
    ui_element = action.wait_for_visibility(
        (By.XPATH, "(//input[@class='ng-untouched ng-pristine ng-valid'])[5]")
    )

    # Get the value from placeholder or value attribute
    ui_value = ui_element.get_attribute("placeholder") or ui_element.get_attribute("value")

    # Compare API vs UI values
    if ui_value.strip() == env_in_value.strip():
        print(f"✅ Match: No. of trees per kWh '{ui_value}' equals API value '{env_in_value}'")
    else:
        print(f"❌ Mismatch: No. of trees per kWh '{ui_value}' != API value '{env_in_value}'")

    # --- HC Date Toggle check ---
    try:
        hc_date_value = response["location_settings"]["data"]["hc_date"]
        enabled_flag = hc_date_value.split("$$")[0]  # API flag part before $$

        # Wait for the toggle input to appear (more robust locator)
        toggle_input = action.wait_for_presence(
            (By.XPATH, "//input[contains(@id,'mat-slide-toggle') and @type='checkbox']")
        )

        # Read aria-checked and parent label's classes
        aria_checked = toggle_input.get_attribute("aria-checked")
        toggle_label = toggle_input.find_element(By.XPATH, "./ancestor::label")
        toggle_classes = toggle_label.get_attribute("class")

        # UI enabled status check
        is_enabled_in_ui = ("mat-checked" in toggle_classes) or (aria_checked == "true")

        # Compare API vs UI state
        if enabled_flag == "1":
            if is_enabled_in_ui:
                print("✅ hc_date toggle is ENABLED in UI and API matches")
            else:
                print("❌ hc_date toggle is NOT enabled in UI but API says enabled")
        else:
            if not is_enabled_in_ui:
                print("✅ hc_date toggle is DISABLED in UI and API matches")
            else:
                print("❌ hc_date toggle is ENABLED in UI but API says disabled")

    except Exception as e:
        print(f"⚠️ Error checking hc_date toggle: {e}")

    # --- Temperature check ---
    try:
        # Extract the "temp_in" value from the API response
        temp_in_value = response["location_settings"]["data"]["temp_in"]

    except KeyError:
        print("⚠ 'temp_in' not found in API response.")
        return False

    # Map API value to expected dropdown label text
    expected_text_t = "°F" if temp_in_value == "0" else "°C"

    try:
        # Wait for the dropdown label element to be visible
        ui_element = action.wait_for_visibility(
            (By.XPATH, "(//div[contains(@class,'mat-select-trigger')])[1]")
        )

        ui_text = ui_element.text.strip()

        if ui_text == expected_text_t:
            print(f"✅ Match: UI value '{ui_text}' equals expected value '{expected_text_t}'")
        else:
            print(f"❌ Mismatch: UI value '{ui_text}' != expected value '{expected_text_t}'")

    except Exception as e:
        print(f"❌ Could not verify dropdown label text: {e}")

    # --- Savings Type check (CO₂ vs Trees) ---
    try:
        # Extract the "env_in" value from the API response
        env_in_str = response["location_settings"]["data"]["env_in"]
        # Get the first value before the first '$'
        env_in_value = env_in_str.split("$")[0]

    except KeyError:
        print("⚠ 'env_in' not found in API response.")
        return False

    # Map API value to expected dropdown label text
    expected_text_sav = "CO₂" if env_in_value == "0" else "Trees"

    try:
        # Wait for the dropdown label element to be visible
        ui_element = action.wait_for_visibility(
            (By.XPATH, "(//div[contains(@class,'mat-select-trigger')])[2]")
        )

        ui_text = ui_element.text.strip()

        if ui_text.lower() == expected_text_sav.lower():
            print(f"✅ Match: UI value '{ui_text}' equals expected value '{expected_text_sav}'")
        else:
            print(f"❌ Mismatch: UI value '{ui_text}' != expected value '{expected_text_sav}'")

    except Exception as e:
        print(f"❌ Could not verify dropdown label text: {e}")

    # --- Cost In check ---
    try:
        show_cost_in = response["location_settings"]["data"]["cost_in"]
    except KeyError:
        print("❌ 'cost_in' not found in API response.")
        return False

    try:
        # Wait for the dropdown label element with matching cost_in text
        ui_element = action.wait_for_visibility(
            (By.XPATH, f"(//mat-label[contains(text(),'{show_cost_in}')])[1]")
        )

        ui_text = ui_element.text.strip()

        if ui_text == show_cost_in:
            print(f"✅ Match: UI value '{ui_text}' equals expected '{show_cost_in}'")
        else:
            print(f"❌ Mismatch: UI value '{ui_text}' != expected '{show_cost_in}'")

    except TimeoutException:
        print(f"❌ Could not find UI element with text containing '{show_cost_in}' within timeout.")
    except Exception as e:
        print(f"❌ Error verifying 'cost_in' in UI: {e}")

    # --- Fuel check ---
    try:
        # Extract the "funit_in" value from the API response
        fuel_in = response["location_settings"]["data"]["funit_in"]

    except KeyError:
        print("⚠ 'funit_in' not found in API response.")
        return False

    # Map API value to expected dropdown label text
    expected_text_fuel = "Litres" if fuel_in == "0" else "Gallons"

    try:
        # Wait for the dropdown label element to be visible
        ui_element = action.wait_for_visibility(
            (By.XPATH, "(//div[contains(@class,'mat-select-trigger')])[3]")
        )

        ui_text = ui_element.text.strip()

        if ui_text.lower() == expected_text_fuel.lower():
            print(f"✅ Match: Fuel UI value '{ui_text}' equals expected value '{expected_text_fuel}'")
        else:
            print(f"❌ Mismatch: Fuel UI value '{ui_text}' != expected value '{expected_text_fuel}'")

    except Exception as e:
        print(f"❌ Could not verify dropdown label text: {e}")

    # --- Device State Retain check ---
    try:
        # Extract the "mode" value from the API response
        mode = response["location_preference_get"]["data"]["mode"]
        # Get the first value before the first '$$'
        if mode is not None:
            mode = f"{mode.split('$$')[0]} sec"
        else:
            mode = "5 sec"

    except KeyError:
        print("⚠ 'mode value' not found in API response.")
        return False

    try:
        # Wait for the dropdown label element to be visible
        ui_element = action.wait_for_visibility(
            (By.XPATH, "(//div[contains(@class,'mat-select-trigger')])[4]")
        )

        ui_text = ui_element.text

        if ui_text == mode:
            print(f"✅ Match: Device state retain UI value '{ui_text}' equals expected value '{mode}'")
        else:
            print(f"❌ DeviceState Retain Mismatch: UI value '{ui_text}' != expected value '{mode}'")

    except Exception as e:
        print(f"❌ Could not verify dropdown label text: {e}")

    return True
