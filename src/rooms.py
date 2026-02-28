import requests
import time
from src.location_check import location_ids_count
from src.action_driver import ActionDriver
from selenium.webdriver.common.by import By

def get_room_ids_per_location(Base_url, headers):
    """
    Fetches all locations and returns a dictionary of location_name -> list of room_ids.
    """
    api_locations, location_ids, _, _, length_loc, _ = location_ids_count(Base_url, headers)
    location_room_ids = {}

    for i in range(length_loc):
        loc_name = api_locations[i]
        loc_id = location_ids[i]

        try:
            # API call for this location's rooms/devices
            resp = requests.get(f"{Base_url}/v1/location/device/{loc_id}/all", headers=headers)
            resp.raise_for_status()
            rooms_data = resp.json().get("data", {})

            # Extract room_ids as a list
            room_ids_str = rooms_data.get("room_ids", "")
            room_ids_list = room_ids_str.split(",") if room_ids_str else []

            location_room_ids[loc_name] = room_ids_list

        except requests.RequestException as e:
            print(f"Failed to get room_ids for {loc_name} ({loc_id}): {e}")
            location_room_ids[loc_name] = []

    return location_room_ids


def get_rooms_count(Base_url, headers):
    """
    Returns a dictionary of location_name -> number of rooms
    """
    location_room_ids = get_room_ids_per_location(Base_url, headers)
    rooms_count_dict = {loc: len(rooms) for loc, rooms in location_room_ids.items()}

    # Print counts
    for loc, count in rooms_count_dict.items():
        print(f"Location: {loc}, Rooms Count: {count}")

    return rooms_count_dict


