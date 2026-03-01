import { Page, expect } from '@playwright/test';
import { LocationCheck } from './components/LocationCheck';

export class Rooms {
    private page: Page;
    private locCheck: LocationCheck;

    constructor(page: Page) {
        this.page = page;
        this.locCheck = new LocationCheck(page);
    }

    // ---------------- GET ROOM IDS FROM API ----------------

    async getRoomIdsPerLocation(baseUrl: string, headers: any) {
        const { apiLocations, locationIds, lengthLoc } =
            await this.locCheck.locationIdsCount(baseUrl, headers);

        const locationRoomIds: Record<string, string[]> = {};

        for (let i = 0; i < lengthLoc; i++) {
            const locName = apiLocations[i];
            const locId = locationIds[i];

            try {
                const resp = await this.page.request.get(
                    `${baseUrl}/v1/location/device/${locId}/all`,
                    { headers }
                );

                if (!resp.ok()) {
                    throw new Error(`Failed to get room_ids for ${locName}`);
                }

                const roomsData = (await resp.json()).data || {};
                const roomIdsStr = roomsData.room_ids || "";

                locationRoomIds[locName] = roomIdsStr
                    ? roomIdsStr.split(",")
                    : [];

            } catch (e) {
                console.log(`❌ Error fetching rooms for ${locName}: ${e}`);
                locationRoomIds[locName] = [];
            }
        }

        return locationRoomIds;
    }

    // ---------------- MAIN ROOM CLICK FLOW ----------------

    async roomClickCount(baseUrl: string, headers: any) {
        const { apiLocations, locationIds, lengthLoc } =
            await this.locCheck.locationIdsCount(baseUrl, headers);

        
        // Select first location radio
        const initialLocation = this.page.locator("(//span[@class='mat-radio-outer-circle'])[1]");
        await initialLocation.scrollIntoViewIfNeeded();
        await initialLocation.click();

        // Click next
        await this.page.locator(".mat-button-wrapper").click();
        await this.page.waitForLoadState('networkidle');

   

        const profileIcon = this.page.locator("#Icon_awesome-user-circle");

        for (let i = 0; i < lengthLoc; i++) {
            const locName = apiLocations[i];
            const locId = locationIds[i];

            console.log(`\n###### Location: ${locName}, ID: ${locId}`);
            await this.page.waitForTimeout(1000); // small wait before actions



            // ================= OPEN PROFILE MENU =================

            await profileIcon.waitFor({ state: 'visible' });
            await profileIcon.click();
            // await this.page.waitForTimeout(2000); // small wait for menu to open
            // ================= SELECT LOCATION =================

            const radios = this.page.locator("mat-radio-button");
            await radios.first().waitFor({ state: 'visible' });

            const radioBtn = radios.nth(i);


            // await radioBtn.scrollIntoViewIfNeeded();
            await radioBtn.click();

            console.log(`✅ Selected location: ${locName}`);

            // ✅ IMPORTANT: wait for UI refresh after location change
            await this.page.waitForLoadState('domcontentloaded');

            // ================= API VALIDATION =================

            let roomIdsList: string[] = [];

            try {
                const resp = await this.page.request.get(
                    `${baseUrl}/v1/location/device/${locId}/all`,
                    { headers }
                );

                const fullJson = await resp.json();
                const roomsData = fullJson.data;

                if (roomsData) {
                    const roomsList = Array.isArray(roomsData)
                        ? roomsData
                        : (roomsData.rooms || []);

                    roomIdsList = roomsList
                        .filter((r: any) => r.is_default === false)
                        .map((r: any) =>
                            `${r.room_name || r.device_name} (ID: ${r.room_id || r.device_id})`
                        );
                }

            } catch (e) {
                console.log(`❌ Error parsing rooms for ${locName}: ${e}`);
            }

            console.log(
                `📊 Location: ${locName} | API Room Count: ${roomIdsList.length}`
            );


            // ================= NAVIGATE TO DEVICES =================

            const deviceTab = this.page.locator(
                "(//button[contains(@class,'optsel')])[3]"
            );

            await deviceTab.waitFor({ state: 'visible' });
            await deviceTab.click();
        // await this.page.waitForTimeout(1000);
            // ================= GET UI ROOM COUNT =================

            const roomHeaders = this.page.locator(
                "//mat-expansion-panel-header[starts-with(@id,'mat-expansion-panel-header')]"
            );

            // wait safely (handle no rooms case)
            await this.page.waitForTimeout(1000);

            const uiRoomCount = await roomHeaders.count();

            console.log(
                `📊 Location: ${locName} | API: ${roomIdsList.length} | UI: ${uiRoomCount}`
            );

            // ================= HANDLE NO ROOMS =================

            // if (uiRoomCount === 0) {
            //     console.log(`ℹ️ No rooms in UI for ${locName}`);

            //     const homeTab = this.page.locator(
            //         "(//button[contains(@class,'optsel')])[1]"
            //     );
            //     await homeTab.click();

            //     continue;
            // }

            // ================= CLICK EACH ROOM =================

            for (let idx = 0; idx < uiRoomCount; idx++) {
                try {
                    const header = roomHeaders.nth(idx);
                    await header.scrollIntoViewIfNeeded();
                    await header.click();

                    console.log(
                        `✅ Clicked Room ${idx + 1} for ${locName}`
                    );

                } catch (e) {
                    console.log(
                        `❌ Failed Room ${idx + 1} for ${locName}: ${e}`
                    );
                }
            }

            // ================= BACK TO Settings =================

            console.log(`🏠 Returning to settings...`);
            

            const homeTab = this.page.locator(
                "(//button[contains(@class,'optsel')])[6]"
            );
            await homeTab.waitFor({ state: 'visible' });

            await homeTab.click();
            // await expect(roomIdsList.length).toBe(uiRoomCount);
        }
    }
}