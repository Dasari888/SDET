import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { Rooms } from '../pages/Rooms';
import { LocationCheck } from '../pages/components/LocationCheck';
import { NotifyMe } from '../src/NotifyMe';
import { SchedulerCheck } from '../src/SchedulerCheck';

type MyFixtures = {
    loginPage: LoginPage;
    roomsPage: Rooms;
    locationCheck: LocationCheck;
    notifyMe: NotifyMe;
    schedulerCheck: SchedulerCheck;
};

export const test = base.extend<MyFixtures>({
    loginPage: async ({ page }: { page: any }, use: any) => {
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
});

export { expect } from '@playwright/test';
