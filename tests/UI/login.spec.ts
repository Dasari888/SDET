import { test, expect } from '../../fixtures/test-fixtures';
import { BASE_URL, USERNAME, PASSWORD } from '../../utils/test-data';

test('Verify login and check locations', async ({ page, loginPage, locationCheck }) => {
    await page.goto(BASE_URL);
    const headers = await loginPage.loginAndGetToken(USERNAME, PASSWORD);

    console.log(' Starting location validations');
    const results = await locationCheck.checkLocations(headers, BASE_URL);

    expect(results.missingInSettings.length).toBe(0);
    console.log('Test: Verify login and check locations - Completed');
});

