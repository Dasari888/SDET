import { Page, expect } from '@playwright/test';
import { LocationCheck } from './LocationCheck';

export class Rooms {
    private page: Page;
    private locCheck: LocationCheck;

    constructor(page: Page) {
        this.page = page;
        this.locCheck = new LocationCheck(page);
    }

    async getRoomIdsPerLocation(baseUrl: string, headers: any) {
        const { apiLocations, locationIds, lengthLoc } = await this.locCheck.locationIdsCount(baseUrl, headers);
        const locationRoomIds: Record<string, string[]> = {};

        for (let i = 0; i < lengthLoc; i++) {
            const locName = apiLocations[i];
            const locId = locationIds[i];

            try {
                const resp = await this.page.request.get(`${baseUrl}/v1/location/device/${locId}/all`, { headers });
                if (!resp.ok()) throw new Error(`Failed to get room_ids for ${locName}`);

                const roomsData = (await resp.json()).data || {};
                const roomIdsStr = roomsData.room_ids || "";
                locationRoomIds[locName] = roomIdsStr ? roomIdsStr.split(",") : [];
            } catch (e) {
                console.log(`Error fetching rooms for ${locName}: ${e}`);
                locationRoomIds[locName] = [];
            }
        }
        return locationRoomIds;
    }

    async roomClickCount(baseUrl: string, headers: any) {
        const { apiLocations, locationIds, lengthLoc } = await this.locCheck.locationIdsCount(baseUrl, headers);

        // Initial setup
        const initialLocation = this.page.locator("(//span[@class='mat-radio-outer-circle'])[1]");
        await initialLocation.scrollIntoViewIfNeeded();
        await initialLocation.click();

        await this.page.locator(".mat-button-wrapper").click();
        await this.page.waitForLoadState('networkidle');

        await this.page.locator("#Icon_awesome-user-circle").click();
        await this.page.waitForLoadState('networkidle');

        for (let i = 0; i < lengthLoc; i++) {
            const locName = apiLocations[i];
            const locId = locationIds[i];

            console.log(`\n###### Location: ${locName}, ID: ${locId}`);

            if (i > 0) {
                await this.page.locator("#Icon_awesome-user-circle").click();
                await this.page.waitForLoadState('networkidle');
            }

            const radioBtnXpath = `(//span[@class='mat-radio-outer-circle'])[${i + 1}]`;
            await this.page.locator(radioBtnXpath).click();
            await this.page.waitForTimeout(1000);

            // Fetch rooms via API
            let roomIdsList: string[] = [];
            try {
                const resp = await this.page.request.get(`${baseUrl}/v1/location/device/${locId}/all`, { headers });
                const fullJson = await resp.json();
                const roomsData = fullJson.data;

                if (roomsData) {
                    const roomsList = Array.isArray(roomsData) ? roomsData : (roomsData.rooms || []);
                    roomIdsList = roomsList
                        .filter((r: any) => r.is_default === false)
                        .map((r: any) => `${r.room_name || r.device_name} (ID: ${r.room_id || r.device_id})`);
                }
            } catch (e) {
                console.log(`Error parsing rooms for ${locName}: ${e}`);
            }

            console.log(`📊 Location: ${locName} | API Room Count (filtered): ${roomIdsList.length}`);

            // Navigate to Home -> Devices
            await this.page.locator("(//button[@class='mat-tooltip-trigger py-3 optsel'])[1]").click();
            await this.page.locator("(//button[@class='mat-tooltip-trigger py-3 optsel'])[2]").click();
            await this.page.waitForTimeout(3000);

            const roomHeaders = this.page.locator("//mat-expansion-panel-header[starts-with(@id,'mat-expansion-panel-header')]");
            const uiRoomCount = await roomHeaders.count();

            console.log(`📊 Location: ${locName} | API Room Count: ${roomIdsList.length} | UI Room Count: ${uiRoomCount}`);

            if (uiRoomCount === 0) {
                console.log(`ℹ️ No room headers found in UI for location: ${locName}`);
                await this.page.locator("(//button[@class='mat-tooltip-trigger py-3 optsel'])[1]").click();
                continue;
            }

            for (let idx = 0; idx < uiRoomCount; idx++) {
                try {
                    const header = roomHeaders.nth(idx);
                    await header.scrollIntoViewIfNeeded();
                    await header.click();
                    console.log(`   ∟ ✅ Clicked Room ${idx + 1} for Location ${locName}`);
                    await this.page.waitForTimeout(1000);
                } catch (e) {
                    console.log(`   ∟ ❌ Failed to click Room ${idx + 1} for ${locName}: ${e}`);
                }
            }

            console.log(`🏠 Completed rooms for ${locName}. Returning to Home...`);
            await this.page.locator("(//button[@class='mat-tooltip-trigger py-3 optsel'])[1]").click();
            await this.page.waitForTimeout(1000);
        }
    }
}
