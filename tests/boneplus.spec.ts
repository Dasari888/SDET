import { test, expect } from '@playwright/test';
import { LoginNew } from '../src/LoginNew';
import { LocationCheck } from '../src/LocationCheck';
import { Rooms } from '../src/Rooms';
import { SchedulerCheck } from '../src/SchedulerCheck';
import { NotifyMe } from '../src/NotifyMe';

const BASE_URL = 'https://boneplus.b1automation.com';

// Use environment variables or defaults
const USERNAME = process.env.BONEPLUS_USERNAME || 'divya.a@blazeautomation.com';
const PASSWORD = process.env.BONEPLUS_PASSWORD || 'BAblaze#4323';



test('Verify login and check locations', async ({ page }) => {
    const login = new LoginNew(page);
    const locCheck = new LocationCheck(page);

    await page.goto(BASE_URL);
    const headers = await login.loginAndGetToken(USERNAME, PASSWORD);

    console.log('📍 Starting location validations');
    const results = await locCheck.checkLocations(headers, BASE_URL);

    expect(results.missingInSettings.length).toBe(0);
    console.log('Test: Verify login and check locations - Completed');
});

test('Verify login and notify me for all locations', async ({ page }) => {
    test.slow();
    const login = new LoginNew(page);
    const notifyMe = new NotifyMe(page);

    await page.goto(BASE_URL);
    const headers = await login.loginAndGetToken(USERNAME, PASSWORD);

    console.log('🔔 Starting Notify Me validations');
    await notifyMe.allLocNotifyMe(BASE_URL, headers);

    console.log('Test: Verify login and notify me for all locations - Completed');
});

// test('Verify room clicks for all locations', async ({ page }) => {
//     const login = new LoginNew(page);
//     const rooms = new Rooms(page);

//     await page.goto(BASE_URL);
//     const headers = await login.loginAndGetToken(USERNAME, PASSWORD);

//     console.log('🏠 Starting room click validations');
//     await rooms.roomClickCount(BASE_URL, headers);

//     console.log('Test: Verify room clicks for all locations - Completed');
// });


