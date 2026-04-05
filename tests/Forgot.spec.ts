import { test, expect } from '../fixtures/test-fixtures';
import { BASE_URL,USERNAME,USERNAME3,PASSWORD,USERNAME2, Forgot_npassword,FP1,FP2,FP3,FP4} from '../utils/test-data';
import { getOTP,getOTPWithRetry} from '../src/otp';
import { Forgotpassword } from '../pages/Forgotpassword';
import {Page} from '@playwright/test'
// import { Page } from 'openai/pagination';

test.describe('Forgot Password Test Suite UI', () => {





const frontendinvalidemails:string[]=[
"usergmail.com",        // Missing @ symbol
"test.email.com",       // Missing @ symbol
"@gmail.com",           // Missing username
"@domain.org",          // Missing username
"user@",                // Missing domain
"test@",                // Missing domain
"user@gmail",           // Missing domain extension
"test@yahoo",           // Missing domain extension
"user@@gmail.com",      // Multiple @ symbols
"test@domain@company.com", // Multiple @ symbols
"user name@gmail.com",  // Space in email
"test@ gmail.com",      // Space after @
"user#gmail.com",       // Special character instead of @
"name$domain.com",      // Invalid special character
".user@gmail.com",      // Starts with dot
"user.@gmail.com",      // Ends with dot before @
"user..name@gmail.com", // Double dots
"user@gmail..com",      // Double dots in domain
"@@@@@",                // Only symbols
".....",                // Only dots
                        ]         


frontendinvalidemails.forEach(email=>{
  test(`Frontend emails validations :${email}`,async ({page, Forgotpassword})=>{
    const expectedText='Email ID is required';
    
    await page.goto(BASE_URL);
    await Forgotpassword.enterUsername(USERNAME);
    await Forgotpassword.clickLogin();
    await Forgotpassword.clickForgotPassword();
 
    console.log(`check for the invalid email like this(${email})`);
    await Forgotpassword.submitForgotPasswordEmail(email);

    await expect(page.locator("text=Please enter a valid email address")).toBeVisible();
    await Forgotpassword.clearEmailInput()
    // await expect(page.locator("text=Email ID is required")).toBeVisible();
     const actualText: string | null = await page.locator('(//mat-error[@id="mat-error-2"])[1]').textContent();


     console.log(`Expected: ${expectedText}`);
     console.log(`Actual  : ${actualText}`);
     await expect(page.locator('(//mat-error[@id="mat-error-2"])[1]')).toHaveText(expectedText);
  })
});

const backendInvalidEmails = [
    "user@@gmail.com",
    "test@domain@company.com",
];

  backendInvalidEmails.forEach(email => {
        test(`Backend validation: ${email}`, async ({ page,Forgotpassword }) => {
    await page.goto(BASE_URL);
    await Forgotpassword.enterUsername(USERNAME);
    await Forgotpassword.clickLogin();
    await Forgotpassword.clickForgotPassword();
     await Forgotpassword.submitForgotPasswordEmail(email);

    await Forgotpassword.clearEmailInput()
    await expect(page.locator("text=Email ID is required")).toBeVisible();
        });
    });



  test('Verify mail sending limit reached', async ({ page, Forgotpassword }) => {

    await page.goto(BASE_URL);
    await Forgotpassword.enterUsername(USERNAME);
    await Forgotpassword.clickLogin();
    await Forgotpassword.clickForgotPassword();
    await Forgotpassword.submitForgotPasswordEmail(USERNAME2);
    await expect(
      page.locator("text=Mail sending limit is reached, please try after 24 hours")
    ).toBeVisible();

  });


// async function getOTPWithRetry(retries = 5, delay = 5000): Promise<string> {
//   for (let i = 0; i < retries; i++) {
//     try {
//       const otp = await getOTP();
//       if (otp) return otp;
//     } catch (err) {
//       console.log(`Retry ${i + 1}...`);
//     }
//     await new Promise(res => setTimeout(res, delay));
//   }
//   throw new Error("OTP not received after retries");
// }




  test('Verify OTP sent successfully', async ({ page, Forgotpassword }) => {

    await page.goto(BASE_URL);
    await Forgotpassword.enterUsername(USERNAME3);
    await Forgotpassword.clickLogin();
    await Forgotpassword.clickForgotPassword();
    await Forgotpassword.submitForgotPasswordEmail(USERNAME3);
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator("text=A verification code has been sent to your registered E-mail ID. Verify with the OTP to login.")).toBeVisible();

  });


});




