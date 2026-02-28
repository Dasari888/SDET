import { Page, expect } from '@playwright/test';

export class SchedulerCheck {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async locationSettingsApi(locId: string, cId: string, tId: string, baseUrl: string, headers: any) {
        const responses: Record<string, any> = {};
        const endpoints = [
            [`${baseUrl}/v1/location/${locId}/settings`, "location_settings"],
            [`${baseUrl}/v1/location/${locId}/get`, "location_get"],
            [`${baseUrl}/v1/company-codes/gettimezone`, "company_codes_timezone"],
            [`${baseUrl}/v1/location/get`, "location_get_all"],
            [`${baseUrl}/v1/company-v2/get/${cId}`, "company_v2_get"],
            [`${baseUrl}/v1/timezone/get/${tId}`, "timezone_get"],
            [`${baseUrl}/v1/location/preference/${locId}/get`, "location_preference_get"],
        ];

        for (const [url, key] of endpoints) {
            try {
                const resp = await this.page.request.get(url, { headers });
                responses[key] = await resp.json();
            } catch (e) {
                responses[key] = { error: String(e) };
            }
        }
        return responses;
    }

    async checkUiAgainstApi(response: any) {
        console.log("Verifying UI against API...");

        // Location Name
        const apiLocName = response.location_get?.data?.location_name;
        if (apiLocName) {
            const uiLocInput = this.page.locator("//div[@class='abc']//div[1]//div[2]//input[1]");
            const uiValue = await uiLocInput.getAttribute("placeholder") || await uiLocInput.getAttribute("value");
            expect(uiValue).toBe(apiLocName);
            console.log(`✅ Location Match: ${uiValue}`);
        }

        // Country
        const apiCountry = response.company_v2_get?.data?.name;
        if (apiCountry) {
            const uiCountry = this.page.locator(`//div[normalize-space()='${apiCountry}']`);
            await expect(uiCountry).toBeVisible();
            console.log(`✅ Country Match: ${apiCountry}`);
        }

        // Timezone
        const apiTzName = response.timezone_get?.data?.name;
        const apiGmt = response.timezone_get?.data?.gmtOffsetName;
        if (apiTzName && apiGmt) {
            const fullTz = `${apiTzName} (${apiGmt})`;
            const uiTz = this.page.locator("//div[7]//div[2]");
            await expect(uiTz).toHaveText(fullTz);
            console.log(`✅ Timezone Match: ${fullTz}`);
        }

        // Energy Cost
        const energyIn = response.location_settings?.data?.energy_in;
        if (energyIn) {
            const energyValue = energyIn.split("$$")[2];
            const uiEnergy = this.page.locator("//div[8]//div[2]//input[1]");
            const uiValue = await uiEnergy.getAttribute("placeholder") || await uiEnergy.getAttribute("value");
            expect(uiValue?.trim()).toBe(energyValue.trim());
            console.log(`✅ Energy Match: ${energyValue}`);
        }

        // Notify Me Toggle (app_notify)
        const appNotify = response.location_preference_get?.data?.app_notify;
        if (appNotify) {
            const enabledFlag = appNotify.split("$$")[0];
            const toggle = this.page.locator("//mat-slide-toggle//input[@type='checkbox']");
            const isChecked = await toggle.getAttribute("aria-checked") === "true";
            const apiEnabled = enabledFlag === "1";
            expect(isChecked).toBe(apiEnabled);
            console.log(`✅ Notify Me Match: ${apiEnabled ? "Enabled" : "Disabled"}`);
        }

        return true;
    }
}
