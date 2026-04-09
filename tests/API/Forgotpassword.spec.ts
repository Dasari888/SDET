import {test,expect} from 'playwright/test';

import { getOTPWithRetry } from '../../src/otp';
import { FP1,FP2,FP3,FP4,Forgot_npassword,BASE_URL,ForgotAuthorization,MAIL } from '../../utils/test-data';   
import { get } from 'node:http';

test.describe.serial("Forgot Password API serial tests ",()=>{

test("Successful password change",async({request})=>{

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
        "npassword":Forgot_npassword
        }
    })
    expect(passwordse.status()).toBe(200);
    console.log (await passwordse.json());
    const passworddata=await passwordse.json();
    expect(passworddata.status).toBe(1);
    expect(passworddata.message).toBe("Password changed successfully");





})


test ("@Api three passwords match",async({request})=>{
    
    const Arr=[FP1,FP2,FP3,FP4];

    for (let i=0;i<4;i++){
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
        "npassword": Arr[i<3? i:1]
        }
    })
    if(i<3){
    expect(passwordse.status()).toBe(200);
    console.log (await passwordse.json());
    const passworddata=await passwordse.json();
    expect(passworddata.status).toBe(1);
    expect(passworddata.message).toBe("Password changed successfully");
    }


    else {
    expect(passwordse.status()).toBe(200);
    console.log (await passwordse.json());
    const passworddata=await passwordse.json();

    expect(passworddata.status).toBe(0);
    expect(passworddata.message).toBe("Current password matches with one of the last three passwords")
    }
    console.log(`#### password set for attempt ${i+1} completed`)
}



})



    


})