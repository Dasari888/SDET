import { Page } from '@playwright/test'

export class Settings{
    private page : Page;
    constructor(Page:Page){
        this.page=Page
    }
    async settingsTab():Promise<void>{
          await this.page.locator("div[class='sidebar'] div:nth-child(6)").click();
          console.log("clicked on the Settings Tab.......")
    }
     
}