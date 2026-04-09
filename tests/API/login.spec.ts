import {test,expect} from '@playwright/test';
import { BASE_URL ,USERNAME,BONEPLUS_DEV_HASHPASSWORD,client_id,client_secret,logintempBlock_USERNAME,Validemail,
    logintempBlock_HASHPASSWORD,logintempBlock_USERNAME2,logintempBlock_HASHPASSWORD2,validHashpassword2} from '../../utils/test-data';

test.describe("Login API Tests",()=>{  


    test("Successful login With Valid Credentials",async ({request})=>{
        const response=await request.post(`${BASE_URL}/v1/user/login`,{
            headers:{
                Authorization:`Basic ${Buffer.from(`${client_id}:${client_secret}`).toString('base64')}`,
                'Content-Type':'application/json'
            },
            data:{                
        "email_id": USERNAME,
        "password": BONEPLUS_DEV_HASHPASSWORD,
        "app_token": "erdsfsd34dsfe34naveentest_nav"

            }
        
        })
        const loginAPIResponse=await response.json();
        expect(response.status()).toBe(200);
        console.log("Login API Response:", loginAPIResponse);
        expect(loginAPIResponse.status).toBe(1);
    })



    test("Account lock validation (4 invalid + valid)", async ({ request }) => {

        let response;
        let body;
        for (let i = 0; i < 4; i++) {
            response = await request.post(`${BASE_URL}/v1/user/login`, {
                headers: {
                    Authorization: `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString('base64')}`,
                    'Content-Type': 'application/json'
                },
                data: {
                    email_id: logintempBlock_USERNAME,
                    password: "WrongPassword123!",
                    app_token: "erdsf"
                }
            });

            body = await response.json();
            expect(response.status()).toBe(200);
            expect(body.status).toBe(0);
            // expect(body.message).toContain("Invalid credentials");
        }

        response = await request.post(`${BASE_URL}/v1/user/login`, {
            headers: {
                Authorization: `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString('base64')}`,
                'Content-Type': 'application/json'
            },
            data: {
                email_id: logintempBlock_USERNAME,
                password: logintempBlock_HASHPASSWORD, 
                app_token: "erdsf"
            }
        });
        body = await response.json();
        expect(response.status()).toBe(200);
        expect(body.status).toBe(0);
        expect(body.message).toContain("Account temporarily locked");
    });


    test("Account lock validation (4 invalid + invalid)", async ({ request }) => {

        let response;
        let body;
        for (let i = 0; i < 4; i++) {
            response = await request.post(`${BASE_URL}/v1/user/login`, {
                headers: {
                    Authorization: `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString('base64')}`,
                    'Content-Type': 'application/json'
                },
                data: {
                    email_id: logintempBlock_USERNAME2,
                    password: "WrongPassword123!",
                    app_token: "erdsf"
                }
            });

            body = await response.json();
            expect(response.status()).toBe(200);
            expect(body.status).toBe(0);
            // expect(body.message).toContain("Invalid credentials");
        }

        response = await request.post(`${BASE_URL}/v1/user/login`, {
            headers: {
                Authorization: `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString('base64')}`,
                'Content-Type': 'application/json'
            },
            data: {
                email_id: logintempBlock_USERNAME2,
                password: "WrongPassword123!", 
                app_token: "erdsf"
            }
        });
        body = await response.json();
        expect(response.status()).toBe(200);
        expect(body.status).toBe(0);
        expect(body.message).toContain("Account temporarily locked");
    });


        test("Login with invalid Email",async({request})=>{
        const response=await request.post(`${BASE_URL}/v1/user/login`,{
            headers:{
                Authorization:`Basic ${Buffer.from(`${client_id}:${client_secret}`).toString('base64')}`
            },
            data:{
                "email_id": "invalid@example.com",
                "password": "Asdfhjkkbbjklkljjj",
                "app_token": "erdsf"
            }
        });
        const loginAPIResponse=await response.json();
        expect(response.status()).toBe(200);
        expect(loginAPIResponse.status).toBe(0);
        expect(loginAPIResponse.message).toBe("invalid credentials");
    });

    
  

    test("Login with empty credentials", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/v1/user/login`, {
        headers: {
            Authorization: `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString('base64')}`
        },
        data: {
            email_id: "",
            password: "",
            app_token: ""
        }
    });

    const res = await response.json();
    expect(res.status).toBe(0);
    expect(res.message).toBe("invalid parameters");
    
    

});


    test("Login with missing email", async ({ request }) => {
        const response = await request.post(`${BASE_URL}/v1/user/login`, {
            headers: {
                Authorization: `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString('base64')}`
            },
            data: {
                password: BONEPLUS_DEV_HASHPASSWORD,
                app_token: "token"
            }
        });

        const res = await response.json();
        expect(res.status).toBe(0);
        expect(res.message).toBe("invalid parameters");
    });

    test.describe.serial("login with invalid and valid credentials", ()=>{
          test("Login with invalid password",async({request})=>{
        const response=await request.post(`${BASE_URL}/v1/user/login`,{
            headers:{
                Authorization:`Basic ${Buffer.from(`${client_id}:${client_secret}`).toString('base64')}`
            },
            data:{
                "email_id": Validemail,
                "password": "Asdfhjkkbbjklkljj",
                "app_token": "erdsf"
            }
        });
        const loginAPIResponse=await response.json();
        expect(response.status()).toBe(200);
        expect(loginAPIResponse.status).toBe(0);
        expect(loginAPIResponse.message).toBe("invalid credentials");
    })
     test("Successful login With Valid Credentials 2",async ({request})=>{
        const response=await request.post(`${BASE_URL}/v1/user/login`,{
            headers:{
                Authorization:`Basic ${Buffer.from(`${client_id}:${client_secret}`).toString('base64')}`,
                'Content-Type':'application/json'
            },
            data:{                
        "email_id": Validemail,
        "password": validHashpassword2,
        "app_token": "erdsfsd34dsfe34naveentest_nav"

            }
        
        })
        const loginAPIResponse=await response.json();
        expect(response.status()).toBe(200);
        console.log("Login API Response:", loginAPIResponse);
        expect(loginAPIResponse.status).toBe(1);
    })


    })


})