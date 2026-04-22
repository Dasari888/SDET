// import { Page, expect } from '@playwright/test';
// import { LocationAPI } from '../src/SettingsApi';
// import { BASE_URL } from '../utils/test-data';

// export class ProfilePage {
//   constructor(private page: Page) {}

//   async selectInitialLocation() {
//     const initialLocation = this.page.locator("(//span[contains(@class,'mat-radio-outer-circle')])[1]");
//     await initialLocation.waitFor({ state: 'visible' });
//     await initialLocation.scrollIntoViewIfNeeded();
//     await initialLocation.click({ trial: false });

//     const nextBtn = this.page.locator(".mat-button-wrapper");
//     await nextBtn.waitFor({ state: 'visible' });
//     await Promise.all([
//       this.page.waitForLoadState('networkidle'),
//       nextBtn.click()
//     ]);

//     await this.page.locator("(//button[contains(@class,'optsel')])[1]").waitFor({ state: 'visible' });
//     await this.page.waitForLoadState('networkidle');
//     await this.page.waitForLoadState('domcontentloaded');
//   }



// async navigateToSettings() {
//   await this.page.goto(`${BASE_URL}/#/dashboard/settings`, {
//     waitUntil: 'networkidle'
//   });
// }

//   async getProfileName(): Promise<string> {
//     const profileMenu = this.page.locator("text=Profile").first();
//     await profileMenu.waitFor({ state: 'visible' });
//     await profileMenu.click();

//     const profileNameLoc = this.page.locator("input[type='text']").first();
//     await profileNameLoc.waitFor({ state: 'visible' });

//     await expect.poll(async () => {
//       return await profileNameLoc.inputValue();
//     }).not.toBe('');

//     return await profileNameLoc.inputValue();
//   }

//   async getProfileEmail(): Promise<string> {
//     const emailLabel = this.page.locator("text=Email >> xpath=following::mat-label[1]");
//     await emailLabel.waitFor({ state: 'visible' });

//     await expect.poll(async () => {
//       return (await emailLabel.textContent())?.trim();
//     }).not.toBe('');

//     return (await emailLabel.textContent() || "").trim();
//   }

//   async locationsettingsloc(): Promise<void> {
//     const locationsettings = this.page.locator("text=Location settings").first();

//     await locationsettings.waitFor({ state: 'visible' });

//     await Promise.all([
//       this.page.waitForLoadState('networkidle'),
//       locationsettings.click()
//     ]);

//     await this.page.waitForSelector('shems-locationsettings', { state: 'visible' });
//   }

//   async openLocationFromSettings(locid: string): Promise<void> {
//     // const container = this.page.locator('shems-locationsettings');

//     // const locationElement = container
//     //   .locator('div')
//     //   .filter({ hasText: locName })
// //     //   .first();
// // const locationElement = container.getByText(locid, { exact: true });

//     // await locationElement.waitFor({ state: 'visible' });
//     // await locationElement.scrollIntoViewIfNeeded();

//     // await Promise.all([
//     //   this.page.waitForLoadState('networkidle'),
//     //   locationElement.click()
//     // ]);

//     // await this.page.waitForSelector("input", { state: "visible" });


//      let uurl=`${BASE_URL}/#/dashboard/settings/locationsetting/${locid}/locationsetting1`
//     console.log(uurl);
//     await this.page.goto(uurl)
//   }

//   async goBackToLocationList(): Promise<void> {
//     const backArrow = this.page.locator('#Ellipse_210')
//     await backArrow.first().waitFor({ state: 'visible' });

//     await Promise.all([
//       this.page.waitForLoadState('networkidle'),
//       backArrow.first().click()
//     ]);

    
//   }

//   async getLocationName(): Promise<string> {
//     const el = this.page.locator("input").first();
//     await el.waitFor({ state: 'visible' });

//     await expect.poll(async () => {
//       return await el.inputValue();
//     }).not.toBe('');

//     return await el.inputValue();
//   }

//   async getCountry(countryName: string): Promise<string> {
//     const el = this.page.locator(`text=${countryName}`).first();
//     await el.waitFor({ state: 'visible' });
//     return (await el.textContent())?.trim() || '';
//   }

// async verifyTimezone(timezone: string): Promise<string> {
//   this.page.waitForLoadState('networkidle');
//   this.page.waitForLoadState('domcontentloaded');
//   const el = this.page.getByText(timezone, { exact: true });
//   await el.waitFor({ state: 'visible' });
//   return (await el.textContent())?.trim() || '';
// }

//   async getEnergyCost(expectedCost: string): Promise<string> {
//   const el = this.page.locator(`(//mat-label[contains(text(),'${expectedCost}')])[1]`);
//   await el.waitFor({ state: 'visible' });
//   return (await el.textContent())?.trim() || '';
// }

 

//   async getTreesPerKwh(): Promise<string> {
//     const el = this.page.locator("input").nth(3);
//     await el.waitFor({ state: 'visible' });
//     return (await el.inputValue()) || (await el.getAttribute('placeholder')) || '';
//   }

