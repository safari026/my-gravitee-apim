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
import SettingsAnalyticsDashboardComponentAjs from './settings-analytics-dashboard.components.ajs';
import DialogQueryFilterInformationController from './query-filter-information.dialog.controller';

import { LanguageService } from '../../../../shared/i18n/language.service';

describe('SettingsAnalyticsDashboardComponentAjs', () => {
  let controller: any;
  let languageService: LanguageService;
  let dashboardService: { get: jest.Mock; getIndexedFields: jest.Mock; getChartService: jest.Mock; create: jest.Mock; update: jest.Mock };
  let notificationService: { show: jest.Mock };
  let ngRouter: { navigate: jest.Mock };

  const createController = () => {
    const instance: any = {};
    const controllerFn = (SettingsAnalyticsDashboardComponentAjs.controller as unknown[])[
      (SettingsAnalyticsDashboardComponentAjs.controller as unknown[]).length - 1
    ] as (...args: unknown[]) => void;

    controllerFn.call(
      instance,
      dashboardService,
      notificationService,
      { $watch: jest.fn() },
      {},
      { show: jest.fn() },
      jest.fn(),
      ngRouter,
      { org: { currentEnv: { id: 'env-1' } } },
      languageService,
    );
    return instance;
  };

  beforeEach(() => {
    localStorage.removeItem('gio-console-lang');
    languageService = new LanguageService();
    dashboardService = {
      get: jest.fn(),
      getIndexedFields: jest.fn().mockReturnValue([{ label: 'API', value: 'api' }]),
      getChartService: jest.fn().mockReturnValue({ chart: {} }),
      create: jest.fn().mockResolvedValue({ data: { id: 'new-1' } }),
      update: jest.fn().mockResolvedValue({ data: { id: 'edit-1' } }),
    };
    notificationService = { show: jest.fn() };
    ngRouter = { navigate: jest.fn() };
    controller = createController();
  });

  afterEach(() => {
    localStorage.removeItem('gio-console-lang');
  });

  describe('new dashboard type', () => {
    it('stores the route type as-is and overlays display labels', () => {
      controller.activatedRoute = { snapshot: { params: { type: 'Platform' } } };
      controller.$onInit();

      expect(controller.dashboard.type).toEqual('Platform');
      expect(controller.displayType(controller.dashboard.type)).toEqual('Platform');
      expect(
        controller.translate('settings.analytics.dashboard.newTitle', { type: controller.displayType(controller.dashboard.type) }),
      ).toEqual('New dashboard [Platform]');

      languageService.setLanguage('ru');
      expect(controller.dashboard.type).toEqual('Platform');
      expect(controller.displayType(controller.dashboard.type)).toEqual('Платформа');
      expect(
        controller.translate('settings.analytics.dashboard.newTitle', { type: controller.displayType(controller.dashboard.type) }),
      ).toEqual('Новый дашборд [Платформа]');

      languageService.setLanguage('en');
      expect(controller.displayType(controller.dashboard.type)).toEqual('Platform');
    });
  });

  describe('i18n', () => {
    it('translates editor chrome EN → RU → EN without reload', () => {
      expect(controller.translate('settings.analytics.dashboard.back')).toEqual('Back to dashboards');
      expect(controller.translate('settings.analytics.dashboard.details')).toEqual('Details');
      expect(controller.translate('settings.analytics.dashboard.name')).toEqual('Dashboard name');
      expect(controller.translate('settings.analytics.dashboard.enabled')).toEqual('Enabled dashboard');
      expect(controller.translate('settings.analytics.dashboard.queryFilter')).toEqual('Query filter');
      expect(controller.translate('settings.analytics.dashboard.enablePreview')).toEqual('Enable preview');
      expect(controller.translate('settings.analytics.dashboard.addWidget')).toEqual('Add a new widget');
      expect(controller.translate('common.save')).toEqual('Save');
      expect(controller.translate('settings.analytics.dashboard.titleWithType', { name: 'Overview', type: 'API' })).toEqual(
        'Overview [API]',
      );

      languageService.setLanguage('ru');
      expect(controller.translate('settings.analytics.dashboard.back')).toEqual('Назад к дашбордам');
      expect(controller.translate('settings.analytics.dashboard.name')).toEqual('Имя дашборда');
      expect(controller.translate('settings.analytics.dashboard.enablePreview')).toEqual('Включить предпросмотр');
      expect(controller.translate('common.save')).toEqual('Сохранить');
      expect(controller.translate('settings.analytics.dashboard.titleWithType', { name: 'Overview', type: controller.displayType('API') })).toEqual(
        'Overview [API]',
      );

      languageService.setLanguage('en');
      expect(controller.translate('settings.analytics.dashboard.back')).toEqual('Back to dashboards');
      expect(controller.translate('common.reset')).toEqual('Reset');
    });

    it('translates query-filter help chrome EN → RU → EN', () => {
      const dialog: any = {};
      DialogQueryFilterInformationController.call(dialog, { cancel: jest.fn() }, languageService);

      expect(dialog.translate('settings.analytics.queryHelp.title')).toEqual('How to write a query filter');
      expect(dialog.translate('settings.analytics.queryHelp.example1')).toEqual('Example 1');
      expect(dialog.translate('common.close')).toEqual('Close');

      languageService.setLanguage('ru');
      expect(dialog.translate('settings.analytics.queryHelp.title')).toEqual('Как написать фильтр запроса');
      expect(dialog.translate('settings.analytics.queryHelp.example2')).toEqual('Пример 2');
      expect(dialog.translate('common.close')).toEqual('Закрыть');

      languageService.setLanguage('en');
      expect(dialog.translate('settings.analytics.queryHelp.title')).toEqual('How to write a query filter');
    });

    it('shows a translated save toast and keeps unknown types as-is', () => {
      controller.activatedRoute = { snapshot: { params: { type: 'Custom' } } };
      controller.$onInit();

      expect(controller.dashboard.type).toEqual('Custom');
      expect(controller.displayType('Custom')).toEqual('Custom');
      expect(controller.translate('settings.analytics.dashboardCreated')).toEqual('Dashboard created with success');

      languageService.setLanguage('ru');
      expect(controller.dashboard.type).toEqual('Custom');
      expect(controller.displayType('Custom')).toEqual('Custom');
      expect(controller.translate('settings.analytics.dashboardUpdated')).toEqual('Дашборд успешно обновлен');
      expect(controller.translate('settings.analytics.dashboardCreated')).toEqual('Дашборд успешно создан');
    });
  });
});
