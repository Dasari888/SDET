import { test, expect } from '../../fixtures/test-fixtures';
import { BASE_URL, USERNAME, PASSWORD } from '../../utils/test-data';
import { UserAPI } from '../../src/user';
import { LocationAPI } from '../../src/SettingsApi';
import { ProfilePage } from '../../pages/Settingspage';


test.describe("Verify Settings Tab in the USER Dashboard",async()=>{




test("validate Profile Name", async ({ page, loginPage, profilePage,request}) => {

  await page.goto(BASE_URL);
  const headers = await loginPage.loginAndGetToken(USERNAME, PASSWORD);
  console.log('Starting profile validation');
    await profilePage.selectInitialLocation();
    await profilePage.navigateToSettings();

    const uiName = await profilePage.getProfileName();
  console.log(`UI Name: ${uiName}`);
  const userAPI = new UserAPI(request);
  const userData = await userAPI.getUserDetails(BASE_URL, headers);
  const apiName = userData.name.trim();
  console.log(`API Name: ${apiName}`);
  await expect(uiName).toBe(apiName);
});

test ("validate Profile Email", async ({ page, loginPage, profilePage,request}) => {

  await page.goto(BASE_URL);
    const headers = await loginPage.loginAndGetToken(USERNAME, PASSWORD);
    console.log('Starting profile email validation');
    await profilePage.selectInitialLocation();
    await profilePage.navigateToSettings();
    const uiEmail = await profilePage.getProfileEmail();
    console.log(`UI Email: ${uiEmail}`);
    const userAPI = new UserAPI(request);
    const userData = await userAPI.getUserDetails(BASE_URL, headers);
    const apiEmail = userData.email_id.trim();
    console.log(`API Email: ${apiEmail}`);
    await expect(uiEmail).toBe(apiEmail);
});




test("validate Location Name in Location settings tab", async ({ page, request, loginPage, profilePage }) => {

  await page.goto(BASE_URL);

  const headers = await loginPage.loginAndGetToken(USERNAME, PASSWORD);
  const locationAPI = new LocationAPI(request);

  await profilePage.selectInitialLocation();
  await profilePage.navigateToSettings();
  await profilePage.locationsettingsloc();

  const locations = await locationAPI.getLocations(BASE_URL, headers);
  console.log(" locationssss", locations);

  for (const loc of locations) {
    console.log(` Validating location: ${loc.name} (ID: ${loc.id})`);
     await profilePage.openLocationFromSettings(loc.id);
    // let uurl=`${BASE_URL}/#/dashboard/settings/locationsetting/${loc.id}/locationsetting1`
    // console.log(uurl);
    // await page.goto(uurl)
   
     await page.waitForLoadState('networkidle'); 
     await page.waitForLoadState('domcontentloaded'); // Wait for UI to update with location details

    

    const locationData = await locationAPI.getLocation(BASE_URL, headers, loc.id);
    const uiValue = await profilePage.getLocationName();

    await expect(uiValue).toBe(locationData.location_name.trim());
    console.log(` Expected: ${locationData.location_name.trim()} | UI: ${uiValue}`);
    console.log(` Location name validated for ${loc.name}`);

    await profilePage.goBackToLocationList();
  }

});


test("validare location Country in Location settings tab", async ({ page, request, loginPage, profilePage }) => {

  await page.goto(BASE_URL);  
  const headers = await loginPage.loginAndGetToken(USERNAME, PASSWORD);
  const locationAPI = new LocationAPI(request);
  await profilePage.selectInitialLocation();
  await profilePage.navigateToSettings();
  await profilePage.locationsettingsloc();
  const locations = await locationAPI.getLocations(BASE_URL, headers);
  console.log(" locationssss", locations);

  for (const loc of locations) {
    console.log(` Validating location: ${loc.name} (ID: ${loc.id})`);
    await profilePage.openLocationFromSettings(loc.id);
      await page.waitForLoadState('networkidle');
      await page.waitForLoadState('domcontentloaded'); // Wait for UI to update with location details
       const locationcountryData = await locationAPI.getCompany(BASE_URL, headers, loc.countryId);
       console.log("locationcountryData", locationcountryData);
   
    const uiValue = await profilePage.getCountry(locationcountryData.name);
    await expect(uiValue).toBe(locationcountryData.name.trim());
    console.log(` Expected Country: ${locationcountryData.name.trim()} | UI Country: ${uiValue}`);
    console.log(` Location country validated for ${loc.name}`);
    await profilePage.goBackToLocationList();
  }});

  test("validate location Timezone in Location settings tab", async ({ page, request, loginPage, profilePage }) => {
  await page.goto(BASE_URL);
  const headers = await loginPage.loginAndGetToken(USERNAME, PASSWORD);
  const locationAPI = new LocationAPI(request);
  await profilePage.selectInitialLocation();
  await profilePage.navigateToSettings();
  await profilePage.locationsettingsloc();
  const locations = await locationAPI.getLocations(BASE_URL, headers);
  console.log(`Total Locations: ${locations.length}`);
  for (const loc of locations) {
    console.log(`Validating: ${loc.name}`);
    await profilePage.openLocationFromSettings(loc.id);
    const tzData = await locationAPI.getTimezone(BASE_URL, headers, loc.timezoneId);
    const apiName = tzData?.name;
    const apiOffset = tzData?.gmtOffsetName;
    if (!apiName || !apiOffset) throw new Error(`Timezone API failed for ${loc.name}`);
    const expectedTimezone = `${apiName} (${apiOffset})`;
    const uiValue = await profilePage.verifyTimezone(expectedTimezone);
    console.log(`Expected: ${expectedTimezone} | UI: ${uiValue}`);
    await expect(uiValue).toContain(expectedTimezone);
    await profilePage.goBackToLocationList();
  }
});

test("validate show cost in Location settings tab", async ({ page, request, loginPage, profilePage }) => {
  await page.goto(BASE_URL);
  const headers = await loginPage.loginAndGetToken(USERNAME, PASSWORD);
  const locationAPI = new LocationAPI(request); 
  await profilePage.selectInitialLocation();
  await profilePage.navigateToSettings();
  await profilePage.locationsettingsloc();
  const locations = await locationAPI.getLocations(BASE_URL, headers);
  console.log(" locationssss", locations);
  console.log(`Total Locations: ${locations.length}`);
  for (const loc of locations) {
    console.log(`Validating: ${loc.name}`);
    await profilePage.openLocationFromSettings(loc.id);
    const locationData = await locationAPI.getLocationSettings(BASE_URL, headers, loc.id);
    console.log("locationData", locationData);
    const apiShowCost = locationData.cost_in;
    const uiValue = await profilePage.getEnergyCost(apiShowCost);
    console.log(`Expected show cost: ${apiShowCost} | UI show cost: ${uiValue}`);
    await expect(uiValue).toBe(apiShowCost);
    await profilePage.goBackToLocationList();

  }
});


test ("validate show Show temperature in Location settings tab", async ({ page, request, loginPage, profilePage }) => {
  await page.goto(BASE_URL);  
  const headers = await loginPage.loginAndGetToken(USERNAME, PASSWORD);     
  const locationAPI = new LocationAPI(request);
  await profilePage.selectInitialLocation();
  await profilePage.navigateToSettings();
  await profilePage.locationsettingsloc();
  const locations = await locationAPI.getLocations(BASE_URL, headers);
  console.log(" locationssss", locations);
  console.log(`Total Locations: ${locations.length}`);  
  for (const loc of locations) {

    console.log(`Validating: ${loc.name}`);
    await profilePage.openLocationFromSettings(loc.id);
    const locationData = await locationAPI.getLocationSettings(BASE_URL, headers, loc.id);
    console.log("locationData", locationData);
    const apiShowTemp = locationData.temp_in;
    const expected = apiShowTemp === "0" ? "°F" : "°C";
    const uiValue = await profilePage.getTempUnit(expected);
    console.log(`Expected show temperature: ${expected} | UI show temperature: ${uiValue}`);
    await expect(uiValue).toBe(expected);
    await profilePage.goBackToLocationList();   
  }
});



test ("validate Show environmental savings in location settings tab", async ({ page, request, loginPage, profilePage }) => {
  await page.goto(BASE_URL);
  const headers = await loginPage.loginAndGetToken(USERNAME, PASSWORD);
  const locationAPI = new LocationAPI(request);
  await profilePage.selectInitialLocation();
  await profilePage.navigateToSettings();
  await profilePage.locationsettingsloc();
  const locations = await locationAPI.getLocations(BASE_URL, headers);
  console.log(" locationssss", locations);
  console.log(`Total Locations: ${locations.length}`);
  for (const loc of locations) {
    console.log(`Validating: ${loc.name}`); 
    await profilePage.openLocationFromSettings(loc.id);
    const locationData = await locationAPI.getLocationSettings(BASE_URL, headers, loc.id);
    console.log("locationData", locationData);  
    const apiShowEnvSavings = locationData.env_in;
    console.log(apiShowEnvSavings)
    console.log( apiShowEnvSavings.split('$')[0])
    const expected =  apiShowEnvSavings.split('$')[0] === "0" ? "CO₂" : "Trees";
    console.log(expected)
    const uiValue = await profilePage.getEnvsavingsin();
    console.log(`Expected show environmental savings: ${expected} | UI show environmental savings: ${uiValue}`);
    if (expected === "CO₂") {
      await expect(uiValue).toBe("CO₂");
    } else {
      await expect(uiValue).toBe("Trees");
    }
    await profilePage.goBackToLocationList();   
  } 
});


test ("validate show fuel in the location settings tab", async ({ page, request, loginPage, profilePage }) => {
  await page.goto(BASE_URL);
  const headers = await loginPage.loginAndGetToken(USERNAME, PASSWORD); 
  const locationAPI = new LocationAPI(request);
  await profilePage.selectInitialLocation();
  await profilePage.navigateToSettings();
  await profilePage.locationsettingsloc();
  const locations = await locationAPI.getLocations(BASE_URL, headers);
  console.log(" locationssss", locations);
  console.log(`Total Locations: ${locations.length}`);
  for (const loc of locations) {
    console.log(`Validating: ${loc.name}`);
    await profilePage.openLocationFromSettings(loc.id);
    const locationData = await locationAPI.getLocationSettings(BASE_URL, headers, loc.id);

    console.log("locationData", locationData);
    const apiShowFuel = locationData.funit_in;
    const expected = apiShowFuel === "0" ? "Litres" : "Gallons";
    const uiValue = await profilePage.getFuelUnit();
    console.log(`Expected show fuel: ${expected} | UI show fuel: ${uiValue}`);  

    if (expected === "Litres") {
      await expect(uiValue).toBe("Litres");
    } else {   
      await expect(uiValue).toBe("Gallons");
    }   
    await profilePage.goBackToLocationList();
  }   

});


test ("validate Device state retain time In-sec in location settings tab", async ({ page, request, loginPage, profilePage }) => {
  await page.goto(BASE_URL);
  const headers = await loginPage.loginAndGetToken(USERNAME, PASSWORD); 
  const locationAPI = new LocationAPI(request);
  await profilePage.selectInitialLocation();
  await profilePage.navigateToSettings();
  await profilePage.locationsettingsloc();
  const locations = await locationAPI.getLocations(BASE_URL, headers);
  console.log(" locationssss", locations);
  console.log(`Total Locations: ${locations.length}`);

  
  for (const loc of locations) {
    console.log(`Validating: ${loc.name}`);
    await profilePage.openLocationFromSettings(loc.id);
    const locationData = await locationAPI.getLocationPreferences(BASE_URL, headers, loc.id);
    console.log("locationData", locationData);
    const apiRetainTime = locationData.mode;
    let mode: string;

if (!apiRetainTime || apiRetainTime === "None") {
  mode = "5 sec";
} else {
  mode = `${apiRetainTime.split('$$')[0]} sec`;
}

    const uiValue = await profilePage.getDeviceRetainTime();
    console.log(`Expected Device state retain time: ${mode} | UI Device state retain time: ${uiValue}`);
    await expect(uiValue).toBe(mode);
    await profilePage.goBackToLocationList();
  }   

});


test ("validate cost per kwh in location settings tab", async ({ page, request, loginPage, profilePage }) => {
  await page.goto(BASE_URL);
  const headers = await loginPage.loginAndGetToken(USERNAME, PASSWORD); 
  const locationAPI = new LocationAPI(request);

  await profilePage.selectInitialLocation();
  await profilePage.navigateToSettings();
  await profilePage.locationsettingsloc();
  const locations = await locationAPI.getLocations(BASE_URL, headers);
  console.log(" locationssss", locations);
  console.log(`Total Locations: ${locations.length}`);
  for (const loc of locations) {
    console.log(`Validating: ${loc.name}`);
    await profilePage.openLocationFromSettings(loc.id);
    const locationData = await locationAPI.getLocationSettings(BASE_URL, headers, loc.id);
    console.log("locationData", locationData);
    const apiCostPerKwh = locationData.energy_in;
    const  energy_in_value = apiCostPerKwh.split("$$")[2]
    const uiValue = await profilePage.getCostPerKwh();

    console.log(`Expected cost per kwh: ${energy_in_value} | UI cost per kwh: ${uiValue}`);
    await expect(uiValue).toBe(energy_in_value);
    await profilePage.goBackToLocationList();
  } 

});


test ("validate feed in tariff in location settings tab", async ({ page, request, loginPage, profilePage }) => {
  await page.goto(BASE_URL);
  const headers = await loginPage.loginAndGetToken(USERNAME, PASSWORD);
  const locationAPI = new LocationAPI(request);
  await profilePage.selectInitialLocation();
  await profilePage.navigateToSettings();
  await profilePage.locationsettingsloc();
  const locations = await locationAPI.getLocations(BASE_URL, headers);
  console.log(" locationssss", locations);
  console.log(`Total Locations: ${locations.length}`);
  for (const loc of locations) {
    console.log(`Validating: ${loc.name}`);
    await profilePage.openLocationFromSettings(loc.id);
    const locationData = await locationAPI.getLocationSettings(BASE_URL, headers, loc.id);
    console.log("locationData", locationData);
    const apiFeedInTariff = locationData.energy_in;
    const feed_in_value = apiFeedInTariff.split("$$").slice(-1)[0];
    const uiValue = await profilePage.getFeedInTariff();
    console.log(`Expected feed in tariff: ${feed_in_value} | UI feed in tariff: ${uiValue}`);
    await expect(uiValue).toBe(feed_in_value);
    await profilePage.goBackToLocationList();
  }     
});


// test("validate no of trees per kwh in location settings tab", async ({ page, request, loginPage, profilePage }) => {
//   await page.goto(BASE_URL);
//   const headers = await loginPage.loginAndGetToken(USERNAME, PASSWORD); 
//   const locationAPI = new LocationAPI(request);
//   await profilePage.selectInitialLocation();
//   await profilePage.navigateToSettings();
//   await profilePage.locationsettingsloc();
//   const locations = await locationAPI.getLocations(BASE_URL, headers);
//   console.log(" locationssss", locations);
//   console.log(`Total Locations: ${locations.length}`);
//   for (const loc of locations) {
//     console.log(`Validating: ${loc.name}`);
//     await profilePage.openLocationFromSettings(loc.id);
//     const locationData = await locationAPI.getLocationSettings(BASE_URL, headers, loc.id);
//     console.log("locationData", locationData);
    
//     const apiTreesPerKwh = locationData.env_in;
//     let trees_in_value: string;
//     if (apiTreesPerKwh.includes("$")) {
//       const parts = apiTreesPerKwh.split("$");
//       trees_in_value = parts[parts.length - 1];
//     } else {
//       trees_in_value = apiTreesPerKwh;
//     }
//     if (["0", "0.0", "0.00"].includes(trees_in_value.trim())) {
//       trees_in_value = "0.04";
//     }
//     const uiValue = await profilePage.getTreesPerKwh();
//     console.log(`Expected no of trees per kwh: ${trees_in_value} | UI no of trees per kwh: ${uiValue}`);
//     await expect(uiValue).toBe(trees_in_value);
//     await profilePage.goBackToLocationList();
//   } 
// });



})