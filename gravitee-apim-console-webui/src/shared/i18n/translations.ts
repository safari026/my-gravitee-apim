import { enAuth } from './translations/en/auth';
import { enCommon } from './translations/en/common';
import { enNavigation } from './translations/en/navigation';
import { enUserMenu } from './translations/en/userMenu';
import { enDashboard } from './translations/en/dashboard';
import { enTasks } from './translations/en/tasks';
import { enMessages } from './translations/en/messages';
import { enApis } from './translations/en/apis';
import { ruAuth } from './translations/ru/auth';
import { ruCommon } from './translations/ru/common';
import { ruNavigation } from './translations/ru/navigation';
import { ruUserMenu } from './translations/ru/userMenu';
import { ruDashboard } from './translations/ru/dashboard';
import { ruTasks } from './translations/ru/tasks';
import { ruMessages } from './translations/ru/messages';
import { ruApis } from './translations/ru/apis';

export type Language = 'en' | 'ru';

export const translations = {
  en: {
    auth: enAuth,
    common: enCommon,
    navigation: enNavigation,
    userMenu: enUserMenu,
    dashboard: enDashboard,
    tasks: enTasks,
    messages: enMessages,
    apis: enApis,
  },
  ru: {
    auth: ruAuth,
    common: ruCommon,
    navigation: ruNavigation,
    userMenu: ruUserMenu,
    dashboard: ruDashboard,
    tasks: ruTasks,
    messages: ruMessages,
    apis: ruApis,
  },
} as const;
