import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { Rooms } from '../pages/Rooms';
import { LocationCheck } from '../pages/components/LocationCheck';
import { NotifyMe } from '../src/NotifyMe';
import { SchedulerCheck } from '../src/SchedulerCheck';
import { Forgotpassword } from '../pages/Forgotpassword';
import { Page } from '@playwright/test';
import{ProfilePage}from '../pages/Settingspage';


type MyFixtures = {
    loginPage: LoginPage;
    roomsPage: Rooms;
    locationCheck: LocationCheck;
    notifyMe: NotifyMe;
    schedulerCheck: SchedulerCheck;
    Forgotpassword:  Forgotpassword;
    profilePage: ProfilePage;
};

export const test = base.extend<MyFixtures>({
    loginPage: async ({ page }: { page: Page }, use) => {
        await use(new LoginPage(page));
    },
    roomsPage: async ({ page }: { page: any }, use: any) => {
        await use(new Rooms(page));
    },
    locationCheck: async ({ page }: { page: any }, use: any) => {
        await use(new LocationCheck(page));
    },
    notifyMe: async ({ page }: { page: any }, use: any) => {
        await use(new NotifyMe(page));
    },
    schedulerCheck: async ({ page }: { page: any }, use: any) => {
        await use(new SchedulerCheck(page));
    },
      Forgotpassword: async ({ page }:{ page: any }, use:any) => {
    await use(new Forgotpassword(page));
  },
  profilePage: async ({ page }:{ page: any }, use:any) => {         
    await use(new ProfilePage(page));   
  }
});

export { expect } from '@playwright/test';

















// import { test as base } from '@playwright/test';
// import { LoginPage } from '../pages/LoginPage';
// import { Rooms } from '../pages/Rooms';
// import { LocationCheck } from '../pages/components/LocationCheck';
// import { NotifyMe } from '../src/NotifyMe';
// import { SchedulerCheck } from '../src/SchedulerCheck';
// import { Forgotpassword } from '../pages/Forgotpassword';
// import { Page } from '@playwright/test';
// import { BASE_URL, USERNAME, PASSWORD } from '../utils/test-data';
// import { SettingsPage } from '../pages/Settingspage';
// import { getLocationSettingsAPI } from '../src/SettingsApi';

// type MyFixtures = {
//   loginPage: LoginPage;
//   roomsPage: Rooms;
//   locationCheck: LocationCheck;
//   notifyMe: NotifyMe;
//   schedulerCheck: SchedulerCheck;
//   Forgotpassword: Forgotpassword;
//   SettingsPage: SettingsPage;
//   apiData: any;
// };

// export const test = base.extend<MyFixtures>({
  
//   loginPage: async ({ page }: { page: Page }, use) => {
//     await use(new LoginPage(page));
//   },

//   roomsPage: async ({ page }: { page: any }, use: any) => {
//     await use(new Rooms(page));
//   },

//   locationCheck: async ({ page }: { page: any }, use: any) => {
//     await use(new LocationCheck(page));
//   },

//   notifyMe: async ({ page }: { page: any }, use: any) => {
//     await use(new NotifyMe(page));
//   },

//   schedulerCheck: async ({ page }: { page: any }, use: any) => {
//     await use(new SchedulerCheck(page));
//   },

//   Forgotpassword: async ({ page }: { page: any }, use: any) => {
//     await use(new Forgotpassword(page));
//   },

//   SettingsPage: async ({ page }: { page: any }, use: any) => {
//     await use(new SettingsPage(page));
//   },

// apiData: async ({ page, loginPage }: { page: Page; loginPage: LoginPage }, use:any) => {

//   await page.goto(BASE_URL);

//   const headers = await loginPage.loginAndGetToken(USERNAME, PASSWORD);

//   // 👉 Get all locations
//   const locRes = await page.request.get(`${BASE_URL}/v1/location/get`, {
//     headers
//   });

//   if (!locRes.ok()) {
//     throw new Error(`Location API failed: ${locRes.status()}`);
//   }

//   const locJson = await locRes.json();
//   const locations = locJson.data;

//   const allLocationsData = [];

//   for (const loc of locations) {

//     const apiResponses = await getLocationSettingsAPI(
//       BASE_URL,
//       headers,
//       loc.location_id,
//       loc.country_id,
//       loc.timezone_id
//     );

//     allLocationsData.push({
//       locName: loc.location_name,
//       locId: loc.location_id,
//       countryId: loc.country_id,
//       timezoneId: loc.timezone_id,
//       data: apiResponses
//     });
//   }

//   await use({
//     page,
//     headers,
//     allLocationsData
//   });
// }























// });

// export { expect } from '@playwright/test';