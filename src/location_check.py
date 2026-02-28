from src.scheduler_check import location_settings_api, check_ui_against_api
from src.action_driver import ActionDriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import requests


def location_ids_count(Base_url, headers):
    loc_api_resp = requests.get(f"{Base_url}/v1/location/get", headers=headers)
    if loc_api_resp.status_code != 200:
        raise Exception(f"Location API failed with status {loc_api_resp.status_code}")

    data = loc_api_resp.json()["data"]

    api_locations = [loc["location_name"].strip() for loc in data]
    location_ids = [loc["location_id"].strip() for loc in data]
    country_ids = [loc["country_id"] for loc in data]
    timezone_ids = [loc["timezone_id"] for loc in data]
    sort_ids = [loc.get("sortid") or loc.get("sort_id", 0) for loc in data]

    # Sort all lists based on sort_ids
    combined = sorted(zip(sort_ids, api_locations, location_ids, country_ids, timezone_ids), key=lambda x: x[0])
    sort_ids_sorted, api_locations_sorted, location_ids_sorted, country_ids_sorted, timezone_ids_sorted = zip(*combined)

    length_loc = len(api_locations_sorted)

    print("Sorted Locations:", api_locations_sorted)
    print("Sorted IDs:", location_ids_sorted)
    print("Sorted sort_ids:", sort_ids_sorted)

    return list(api_locations_sorted), list(location_ids_sorted), list(country_ids_sorted), list(timezone_ids_sorted), length_loc, list(sort_ids_sorted)


def check_locations(driver, headers, Base_url):
    action = ActionDriver(driver)
    
    # Fetch location list from API
    api_locations, location_ids, country_ids, timezone_ids, length_loc, sort_ids = location_ids_count(Base_url, headers)
    
    # === Check each location in UI ===
    missing_in_ui = []
    for loc_name in api_locations:
        xpath = f"//div[@class='scroll-text'][normalize-space()='{loc_name}']"
        try:
            action.wait_for_presence((By.XPATH, xpath))
            print(f"Found in UI: {loc_name}")
        except:
            print(f"Missing in UI: {loc_name}")
            missing_in_ui.append(loc_name)

    # === Final result ===
    if not missing_in_ui:
        print("All API locations are present in the UI!")
    else:
        print("Missing locations in UI:", missing_in_ui)

    # Select testing radio
    initial_location = action.wait_for_presence(
        (By.XPATH, "(//span[@class='mat-radio-outer-circle'])[1]")
    )

    # Scroll into view & click via JS
    driver.execute_script("arguments[0].scrollIntoView(true);", initial_location)
    driver.execute_script("arguments[0].click();", initial_location)
    action.wait_for_ajax()

    # Click next
    action.wait_after_action(
        lambda: action.safe_click((By.CSS_SELECTOR, ".mat-button-wrapper")),
        wait_type="ajax"
    )

    # Click Energy button
    action.wait_after_action(
        lambda: action.safe_click((By.XPATH, "//button[.//mat-icon[@data-mat-icon-name='energy_line']]")),
        wait_type="ajax"
    )
    
    # Navigate to Home
    action.wait_after_action(
        lambda: action.safe_click((By.XPATH, "(//button[@class='mat-tooltip-trigger py-3 optsel'])[1]")),
        wait_type="ajax"
    )

    # Navigate to Security
    action.wait_after_action(
        lambda: action.safe_click((By.XPATH, "(//button[@class='mat-tooltip-trigger py-3 optsel'])[4]")),
        wait_type="ajax"
    )

    # Navigate to Settings
    action.wait_after_action(
        lambda: action.safe_click((By.XPATH, "(//button[@class='mat-tooltip-trigger py-3 optsel'])[5]")),
        wait_type="ajax"
    )

    # Click on profile name tab
    action.wait_after_action(
        lambda: action.safe_click((By.XPATH, "//div[@routerlink='./profile']")),
        wait_type="navigation"
    )
    
    r = requests.get(f"{Base_url}/v1/user/details", headers=headers)
    if r.status_code != 200:
        raise Exception(f"API failed with status {r.status_code}")

    data = r.json()["data"]
    print(data)
    name = data["name"].strip()
    email_id = data["email_id"].strip()

    # === Name check ===
    el = action.wait_for_presence((By.XPATH, "//input[@type='text']"))
    ui_name = (el.get_attribute("value") or el.get_attribute("placeholder") or "").strip()
    assert ui_name == name, f"Name mismatch! API: '{name}', UI: '{ui_name}'"
    print("API name matches with profile name", ui_name)

    # === Email check ===
    action.safe_click((By.XPATH, "//*[name()='circle' and @id='Ellipse_210']"))

    def wait_for_non_empty_email(driver):
        try:
            el = driver.find_element(By.CSS_SELECTOR, "div.col-6.en mat-label")
            if el.text.strip():
                return el
        except:
            return False
        return False

    email_label = WebDriverWait(driver, 10).until(wait_for_non_empty_email)
    ui_email = email_label.text.strip()

    if not ui_email:
        print("UI email label text is empty. Outer HTML for debugging:")
        print(email_label.get_attribute("outerHTML"))

    assert ui_email == email_id, f"Email mismatch! API: '{email_id}', UI: '{ui_email}'"
    print("API email matches UI email.", ui_email)

    # Navigate to Location Settings
    action.wait_after_action(
        lambda: action.safe_click((By.XPATH, "//div[@routerlink='./locationsetting']")),
        wait_type="navigation"
    )

    missing_in_ui = []
    for loc_name in api_locations:
        xpath = f"(//div[contains(text(),'{loc_name}')])[1]"
        try:
            WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.XPATH, xpath))
            )
            print(f"Found in UI: {loc_name}")
        except:
            print(f"Missing in UI: {loc_name}")
            missing_in_ui.append(loc_name)

    # === Final result ===
    if not missing_in_ui:
        print("All API locations are present in the UI!")
    else:
        print("Missing locations in UI:", missing_in_ui)

    res = {}
    # Loop through locations and check API vs UI
    for loc_name, loc_id, coun_id, time_id in zip(api_locations, location_ids, country_ids, timezone_ids):
        try:
            xpath = f"(//div[contains(text(),'{loc_name}')])[1]"
            action.wait_after_action(
                lambda: action.safe_click((By.XPATH, xpath)),
                wait_type="navigation"
            )

            res = location_settings_api(loc_id, coun_id, time_id, Base_url, headers)
            print("The Response is????????????", res)

            check_ui_against_api(driver, res)

            driver.back()
            WebDriverWait(driver, 20).until(
                EC.presence_of_element_located((By.XPATH, xpath))
            )

        except Exception as e:
            print(f"Could not click on location '{loc_name}': {e}")

    print("\n🎯 LOCATION VALIDATION COMPLETED")
