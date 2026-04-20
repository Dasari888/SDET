import { APIRequestContext, expect } from '@playwright/test';

export class UserAPI {
  constructor(private request: APIRequestContext) {}

  async getUserDetails(baseURL: string, headers: any) {
    const resp = await this.request.get(`${baseURL}/v1/user/details`, { headers });

    expect(resp.ok()).toBeTruthy();
    expect(resp.status()).toBe(200);


    const data = await resp.json();
    expect(data.status).toBe(1);
    return data.data;
  }

}