import { Page, expect } from '@playwright/test';

export class LocationCheck {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async locationIdsCount(baseUrl: string, headers: any) {
        const response = await this.page.request.get(`${baseUrl}/v1/location/get`, {
            headers: headers
        });

        if (!response.ok()) {
            throw new Error(`Location API failed with status ${response.status()}`);
        }

        const json = await response.json();
        const data = json.data;

        let apiLocations = data.map((loc: any) => loc.location_name.trim());
        let locationIds = data.map((loc: any) => loc.location_id.trim());
        let countryIds = data.map((loc: any) => loc.country_id);
        let timezoneIds = data.map((loc: any) => loc.timezone_id);
        let sortIds = data.map((loc: any) => loc.sortid || loc.sort_id || 0);

        // Sort based on sortIds
        const combined = apiLocations.map((name: string, i: number) => ({
            name,
            id: locationIds[i],
            countryId: countryIds[i],
            timezoneId: timezoneIds[i],
            sortId: sortIds[i]
        })).sort((a: any, b: any) => a.sortId - b.sortId);

        return {
            apiLocations: combined.map((x: any) => x.name),
            locationIds: combined.map((x: any) => x.id),
            countryIds: combined.map((x: any) => x.countryId),
            timezoneIds: combined.map((x: any) => x.timezoneId),
            lengthLoc: combined.length,
            sortIds: combined.map((x: any) => x.sortId)
        };
    }

    async checkLocations(headers: any, baseUrl: string) {
        const { apiLocations } = await this.locationIdsCount(baseUrl, headers);

        const missingInUi: string[] = [];
        for (const locName of apiLocations) {
            const locator = this.page.locator(`//div[@class='scroll-text'][normalize-space()='${locName}']`);
            try {
                await locator.waitFor({ state: 'visible', timeout: 5000 });
                console.log(`Found in UI: ${locName}`);
            } catch (e) {
                console.log(`Missing in UI: ${locName}`);
                missingInUi.push(locName);
            }
        }

        if (missingInUi.length === 0) {
            console.log("All API locations are present in the UI!");
        } else {
            console.log("Missing locations in UI:", missingInUi);
        }

        // Select first location radio
        const initialLocation = this.page.locator("(//span[@class='mat-radio-outer-circle'])[1]");
        await initialLocation.scrollIntoViewIfNeeded();
        await initialLocation.click();

        // Click next
        await this.page.locator(".mat-button-wrapper").click();
        await this.page.waitForLoadState('networkidle');

        // Navigate through menus
        await this.page.locator("//button[.//mat-icon[@data-mat-icon-name='energy_line']]").click();
        await this.page.locator("(//button[@class='mat-tooltip-trigger py-3 optsel'])[1]").click(); // Home
        await this.page.locator("(//button[@class='mat-tooltip-trigger py-3 optsel'])[4]").click(); // Security
        await this.page.locator("(//button[@class='mat-tooltip-trigger py-3 optsel'])[5]").click(); // Settings

        // Profile tab
        await this.page.locator("//div[@routerlink='./profile']").click();
        await this.page.waitForLoadState('networkidle');

        // API check for user details
        const userResp = await this.page.request.get(`${baseUrl}/v1/user/details`, { headers });
        if (!userResp.ok()) throw new Error("User details API failed");
        const userData = (await userResp.json()).data;
        const name = userData.name.trim();
        const emailId = userData.email_id.trim();

        // Name check
        const uiNameEl = this.page.locator("//input[@type='text']").first();
        console.log("⏳ Waiting for profile name to match:", name);
        await expect(uiNameEl).toHaveValue(name, { timeout: 10000 });
        console.log("✅ API name matches with profile name:", name);

        // Email check
        await this.page.locator("//*[name()='circle' and @id='Ellipse_210']").click();
        const emailLabel = this.page.locator("div.col-6.en mat-label");
        await expect(emailLabel).not.toBeEmpty();
        const uiEmail = (await emailLabel.textContent() || "").trim();
        expect(uiEmail).toBe(emailId);
        console.log("API email matches UI email.", uiEmail);

        // Navigate to Location Settings
        await this.page.locator("//div[@routerlink='./locationsetting']").click();
        await this.page.waitForLoadState('networkidle');

        // Re-check locations in settings page
        const missingInSettings: string[] = [];
        for (const locName of apiLocations) {
            const xpath = `(//div[contains(text(),'${locName}')])[1]`;
            try {
                await this.page.locator(xpath).waitFor({ state: 'visible', timeout: 5000 });
                console.log(`Found in UI (Settings): ${locName}`);
            } catch (e) {
                console.log(`Missing in UI (Settings): ${locName}`);
                missingInSettings.push(locName);
            }
        }

        return { apiLocations, missingInSettings };
    }
}