test.describe.serial("@forgotFunctionality Forgot password Functionality Verification with Code",()=>{



  
test("code validation", async ({ page, Forgotpassword }) => {
  
  await page.goto(BASE_URL);
  await Forgotpassword.enterUsername(USERNAME2);
  await Forgotpassword.clickLogin();
  await Forgotpassword.clickForgotPassword();
  await Forgotpassword.submitForgotPasswordEmail(USERNAME2);
  await page.waitForLoadState('domcontentloaded')
  const triggertime=Date.now()
  const otp = await getOTPWithRetry(triggertime);
  console.log(" Using OTP:", otp);
  await page.getByLabel(/Enter OTP/).fill(otp);
  console.log("otp is entered..........")
  await page.click('//input[@value="Verify"]'); 
  await expect(page).not.toHaveURL(/changepassword/);
})



test("@smoke @regression @forgot Successful Forgot Password Reset", async ({ page, Forgotpassword }) => { 
  await page.goto(BASE_URL);
  await Forgotpassword.enterUsername(USERNAME2);
  await Forgotpassword.clickLogin();
  await Forgotpassword.clickForgotPassword();
  await Forgotpassword.submitForgotPasswordEmail(USERNAME2);
  // const triggertime=Date.now()
  const otp = await getOTPWithRetry(Date.now());
  console.log(" Using OTP:", otp);
  await page.waitForLoadState('domcontentloaded')
  // const triggertime=Date.now()
  // const otp = await getOTPWithRetry(Date.now());
  console.log(" Using OTP:", otp);
  await page.getByLabel(/Enter OTP/).fill(otp);
  console.log("otp is entered..........")
  await page.click('//input[@value="Verify"]'); 
  await expect(page).not.toHaveURL(/changepassword/);
   await Forgotpassword.newpassword(Forgot_npassword);
   await Forgotpassword.confirmpassword(Forgot_npassword);
   await Forgotpassword.resetButton();
   await expect(page.getByText("Your password has been changed successfully")).toBeVisible();
   
})




async function lastThreePasswords(
  page:Page,
  fp: Forgotpassword,
  username: string,
  newPassword: string
) {
  
  await page.goto(BASE_URL);

  await fp.enterUsername(username);
  await fp.clickLogin();
  await fp.clickForgotPassword();

  const triggerTime = Date.now();
  console.log('????????????????????????? timee',triggerTime)
  await fp.submitForgotPasswordEmail(username);

  const otp = await getOTPWithRetry(triggerTime);

  await fp.enterOTP(Number(otp));
  await page.click('//input[@value="Verify"]');

  await fp.newpassword(newPassword);
  await fp.confirmpassword(newPassword);

  await fp.resetButton();
}

test('@regression @module @p0 forgot password should not take the last three passwords',async ({page,Forgotpassword})=>{
  await lastThreePasswords(page,Forgotpassword,USERNAME2,FP1);
  await expect(page.getByText("Your password has been changed successfully")).toBeVisible();
  console.log("######first password set successfully.......")
  await lastThreePasswords(page,Forgotpassword,USERNAME2,FP2);
  await expect(page.getByText("Your password has been changed successfully")).toBeVisible();
  console.log("######second password set successfully.......")
  await lastThreePasswords(page,Forgotpassword,USERNAME2,FP3);
  await expect(page.getByText("Your password has been changed successfully")).toBeVisible();
  console.log("#####Third password set successfully.......")
  await lastThreePasswords(page,Forgotpassword,USERNAME2,FP4);
  await expect(page.getByText("Your password has been changed successfully")).toBeVisible();
  console.log("#####fourth password set successfully.......")

  await lastThreePasswords(page,Forgotpassword,USERNAME2,FP2);

  console.log("######asserion checking for the last resused....")
   await expect(page.getByText("Current Password Matches")).toBeVisible();

})

})