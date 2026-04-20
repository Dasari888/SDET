import { APIRequestContext, expect } from '@playwright/test';

export class LocationAPI {
  constructor(private request: APIRequestContext) {}

  async getLocationSettings(baseURL: string, headers: any, locId: string) {
    const resp = await this.request.get(
      `${baseURL}/v1/location/${locId}/settings`,
      { headers }
    );

    expect(resp.ok()).toBeTruthy();
    const data = await resp.json();
    expect(data.status).toBe(1);
    return data.data;
  }

  async getLocation(baseURL: string, headers: any, locId: string) {
    const resp = await this.request.get(
      `${baseURL}/v1/location/${locId}/get`,
      { headers }
    );

    expect(resp.ok()).toBeTruthy();
    const data = await resp.json();
    expect(data.status).toBe(1);
    return data.data;
  }

  async getAllLocations(baseURL: string, headers: any) {
    const resp = await this.request.get(
      `${baseURL}/v1/location/get`,
      { headers }
    );

    expect(resp.ok()).toBeTruthy();
    const data = await resp.json();
    expect(data.status).toBe(1);
    return data.data;
  }

  async getCompanyCodesTimezone(baseURL: string, headers: any) {
    const resp = await this.request.get(
      `${baseURL}/v1/company-codes/gettimezone`,
      { headers }
    );

    expect(resp.ok()).toBeTruthy();
    const data = await resp.json();
    expect(data.status).toBe(1);
    return data.data;
  }

  async getCompany(baseURL: string, headers: any, cId: string) {
    const resp = await this.request.get(
      `${baseURL}/v1/company-v2/get/${cId}`,
      { headers }
    );
 //https://dev-dashboard-boneplus.b1automation.com/v1/company-v2/get/101
    expect(resp.ok()).toBeTruthy();
    const data = await resp.json();
    expect(data.status).toBe(1);
    return data.data;
  }

  async getTimezone(baseURL: string, headers: any, tId: string) {
    const resp = await this.request.get(
      `${baseURL}/v1/timezone/get/${tId}`,
      { headers }
    );

    expect(resp.ok()).toBeTruthy();
    const data = await resp.json();
    expect(data.status).toBe(1);
    return data.data;
  }

  async getLocationPreferences(baseURL: string, headers: any, locId: string) {
    const resp = await this.request.get(
      `${baseURL}/v1/location/preference/${locId}/get`,
      { headers }
    );

    expect(resp.ok()).toBeTruthy();
    const data = await resp.json();
    expect(data.status).toBe(1);
    return data.data;
  }

  
    async getLocations(baseUrl: string, headers: any) {
    const response = await this.request.get(`${baseUrl}/v1/location/get`, {
        headers
    });

    expect(response.ok()).toBeTruthy();

    const json = await response.json();
    expect(json.status).toBe(1);

    const locations = json.data.map((loc: any) => ({
        id: loc.location_id,
        name: loc.location_name.trim(),
        countryId: loc.country_id,
        timezoneId: loc.timezone_id,
        sortId: loc.sortid ?? loc.sort_id ?? 0
    }));

    return locations;
    }



}