/*
 * Copyright (C) 2015 The Gravitee team (http://gravitee.io)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import SettingsAnalyticsComponentAjs from './settings-analytics.component.ajs';

import { LanguageService } from '../../../shared/i18n/language.service';

describe('SettingsAnalyticsComponentAjs', () => {
  let controller: any;
  let languageService: LanguageService;
  let notificationService: { show: jest.Mock };
  let portalSettingsService: { save: jest.Mock; isReadonly: jest.Mock };
  let dashboardService: { list: jest.Mock; delete: jest.Mock; update: jest.Mock };
  let userService: { isUserHasPermissions: jest.Mock };
  let router: { navigate: jest.Mock };
  let mdDialog: { show: jest.Mock };
  const constants = { env: { settings: { analytics: { clientTimeout: 1000 } } } };

  const createController = () => {
    const instance: any = {};
    const controllerFn = (SettingsAnalyticsComponentAjs.controller as unknown[])[
      (SettingsAnalyticsComponentAjs.controller as unknown[]).length - 1
    ] as (...args: unknown[]) => void;

    controllerFn.call(
      instance,
      notificationService,
      portalSettingsService,
      constants,
      mdDialog,
      dashboardService,
      userService,
      router,
      languageService,
    );
    instance.activatedRoute = {};
    return instance;
  };

  beforeEach(() => {
    localStorage.removeItem('gio-console-lang');
    languageService = new LanguageService();
    notificationService = { show: jest.fn() };
    portalSettingsService = { save: jest.fn().mockResolvedValue({ data: {} }), isReadonly: jest.fn() };
    dashboardService = {
      list: jest.fn().mockImplementation((type: string) => Promise.resolve({ data: [{ id: `${type}-1`, name: `${type} dash` }] })),
      delete: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
    };
    userService = { isUserHasPermissions: jest.fn().mockReturnValue(true) };
    router = { navigate: jest.fn() };
    mdDialog = { show: jest.fn().mockResolvedValue(false) };
    controller = createController();
  });

  afterEach(() => {
    localStorage.removeItem('gio-console-lang');
  });

  describe('dashboardsByType', () => {
    it('keeps Platform/API/Application object keys and lists backend types unchanged', async () => {
      controller.$onInit();
      await Promise.all(dashboardService.list.mock.results.map(result => result.value));

      expect(dashboardService.list).toHaveBeenCalledWith('PLATFORM');
      expect(dashboardService.list).toHaveBeenCalledWith('API');
      expect(dashboardService.list).toHaveBeenCalledWith('APPLICATION');
      expect(Object.keys(controller.dashboardsByType)).toEqual(['Platform', 'API', 'Application']);

      languageService.setLanguage('ru');
      expect(Object.keys(controller.dashboardsByType)).toEqual(['Platform', 'API', 'Application']);
      expect(controller.displayType('Platform')).toEqual('Платформа');
    });
  });

  describe('i18n', () => {
    it('translates list chrome EN → RU → EN without reload and overlays type labels', () => {
      expect(controller.translate('settings.analytics.title')).toEqual('Analytics');
      expect(controller.translate('settings.analytics.dashboards')).toEqual('Dashboards');
      expect(controller.translate('settings.analytics.name')).toEqual('Name');
      expect(controller.translate('settings.analytics.settings')).toEqual('Settings');
      expect(controller.translate('settings.analytics.httpClientTimeout')).toEqual('HTTP Client Timeout');
      expect(controller.translate('common.save')).toEqual('Save');
      expect(controller.translate('common.reset')).toEqual('Reset');
      expect(controller.displayType('Platform')).toEqual('Platform');
      expect(controller.displayType('API')).toEqual('API');
      expect(controller.displayType('Application')).toEqual('Application');
      expect(controller.displayType('PLATFORM')).toEqual('PLATFORM');
      expect(controller.translate('settings.analytics.addDashboard', { type: controller.displayType('Platform') })).toEqual(
        'Add a new Platform dashboard',
      );

      languageService.setLanguage('ru');
      expect(controller.translate('settings.analytics.title')).toEqual('Аналитика');
      expect(controller.translate('settings.analytics.dashboards')).toEqual('Дашборды');
      expect(controller.translate('settings.analytics.httpClientTimeout')).toEqual('Таймаут HTTP-клиента');
      expect(controller.translate('common.save')).toEqual('Сохранить');
      expect(controller.displayType('Platform')).toEqual('Платформа');
      expect(controller.displayType('Application')).toEqual('Приложение');
      expect(controller.displayType('PLATFORM')).toEqual('PLATFORM');
      expect(controller.translate('settings.analytics.addDashboard', { type: controller.displayType('Platform') })).toEqual(
        'Добавить дашборд Платформа',
      );

      languageService.setLanguage('en');
      expect(controller.translate('settings.analytics.title')).toEqual('Analytics');
      expect(controller.displayType('Platform')).toEqual('Platform');
      expect(controller.translate('common.reset')).toEqual('Reset');
    });

    it('navigates with untranslated type keys', () => {
      controller.newDashboard('Platform');
      expect(router.navigate).toHaveBeenCalledWith(['dashboard', 'Platform', 'new'], { relativeTo: controller.activatedRoute });

      controller.navigateToDashboard('Application', 'dash-1');
      expect(router.navigate).toHaveBeenCalledWith(['dashboard', 'Application', 'dash-1'], { relativeTo: controller.activatedRoute });
    });

    it('shows translated delete dialog and toast at call time', async () => {
      mdDialog.show.mockResolvedValue(true);
      const dashboard = { id: 'd1', name: 'Overview' };

      languageService.setLanguage('ru');
      controller.delete(dashboard);
      await mdDialog.show.mock.results[0].value;
      await dashboardService.delete.mock.results[0].value;

      expect(mdDialog.show).toHaveBeenCalledWith(
        expect.objectContaining({
          locals: expect.objectContaining({
            title: "Вы уверены, что хотите удалить дашборд 'Overview'?",
            confirmButton: 'Удалить',
          }),
        }),
      );
      expect(notificationService.show).toHaveBeenCalledWith("Дашборд 'Overview' удален");
    });
  });
});
