import {test,expect} from 'playwright/test';
import { FP1,FP2,FP3,FP4,Forgot_npassword2,BASE_URL,ForgotAuthorization,MAIL, Forgot_npassword3} from '../../utils/test-data'; 
import { getOTPWithRetry } from '../../src/otp';
import { AuthService } from '../../src/authservice';
import { access } from 'node:fs';
test.describe.serial("Change Password API tests",()=>{
    test("Successful forgot password change",async({request})=>{
    
      const response=await request.post(BASE_URL+'/v1/user/forgotpassword',{
            headers:{
                Authorization:`Basic ${ForgotAuthorization}`
            },
            data:{
                "email_id": MAIL
            }
        })
        expect(response.status()).toBe(200);
        const forgotresponse = await response.json();
        expect(forgotresponse.status).toBe(1);
        
    
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
            "npassword":Forgot_npassword2
            }
        })
        expect(passwordse.status()).toBe(200);
        console.log (await passwordse.json());
        const passworddata=await passwordse.json();
        expect(passworddata.status).toBe(1);
        expect(passworddata.message).toBe("Password changed successfully");
    
    })

   test("Change Password Successfully", async ({ request }) => {

    await new Promise(res => setTimeout(res, 10000)); 
    const accessToken = await AuthService.getAccessToken(
        request,
        MAIL,        
        Forgot_npassword2,
        "ghhjkkk"      
    );

    const response = await request.post(`https://dev-boneplus.b1automation.com/v1/user/password`, {
        headers: {
            access_token: accessToken,
            'Content-Type': 'application/json'
        },
        data: {
            password: Forgot_npassword2,
            npassword: Forgot_npassword3
        }
    });

    const res = await response.json();

    console.log("Change Password Response:", res);

    expect(response.status()).toBe(200);
    expect(res.status).toBe(1);
});
})