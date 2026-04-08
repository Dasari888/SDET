import { test, expect } from '../fixtures/test-fixtures';
import { BASE_URL,USERNAME,USERNAME3,PASSWORD,USERNAME2, Forgot_npassword,FP1,FP2,FP3,FP4,ForgotAuthorization,MAIL} from '../utils/test-data';
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
    await Forgotpassword.enterUsername(USERNAME3);
    await Forgotpassword.clickLogin();
    await Forgotpassword.clickForgotPassword();
    await Forgotpassword.submitForgotPasswordEmail(USERNAME3);
    await expect(
      page.locator("text=Mail sending limit is reached, please try after 24 hours")
    ).toBeVisible();

  });



});




test.describe.serial("@forgotFunctionality Forgot password Functionality Verification with Code",()=>{

  
  // test('Verify OTP sent successfully', async ({ page, Forgotpassword }) => {

  //   await page.goto(BASE_URL);
  //   await Forgotpassword.enterUsername(USERNAME2);
  //   await Forgotpassword.clickLogin();
  //   await Forgotpassword.clickForgotPassword();
  //   await Forgotpassword.submitForgotPasswordEmail(USERNAME2);
  //   await page.waitForLoadState('domcontentloaded')
  //   await expect(page.locator("text=A verification code has been sent to your registered E-mail ID. Verify with the OTP to login.")).toBeVisible();

  // });

  
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
   await page.waitForLoadState('domcontentloaded')
  await expect(page).toHaveURL(/changepassword/);
})



test("@smoke  @forgot Successful Forgot Password Reset", async ({ page, Forgotpassword }) => { 
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




test("@regression last three Passwords validation",async({page,request,Forgotpassword})=>{
   const Arr=[FP1,FP2,FP3,FP4];
  
      for (let i=0;i<4;i++){

      if (i<3){
      const response=await request.post(BASE_URL+'/v1/user/forgotpassword',{
          headers:{
              Authorization:`Basic ${ForgotAuthorization}`
          },
          data:{
              "email_id": MAIL
          }
      })
      expect(response.status()).toBe(200);
      console.log (await response.json());
      
  
     const otpvalue =await getOTPWithRetry(Date.now());
  
     const data=await response.json();
     const code=data.code;
  
      const verifyresponse= await request.post(BASE_URL +'/v1/user/'+code + '/verify',{
          headers:{
              Authorization:`Basic ${ForgotAuthorization}`
          },
          data:
              {"otp":otpvalue}
      })
          expect(verifyresponse.status()).toBe(200);
          console.log (await verifyresponse.json());
          const verifydata=await verifyresponse.json();
          const verifydatastatus=verifydata.status;
          const verifydatacode=verifydata.code;
          expect(verifydatastatus).toBe(1);
  
      const passwordse=await request.post(BASE_URL +'/v1/user/'+ verifydatacode + '/passwordUserDashboard',{
          headers:{
              Authorization:`Basic ${ForgotAuthorization}`
          },
          data:{
          "npassword": Arr[i]
          }
      })
      
      expect(passwordse.status()).toBe(200);
      console.log (await passwordse.json());
      const passworddata=await passwordse.json();
      expect(passworddata.status).toBe(1);
      expect(passworddata.message).toBe("Password changed successfully");
      }

      else{
        await page.goto(BASE_URL);
  await Forgotpassword.enterUsername(USERNAME2);
  await Forgotpassword.clickLogin();
  await Forgotpassword.clickForgotPassword();
  await Forgotpassword.submitForgotPasswordEmail(USERNAME2);
  const otp = await getOTPWithRetry(Date.now());
  console.log(" Using OTP:", otp);
  await page.waitForLoadState('domcontentloaded')
  console.log(" Using OTP:", otp);
  await page.getByLabel(/Enter OTP/).fill(otp);
  console.log("otp is entered..........")
  await page.click('//input[@value="Verify"]'); 
  await expect(page).not.toHaveURL(/changepassword/);
   await Forgotpassword.newpassword(Arr[1]);
   await Forgotpassword.confirmpassword(Arr[1]);
   await Forgotpassword.resetButton();
   await expect(page.getByText("Current password matches with one of the last three passwords")).toBeVisible();
      }
      console.log(`@@@@@@@@@@@@@@@@ password setting for the attempt${i+1}`)
  

}

})




})