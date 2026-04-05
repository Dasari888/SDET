import {test ,expect} from '../fixtures/test-fixtures'
import {BASE_URL,USERNAME,PASSWORD} from '../utils/test-data'


test.describe("Login page full validation",()=>
{

    test("successful LOGIN",async({page,Forgotpassword})=>{
        await page.goto(BASE_URL);
        await Forgotpassword.enterUsername(USERNAME);
        await Forgotpassword.clickLogin();
        await Forgotpassword.enterPassword(PASSWORD);
        await Forgotpassword.clickFinalLogin();
        await page.waitForURL(/dashboard/);
        expect(page).toHaveURL(/dashboard/);
    })


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
    test(`verify email format ${email}`,async({page,Forgotpassword})=>{
        await page.goto(BASE_URL)
        await Forgotpassword.enterUsername(email)
        await Forgotpassword.clickLogin()
        await expect(page.locator("text=Please enter a valid E-mail address ")).toBeVisible();

    }
)})

    

})