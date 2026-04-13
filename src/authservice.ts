import { expect, APIRequestContext } from '@playwright/test';
import { BASE_URL, client_id, client_secret } from '../utils/test-data';

export class AuthService {

    static async getAuthCode(
        request: APIRequestContext,
        email: string,
        password: string,
        app_token: string = "default_token"
    ): Promise<string> {
        console.log("Getting Auth Code for:", email,password,app_token);

        const response = await request.post(`${BASE_URL}/v1/user/login`, {
            headers: {
                Authorization: `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString('base64')}`,
                'Content-Type': 'application/json',
                'Accept': '*/*'
            },
            data: {
                email_id: email,
                password: password,
                app_token: app_token
            }
        });

     const loginAPIResponse=await response.json();
        expect(response.status()).toBe(200);
        console.log("Login API Response:", loginAPIResponse);
        expect(loginAPIResponse.status).toBe(1);

        return loginAPIResponse.code;
    }

    static async getAccessToken(
        request: APIRequestContext,
        email: string,
        password: string,
        app_token?: string
    ): Promise<string> {

        const authCode = await this.getAuthCode(request, email, password, app_token);
        console.log("Auth Code%%%%%%%%%%%%%%:", authCode);

        const response = await request.post(`${BASE_URL}/v1/user/token`, {
            headers: {
                'Accept': '*/*',
                'grant_type': 'code',
                'client_id': client_id,
                'client_secret': client_secret,
                'code': authCode
            }
        });

        const res = await response.json();

        console.log("Token Response:", res);

        expect(response.status()).toBe(200);
        expect(res.status).toBe(1);
        expect(res.access_token).toBeTruthy();

        return res.access_token;
    }
}