import { Page, expect } from '@playwright/test';

export class LoginPage {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async loginAndGetToken(username: string, password: string): Promise<any> {
        console.log(" Logging in");

        // Enter email
        await this.page.locator("//input[@id='mat-input-0']").fill(username);
        console.log(" Email entered");

        // Click first login button
        await this.page.locator("//input[@value='Login']").click();
        console.log(" Clicked first login button");

        // Wait for page transition
        await this.page.waitForLoadState('load');
        await this.page.waitForLoadState('networkidle');

        // Wait for password field to appear - try multiple locators
        const passwordLocators = [
            "//input[@id='pass_log_id']",
            "//input[@type='password']",
            "//input[contains(@id,'pass')]",
            "input[type='password']"
        ];



        // Enter password
        await this.page.locator("//input[@type='password']").fill(password);
        console.log(" Password entered");

        // Click final login
        await this.page.locator("//button[normalize-space()='Login']").click();
        console.log(" Clicked final login button");
        console.log(" Waiting for dashboard load...");
        await this.page.locator("//*[contains(text(),'Location')]").first().waitFor({ state: 'visible', timeout: 45000 });
        console.log(" Dashboard loaded");

        // Wait for token to be available in localStorage
        await this.page.waitForFunction(() => {
            return window.localStorage.getItem('token') != null;
        });

        // Fetch token
        const tokenStr = await this.page.evaluate(() => {
            return window.localStorage.getItem('token');
        });

        if (!tokenStr) {
            throw new Error("Access token not found after login");
        }

        const token = JSON.parse(tokenStr);
        const accessToken = token.value;

        if (!accessToken) {
            throw new Error("Access token value not found in storage");
        }

        // Prepare headers for API calls
        const headers = {
            "access_token": accessToken
        };

        console.log(" Login successful");

        return headers;
    }
}