def room_click_count(driver, Base_url, headers):
    """
    Loops through each location, selects it in the UI, and clicks on each room dynamically
    based on room_ids count from the API.
    """
    action = ActionDriver(driver)

    # Select the first location initially
    initial_location = action.wait_for_presence((By.XPATH, "(//span[@class='mat-radio-outer-circle'])[1]"))
    driver.execute_script("arguments[0].scrollIntoView(true);", initial_location)
    driver.execute_script("arguments[0].click();", initial_location)
    time.sleep(1)

    # Click next
    action.wait_after_action(lambda: action.safe_click((By.CSS_SELECTOR, ".mat-button-wrapper")), wait_type="ajax")
    time.sleep(1)

    # Open profile menu
    action.wait_after_action(lambda: action.safe_click((By.CSS_SELECTOR, "#Icon_awesome-user-circle")), wait_type="ajax")
    time.sleep(1)

    # Get sorted locations
    api_locations, location_ids, _, _, length_loc, _ = location_ids_count(Base_url, headers)

    for i in range(length_loc):
        loc_name = api_locations[i]
        loc_id = location_ids[i]

        print(f"\n###### Location: {loc_name}, ID: {loc_id}")

        # Ensure profile menu is open before selecting location
        # (Except for the first iteration where it's already open)
        if i > 0:
            action.wait_after_action(lambda: action.safe_click((By.CSS_SELECTOR, "#Icon_awesome-user-circle")), wait_type="ajax")
            time.sleep(1)

        # Select location radio button
        radio_btn_xpath = f"(//span[@class='mat-radio-outer-circle'])[{i + 1}]"
        radio_btn = action.wait_for_presence((By.XPATH, radio_btn_xpath))
        driver.execute_script("arguments[0].scrollIntoView(true);", radio_btn)
        driver.execute_script("arguments[0].click();", radio_btn)
        time.sleep(1)

        # API call to get rooms for this location
        try:
            print(f"📡 Fetching rooms for {loc_name} (ID: {loc_id})...")
            rooms_resp = requests.get(f"{Base_url}/v1/location/device/{loc_id}/all", headers=headers)
            rooms_resp.raise_for_status()
            
            # Print full response for debugging (only if needed)
            # print(f"DEBUG: Response Text for {loc_name}: {rooms_resp.text}")
            
            full_json = rooms_resp.json()
            rooms_data = full_json.get("data")
            
            room_ids_list = []
            
            if rooms_data is None:
                print(f"⚠️ 'data' field is null in API response for {loc_name}")
            else:
                room_details = []
                rooms_list = []
                
                if isinstance(rooms_data, dict):
                    rooms_list = rooms_data.get("rooms", [])
                elif isinstance(rooms_data, list):
                    rooms_list = rooms_data

                if rooms_list:
                    # Filter for rooms where is_default is False
                    for r in rooms_list:
                        if isinstance(r, dict):
                            # Only count if is_default is False (as per user requirement)
                            if r.get("is_default") is False:
                                rid = r.get("room_id") or r.get("device_id") or "No ID"
                                rname = r.get("room_name") or r.get("device_name") or "No Name"
                                room_details.append(f"{rname} (ID: {rid})")
                    
                    print(f"🆔 Rooms found in API (is_default=false) for {loc_name}:")
                    for detail in room_details:
                        print(f"   - {detail}")
                
                # Fallback for comma-separated room_ids if no rooms list found
                if not room_details and isinstance(rooms_data, dict):
                    room_ids_raw = rooms_data.get("room_ids", "")
                    if isinstance(room_ids_raw, str) and room_ids_raw.strip():
                        room_details = [f"Room ID: {r.strip()}" for r in room_ids_raw.split(",") if r.strip()]

                room_ids_list = room_details
            
            print(f"📊 Location: {loc_name} | API Room Count (filtered): {len(room_ids_list)}")

        except requests.RequestException as e:
            print(f"❌ API Request failed for {loc_name}: {e}")
            room_ids_list = []
        except Exception as e:
            print(f"❌ Error parsing rooms for {loc_name}: {e}")
            import traceback
            traceback.print_exc()
            room_ids_list = []

        # Navigate to Home -> Devices
        # Home button
        action.wait_after_action(lambda: action.safe_click((By.XPATH, "(//button[@class='mat-tooltip-trigger py-3 optsel'])[1]")), wait_type="ajax")
        time.sleep(1)
        # Devices button (user manually changed to index 2)
        action.wait_after_action(lambda: action.safe_click((By.XPATH, "(//button[@class='mat-tooltip-trigger py-3 optsel'])[2]")), wait_type="ajax")
        print(f"⏳ Waiting for devices to load for {loc_name}...")
        time.sleep(3) 

        # Count actual headers in UI (Visible only)
        all_headers = driver.find_elements(By.XPATH, "//mat-expansion-panel-header[starts-with(@id,'mat-expansion-panel-header')]")
        room_headers = [h for h in all_headers if h.is_displayed()]
        ui_room_count = len(room_headers)
        
        print(f"📊 Location: {loc_name} | API Room Count: {len(room_ids_list)} | UI Room Count: {ui_room_count}")

        if ui_room_count == 0:
            print(f"ℹ️ No room headers found in UI for location: {loc_name}")
            # Reset UI and continue to next location
            action.wait_after_action(lambda: action.safe_click((By.XPATH, "(//button[@class='mat-tooltip-trigger py-3 optsel'])[1]")), wait_type="ajax")
            time.sleep(1)
            continue

        # Click on each room dynamically based on UI count
        print(f"🚀 Clicking through {ui_room_count} rooms found in UI for {loc_name}...")
        for idx in range(1, ui_room_count + 1):
            try:
                room_header_xpath = f"(//mat-expansion-panel-header[starts-with(@id,'mat-expansion-panel-header')])[{idx}]"
                room_header = action.wait_for_presence((By.XPATH, room_header_xpath), timeout=10)
                
                # Scroll and click
                driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", room_header)
                time.sleep(0.5)
                driver.execute_script("arguments[0].click();", room_header)
                
                print(f"   ∟ ✅ Clicked Room {idx} for Location {loc_name}")
                time.sleep(1) 
            except Exception as e:
                print(f"   ∟ ❌ Failed to click Room {idx} for {loc_name}: {e}")

        # After all rooms for this location are clicked, return to Home to reset the UI state
        print(f"🏠 Completed rooms for {loc_name}. Returning to Home...")
        action.wait_after_action(lambda: action.safe_click((By.XPATH, "(//button[@class='mat-tooltip-trigger py-3 optsel'])[1]")), wait_type="ajax")
        time.sleep(1)
