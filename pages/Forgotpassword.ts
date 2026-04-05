import { Page } from '@playwright/test';

export class Forgotpassword {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async enterUsername(username: string): Promise<void> {
        await this.page.locator("//input[@id='mat-input-0']").fill(username);
        console.log(`Entered username/email: ${username}`);
    }
    async enterPassword(Password:string):Promise<void>{
        // await this.page.getByPlaceholder("Password");
         await this.page.locator('input[type="password"]').fill(Password);
         console.log(`Entered password: ${Password}`);

    }
    async clickLogin(): Promise<void> {
        await this.page.locator("//input[@value='Login']").click();
        console.log("Clicked login button");
    }

    async clickFinalLogin(): Promise<void>{
       await this.page.locator("//button[normalize-space()='Login']").click();
        console.log(" Clicked final login button");
        // console.log(" Waiting for dashboard load...");
        // await this.page.locator("//*[contains(text(),'Location')]").first().waitFor({ state: 'visible', timeout: 45000 });
        // console.log(" Dashboard loaded");
    }

    async clickForgotPassword(): Promise<void> {
        await this.page.waitForLoadState('networkidle');
        await this.page.locator("//a[normalize-space()='Forgot password?']").click();
        console.log("Clicked 'Forgot password?' link");
    }

    async submitForgotPasswordEmail(email: string): Promise<void> {
        await this.page.locator("//input[@id='mat-input-0']").fill(email);
        await this.page.locator("//input[@value='Send Code']").click();
        console.log(`Submitted forgot password email: ${email}`);
    }

    async clearEmailInput(): Promise<void> {
        await this.page.locator("//input[@id='mat-input-0']").fill("");
        console.log("Cleared email input field");
    }


    async enterOTP(otp:number):Promise<void>{
    await this.page.getByLabel(/Enter OTP/).fill(String(otp));
    console.log("otp is entered..........")
    }

    async newpassword(password:string):Promise<void>{
    await this.page.locator('//input[@formcontrolname="password"]').fill(password);
    console.log("entered new password")
    }
     

    async confirmpassword(cpwd:string):Promise<void>{
        await this.page.locator('//input[@formcontrolname="confirmPassword"]').fill(cpwd);
        console.log("entered confirm password...")
    }
   

    async resetButton():Promise<void>{
         await this.page.getByText("Reset Password").click()
         console.log("clicked on the Reset Password Button...")
    }
     

    
}