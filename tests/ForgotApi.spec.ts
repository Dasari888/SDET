import {test,expect} from 'playwright/test';

import { getOTPWithRetry } from '../src/otp';
import { FP1,FP2,FP3,FP4,BASE_URL } from '../utils/test-data';   
import { get } from 'node:http';

test ("email validate",async({request})=>{
    
    const Arr=[FP1,FP2,FP3,FP4];

    for (let i=0;i<4;i++){
    const response=await request.post(BASE_URL+'v1/user/forgotpassword',{
        headers:{
            Authorization:"Basic MTMxYzg0Yzk3OWMxZjBhZWU4NDgxOWQ0MDoxYjBjMjcxMjc3YTZjNmE2NjJkZTcwNWRhM2M1ZmE1OTY0YWE0MTFh"
        },
        data:{
            "email_id": "playtest567@gmail.com"
        }
    })
    expect(response.status()).toBe(200);
    console.log (await response.json());
    

   const otpvalue =await getOTPWithRetry(Date.now());

   const data=await response.json();
   const code=data.code;

    const verifyresponse= await request.post(BASE_URL +'v1/user/'+code + '/verify',{
        headers:{
            Authorization:"Basic MTMxYzg0Yzk3OWMxZjBhZWU4NDgxOWQ0MDoxYjBjMjcxMjc3YTZjNmE2NjJkZTcwNWRhM2M1ZmE1OTY0YWE0MTFh"
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
if(i<3){
const passwordse=await request.post(BASE_URL +'v1/user/'+ verifydatacode + '/passwordUserDashboard',{
    headers:{
           Authorization:"Basic MTMxYzg0Yzk3OWMxZjBhZWU4NDgxOWQ0MDoxYjBjMjcxMjc3YTZjNmE2NjJkZTcwNWRhM2M1ZmE1OTY0YWE0MTFh"
    },
    data:{
       "npassword": Arr[i]
    }
})
expect(passwordse.status()).toBe(200);
console.log (await passwordse.json());
const passworddata=await passwordse.json();

expect(passworddata.status).toBe(1);
expect(passworddata.message).toBe("Password changed successfully");}


else {const passwordse=await request.post(BASE_URL+'v1/user/'+ verifydatacode + '/passwordUserDashboard',{
    headers:{
           Authorization:"Basic MTMxYzg0Yzk3OWMxZjBhZWU4NDgxOWQ0MDoxYjBjMjcxMjc3YTZjNmE2NjJkZTcwNWRhM2M1ZmE1OTY0YWE0MTFh"
    },
    data:{
       "npassword": Arr[1]
    }
})
expect(passwordse.status()).toBe(200);
console.log (await passwordse.json());
const passworddata=await passwordse.json();

expect(passworddata.status).toBe(0);
expect(passworddata.message).toBe("Current password matches with one of the last three passwords")}



}



})