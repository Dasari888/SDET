import requests
import json
import sys



BASE_URL = "https://boneplus-api.b1automation.com"  

LOGIN_API = f"{BASE_URL}/v1/user/login"
TOKEN_API = f"{BASE_URL}/v1/oauth/token"

email_id = "divya.a@blazEautomation.com"
password= "8fdaedc41c8dcd07d25325a97b1992a186f71be7257d5ab02e32d9b155145bef"
app_token = "eHesWIAsSueE_ERf1JmB5R:APA91bFsj1CytZwGe6xF5mYzjVNlBgR4CkcSVOe96aTwSuvbD9Fr1TTWdugA3TLP0sYEJDMXySxQj5PW5WJ7Dr4-aCb4wB81SmxtuRR0SenQwMb8yAVybJE"

CLIENT_ID = "ef19253e80c4be4ace2e03612"
CLIENT_SECRET = "ee6f26b1ff78c74898c99cfc64f0e7015f564822"


def login_and_get_code():
    print("\n🔐 Calling Login API...")
    
    payload = {
        "email_id": email_id,
        "password": password,
        "app_token": app_token
    }
    headers = {
        "Content-Type": "application/json",
        "Accept": "*/*",
        "lang": "en"
    }
    
    response = requests.post(
        LOGIN_API,
        headers=headers,
        data=json.dumps(payload),
        auth=(CLIENT_ID, CLIENT_SECRET),
        timeout=15
    )
    
    print("📥 Status Code:", response.status_code)
    print("📥 Raw Response:", response.text)
    
    if response.status_code != 200:
        sys.exit("❌ Login API HTTP failure")
    
    data = response.json()
    if data.get("status") != 1:
        sys.exit(f"❌ Login failed: {data.get('message')}")
    
    if "code" not in data:
        sys.exit("❌ Authorization code not found in response")
    
    print("✅ Authorization Code:", data["code"])
    return data["code"]

def exchange_code_for_token(auth_code):
    print("\n🔁 Calling Token API...")
    
    headers = {
        "Accept": "*/*",
        "grant_type": "code",
        "client_id": CLIENT_ID,
        "code": auth_code,
        "client_secret": CLIENT_SECRET
    }
    
    response = requests.post(TOKEN_API, headers=headers, timeout=15)
    
    print("📥 Status Code:", response.status_code)
    print("📥 Raw Response:", response.text)
    
    if response.status_code != 200:
        sys.exit("❌ Token API HTTP failure")
    
    data = response.json()
    if data.get("status") != 1:
        sys.exit(f"❌ Token API failed: {data.get('message')}")
    
    return data

if __name__ == "__main__":
    auth_code = login_and_get_code()
    token_data = exchange_code_for_token(auth_code)
    
    print("\n🎉 ACCESS TOKEN :", token_data.get("access_token"))
    print("🔄 REFRESH TOKEN:", token_data.get("refresh_token"))