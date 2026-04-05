import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { Rooms } from '../pages/Rooms';
import { LocationCheck } from '../pages/components/LocationCheck';
import { NotifyMe } from '../src/NotifyMe';
import { SchedulerCheck } from '../src/SchedulerCheck';
import { Forgotpassword } from '../pages/Forgotpassword';
import { Page } from '@playwright/test';

type MyFixtures = {
    loginPage: LoginPage;
    roomsPage: Rooms;
    locationCheck: LocationCheck;
    notifyMe: NotifyMe;
    schedulerCheck: SchedulerCheck;
    Forgotpassword:  Forgotpassword
};

export const test = base.extend<MyFixtures>({
    loginPage: async ({ page }: { page: Page }, use) => {
        await use(new LoginPage(page));
    },
    roomsPage: async ({ page }: { page: any }, use: any) => {
        await use(new Rooms(page));
    },
    locationCheck: async ({ page }: { page: any }, use: any) => {
        await use(new LocationCheck(page));
    },
    notifyMe: async ({ page }: { page: any }, use: any) => {
        await use(new NotifyMe(page));
    },
    schedulerCheck: async ({ page }: { page: any }, use: any) => {
        await use(new SchedulerCheck(page));
    },
      Forgotpassword: async ({ page }:{ page: any }, use:any) => {
    await use(new Forgotpassword(page));
  }
});

export { expect } from '@playwright/test';
