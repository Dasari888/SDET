import { test, expect } from '../fixtures/test-fixtures';
import { BASE_URL, USERNAME, PASSWORD } from '../utils/test-data';

test('Verify room clicks for all locations', async ({ page, loginPage, roomsPage }) => {
    await page.goto(BASE_URL);
    const headers = await loginPage.loginAndGetToken(USERNAME, PASSWORD);

    console.log('🏠 Starting room click validations');
    await roomsPage.roomClickCount(BASE_URL, headers);

    console.log('Test: Verify room clicks for all locations - Completed');
});