//   async isHcDateEnabled(): Promise<boolean> {
//     const toggle = this.page.locator("input[type='checkbox'], mat-slide-toggle input");
//     await toggle.first().waitFor({ state: 'visible' });

//     const ariaChecked = await toggle.first().getAttribute("aria-checked");
//     return ariaChecked === "true";
//   }


// async getTempUnit(expectedTemp: string): Promise<string> {
//   const el = this.page.locator(
//     `//div[contains(@class,'mat-select-trigger') and contains(.,'${expectedTemp}')]`
//   ).first();
//   console.log(el);

//   await el.waitFor({ state: 'visible' });
//   return (await el.textContent())?.trim() || '';
// }

// async getEnvsavingsin(): Promise<string> {
//   const el = this.page.locator('mat-form-field').nth(1).locator('.mat-select-min-line');
//   await el.waitFor({ state: 'visible' });
//   return (await el.textContent())?.trim() || '';
// }

// async getFuelUnit(): Promise<string>{
//   const el = this.page.locator('mat-form-field').nth(2).locator('.mat-select-min-line');
//   await el.waitFor({ state: 'visible' });
//   return (await el.textContent())?.trim() || '';
// }
// async getDeviceRetainTime(): Promise<string>{
//   this .page.waitForLoadState('networkidle');
//   this.page.waitForLoadState('domcontentloaded');
//   const el= this.page.locator("(//div[contains(@class,'mat-select-trigger')])[4]").first();
//    this .page.waitForLoadState('networkidle');
//   this.page.waitForLoadState('domcontentloaded');
//   await this.page.waitForTimeout(5000);
//   await el.scrollIntoViewIfNeeded();
//   await el.waitFor({ state: 'visible' });
//   return (await el.textContent())?.trim() || '';
// }

// async getCostPerKwh(): Promise<string> {
//   const el = this.page.locator(
//     '//div[text()="Cost per kWh"]/following-sibling::div//input'
//   );

//   await el.waitFor({ state: 'visible' });

//   return (
//     (await el.inputValue()) ||
//     (await el.getAttribute('placeholder')) ||
//     ''
//   );
// }


// async getCo2PerKwh(): Promise<string> {
//   const el = this.page.locator(
//     '//div[text()="CO₂ per kWh"]/following-sibling::div//input'
//   );  
//   await el.waitFor({ state: 'visible' });

//   return (
//     (await el.inputValue()) ||
//     (await el.getAttribute('placeholder')) ||
//     ''
//   );  

// }

// async getTreesPerKwhValue(): Promise<string> {
//   const el = this.page.locator(
//     '//div[text()="No. of trees per kWh"]/following-sibling::div//input'
//   );

//   await this.page.waitForLoadState('networkidle');
//   await el.scrollIntoViewIfNeeded();
//   await el.waitFor({ state: 'visible' });

//   await expect(el).not.toHaveValue("");

//   return (await el.inputValue()).trim();
// }



// async getFeedInTariff(): Promise<string> {
//   const el = this.page.locator(
//     '//div[text()="Feed-in tariff per kWh"]/following-sibling::div//input'
//   );

//   await el.waitFor({ state: 'visible' });

//   await expect(el).not.toHaveValue("");

//   return (await el.inputValue()).trim();
// }








// }
























import { Page, expect, Locator } from '@playwright/test';
import { BASE_URL } from '../utils/test-data';

export class ProfilePage {
  constructor(private page: Page) {}

  private async waitForStableText(el: Locator): Promise<string> {
    await el.waitFor({ state: 'visible' });
    await el.scrollIntoViewIfNeeded();

    await expect.poll(async () => {
      return (await el.textContent())?.trim();
    }).not.toBe('');

    return (await el.textContent())?.trim() || '';
  }

  private async waitForStableValue(el: Locator): Promise<string> {
    await el.waitFor({ state: 'visible' });
    await el.scrollIntoViewIfNeeded();

    await expect.poll(async () => {
      return await el.inputValue();
    }).not.toBe('');

    return await el.inputValue();
  }

  async selectInitialLocation() {
    const initialLocation = this.page.locator("(//span[contains(@class,'mat-radio-outer-circle')])[1]");
    await initialLocation.waitFor({ state: 'visible' });
    await initialLocation.scrollIntoViewIfNeeded();
    await initialLocation.click();

    const nextBtn = this.page.locator(".mat-button-wrapper");
    await nextBtn.waitFor({ state: 'visible' });

    await Promise.all([
      nextBtn.click(),
      this.page.waitForSelector("(//button[contains(@class,'optsel')])[1]")
    ]);
  }

  async navigateToSettings() {
    await this.page.goto(`${BASE_URL}/#/dashboard/settings`);
    // await this.page.waitForSelector('mat-form-field');
  }

  async getProfileName(): Promise<string> {
    const profileMenu = this.page.locator("text=Profile").first();
    await profileMenu.waitFor({ state: 'visible' });
    await profileMenu.click();

    const profileNameLoc = this.page.locator("input[type='text']").first();
    return await this.waitForStableValue(profileNameLoc);
  }

