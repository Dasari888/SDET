import { Page, expect } from '@playwright/test';
import { LocationCheck } from '../pages/components/LocationCheck';

export class NotifyMe {
    private page: Page;
    private locCheck: LocationCheck;

    constructor(page: Page) {
        this.page = page;
        this.locCheck = new LocationCheck(page);
    }

    async allLocNotifyMe(baseUrl: string, headers: any) {
        console.log("🚀 Starting allLocNotifyMe");

        // Select the first location
        const initialLocation = this.page.locator("(//span[@class='mat-radio-outer-circle'])[1]");
        console.log("⏳ Waiting for initial location radio...");
        await initialLocation.waitFor({ state: 'attached', timeout: 30000 });
        await initialLocation.click({ force: true });
        console.log("✅ Clicked initial location");

        await this.page.waitForTimeout(2000);

        // Click next
        const nextBtn = this.page.locator(".mat-button-wrapper");
        console.log("⏳ Waiting for Next button...");
        await nextBtn.waitFor({ state: 'attached' });
        await nextBtn.click({ force: true });
        console.log("✅ Clicked Next");

        await this.page.waitForTimeout(3000);

        // Open profile menu
        const profileIcon = this.page.locator("#Icon_awesome-user-circle");
        console.log("⏳ Waiting for account icon...");
        await profileIcon.waitFor({ state: 'attached' });
        await profileIcon.click({ force: true });
        console.log("✅ Clicked account icon");

        await this.page.waitForTimeout(2000);

        // Get location details
        const { apiLocations, locationIds, lengthLoc } = await this.locCheck.locationIdsCount(baseUrl, headers);

        for (let i = 1; i <= lengthLoc; i++) {
            const locName = apiLocations[i - 1];
            const locId = locationIds[i - 1];
            console.log(`\n###### Location is ${locName}: id is ${locId}`);

            // Select location radio
            const radioBtn = this.page.locator(`(//span[@class='mat-radio-outer-circle'])[${i}]`);
            console.log(`⏳ Waiting for radio button for ${locName}...`);
            await radioBtn.waitFor({ state: 'attached', timeout: 15000 });
            console.log(`✅ Radio button attached for ${locName}`);

            await radioBtn.click({ force: true });
            console.log(`✅ Clicked radio button for ${locName}`);

            await this.page.waitForTimeout(2000);

            // API call for this location's preferences
            console.log(`🌐 Fetching preferences for ${locName}...`);
            const locApiResp = await this.page.request.get(`${baseUrl}/v1/location/preference/${locId}/get`, { headers });
            if (!locApiResp.ok()) {
                console.error(`❌ Location API failed for ${locName} (${locId})`);
                continue;
            }

            const apiJson = await locApiResp.json();
            console.log(`✅ Preference API response received for ${locName}`);

            // Go to "Home" then "Settings"
            console.log("🏠 Navigating to Home...");
            const homeBtn = this.page.locator("(//button[@class='mat-tooltip-trigger py-3 optsel'])[1]");
            await homeBtn.waitFor({ state: 'attached' });
            await homeBtn.click({ force: true });
            await this.page.waitForTimeout(2000);

            console.log("⚙️ Navigating to Settings...");
            const settingsBtn = this.page.locator("(//button[@class='mat-tooltip-trigger py-3 optsel'])[5]");
            await settingsBtn.waitFor({ state: 'attached' });
            await settingsBtn.click({ force: true });
            await this.page.waitForTimeout(3000);

            try {
                console.log("🔍 Validating toggle state...");
                const appNotifyValue = apiJson.data.app_notify;
                const enabledFlag = appNotifyValue.split("$$")[0];

                const toggleInput = this.page.locator("//mat-slide-toggle//input[@type='checkbox']").first();
                await toggleInput.waitFor({ state: 'attached', timeout: 20000 });

                const ariaChecked = await toggleInput.getAttribute("aria-checked");
                const toggleLabel = this.page.locator("//mat-slide-toggle").first();
                const toggleClasses = await toggleLabel.getAttribute("class") || "";

                console.log(`[DEBUG] aria-checked: ${ariaChecked}, toggle_classes: ${toggleClasses}`);

                const isEnabledInUi = (ariaChecked === "true") || (toggleClasses.includes("mat-checked"));

                if (enabledFlag === "1") {
                    if (isEnabledInUi) {
                        console.log("✅ app_notify toggle is ENABLED in UI and API matches");
                    } else {
                        console.log("❌ app_notify toggle is NOT enabled in UI but API says enabled");
                    }
                } else {
                    if (!isEnabledInUi) {
                        console.log("✅ app_notify toggle is DISABLED in UI and API matches");
                    } else {
                        console.log("❌ app_notify toggle is ENABLED in UI but API says disabled");
                    }
                }

            } catch (e) {
                console.log(`⚠️ Error checking app_notify toggle: ${e}`);
            }

            // Reopen profile menu for next location
            console.log("👤 Re-opening profile menu...");
            await profileIcon.waitFor({ state: 'attached' });
            await profileIcon.click({ force: true });
            await this.page.waitForTimeout(2000);
        }

        console.log("\n🎯 NOTIFY ME VALIDATION COMPLETED");
    }
}