  async getProfileEmail(): Promise<string> {
    const emailLabel = this.page.locator("text=Email >> xpath=following::mat-label[1]");
    return await this.waitForStableText(emailLabel);
  }

  async locationsettingsloc(): Promise<void> {
    const locationsettings = this.page.locator("text=Location settings").first();
    await locationsettings.waitFor({ state: 'visible' });

    await Promise.all([
      locationsettings.click(),
      this.page.waitForSelector('shems-locationsettings')
    ]);
  }

  async openLocationFromSettings(locid: string): Promise<void> {
    const url = `${BASE_URL}/#/dashboard/settings/locationsetting/${locid}/locationsetting1`;
    await this.page.goto(url);
    await this.page.waitForSelector('mat-form-field');
  }

  async goBackToLocationList(): Promise<void> {
    const backArrow = this.page.locator('#Ellipse_210').first();
    await backArrow.waitFor({ state: 'visible' });

    await Promise.all([
      backArrow.click(),
      this.page.waitForSelector('shems-locationsettings')
    ]);
  }

  async getLocationName(): Promise<string> {
    const el = this.page.locator("input").first();
    return await this.waitForStableValue(el);
  }

  async getCountry(countryName: string): Promise<string> {
    const el = this.page.locator(`text=${countryName}`).first();
    return await this.waitForStableText(el);
  }

  async verifyTimezone(timezone: string): Promise<string> {
    const el = this.page.getByText(timezone, { exact: true });
    return await this.waitForStableText(el);
  }

  async getEnergyCost(expectedCost: string): Promise<string> {
    const el = this.page.locator(`(//mat-label[contains(text(),'${expectedCost}')])[1]`);
    return await this.waitForStableText(el);
  }

  async getTreesPerKwh(): Promise<string> {
    const el = this.page.locator("input").nth(3);
    return await this.waitForStableValue(el);
  }

  async isHcDateEnabled(): Promise<boolean> {
    const toggle = this.page.locator("input[type='checkbox'], mat-slide-toggle input").first();
    await toggle.waitFor({ state: 'visible' });

    const ariaChecked = await toggle.getAttribute("aria-checked");
    return ariaChecked === "true";
  }

  async getTempUnit(expectedTemp: string): Promise<string> {
    const el = this.page.locator(
      `//div[contains(@class,'mat-select-trigger') and contains(.,'${expectedTemp}')]`
    ).first();

    return await this.waitForStableText(el);
  }

  // async getEnvsavingsin(): Promise<string> {
  //   const el = this.page.locator('mat-form-field').nth(1).locator('.mat-select-min-line');
  //   await this.waitForStableText(el);
  //   return (await el.textContent())?.trim() || '';
  // }

  async getEnvsavingsin(): Promise<string> {
    const el = this.page.locator(
      '//div[text()="Show environmental savings in"]/following-sibling::div//span[contains(@class,"mat-select-min-line")]'
    );

    await el.waitFor({ state: 'visible' });
    await el.scrollIntoViewIfNeeded();

    await expect.poll(async () => {
      return (await el.textContent())?.trim();
    }).not.toBe('');

    return (await el.textContent())?.trim() || '';
  }
    async getFuelUnit(): Promise<string> {
      const el = this.page.locator('mat-form-field').nth(2).locator('.mat-select-min-line');
       await el.waitFor({ state: 'visible' });
    await el.scrollIntoViewIfNeeded();

    await expect.poll(async () => {
      return (await el.textContent())?.trim();
    }).not.toBe('');

    return (await el.textContent())?.trim() || '';
    }

  async getDeviceRetainTime(): Promise<string> {
    const el = this.page.locator("(//div[contains(@class,'mat-select-trigger')])[4]").first();
    await this.page.waitForTimeout(5000)
    await this.waitForStableText(el);
     return (await el.textContent())?.trim() || ''
  }

  async getCostPerKwh(): Promise<string> {
    const el = this.page.locator(
      '//div[text()="Cost per kWh"]/following-sibling::div//input'
    );
    return await this.waitForStableValue(el);
  }

  async getCo2PerKwh(): Promise<string> {
    const el = this.page.locator(
      '//div[text()="CO₂ per kWh"]/following-sibling::div//input'
    );
    return await this.waitForStableValue(el);
  }

  // async getTreesPerKwhValue(): Promise<string> {
  //   const el = this.page.locator(
  //     '//div[text()="No. of trees per kWh"]/following-sibling::div//input'
  //   );
  //   return await this.waitForStableValue(el);
  // }

  async getTreesPerKwhValue(): Promise<string> {
    const el = this.page.locator(
      '//div[text()="No. of trees per kWh"]/following-sibling::div//input'
    );

    await el.waitFor({ state: 'visible' });
    await el.scrollIntoViewIfNeeded();

    await expect.poll(async () => {
      return await el.inputValue();
    }).not.toBe("0");

    return await el.inputValue();
  }



  async getFeedInTariff(): Promise<string> {
    const el = this.page.locator(
      '//div[text()="Feed-in tariff per kWh"]/following-sibling::div//input'
    );
    return await this.waitForStableValue(el);
  }
}