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
import PortalThemeController from './portalTheme.controller';

import { LanguageService } from '../../../shared/i18n/language.service';

describe('PortalThemeController', () => {
  let controller: PortalThemeController;
  let languageService: LanguageService;
  let notificationService: { show: jest.Mock; showError: jest.Mock };
  let mdDialog: { confirm: jest.Mock; show: jest.Mock };
  let $scope: { $on: jest.Mock; $applyAsync: jest.Mock; theme: { enabled: boolean }; themeComponent: { css: unknown[] }; maxSize: number };

  beforeEach(() => {
    localStorage.removeItem('gio-console-lang');
    languageService = new LanguageService();
    notificationService = { show: jest.fn(), showError: jest.fn() };
    mdDialog = { confirm: jest.fn().mockReturnValue({}), show: jest.fn().mockResolvedValue(false) };
    $scope = {
      $on: jest.fn(),
      $applyAsync: jest.fn(),
      theme: { enabled: true },
      themeComponent: { css: [] },
      maxSize: 1000,
    };

    controller = new PortalThemeController(
      {},
      $scope,
      mdDialog,
      { env: { settings: { portal: { url: '', uploadMedia: { maxSizeInOctet: 1000 } } } }, defaultPortal: 'classic' },
      { getCurrent: jest.fn() },
      notificationService,
      { trustAsResourceUrl: jest.fn() },
      languageService,
    );
  });

  afterEach(() => {
    localStorage.removeItem('gio-console-lang');
  });

  describe('i18n', () => {
    it('translates chrome EN → RU → EN and keeps enabled as a boolean', () => {
      expect(controller.translate('settings.theme.title')).toEqual('Theme');
      expect(controller.translate('settings.theme.enabled')).toEqual('Enabled');
      expect($scope.theme.enabled).toBe(true);

      languageService.setLanguage('ru');
      controller.$onChanges();
      expect(controller.translate('settings.theme.title')).toEqual('Тема');
      expect(controller.translate('settings.theme.enabled')).toEqual('Включено');
      expect($scope.theme.enabled).toBe(true);
      expect($scope.$applyAsync).toHaveBeenCalled();

      languageService.setLanguage('en');
      controller.$onChanges();
      expect(controller.translate('settings.theme.title')).toEqual('Theme');
      expect(controller.translate('settings.theme.enabled')).toEqual('Enabled');
    });

    it('overlays inherited and parent placeholders without translating CSS descriptions', () => {
      $scope.themeComponent.css = [{ name: '--gv-theme-color', description: 'Primary', value: '#fff' }];

      expect(
        controller.getPlaceholder({
          value: '',
          default: 'var(--gv-theme-color, #000)',
        }),
      ).toEqual('Use Primary: #fff');
      expect(
        controller.getColorTitle({
          value: '',
          default: 'var(--gv-theme-color, #000)',
          description: 'Accent',
        }),
      ).toEqual('Accent: (inherited from Primary)');

      languageService.setLanguage('ru');
      expect(
        controller.getPlaceholder({
          value: '',
          default: 'var(--gv-theme-color, #000)',
        }),
      ).toEqual('Использовать Primary: #fff');
      expect(
        controller.getColorTitle({
          value: '',
          default: 'var(--gv-theme-color, #000)',
          description: 'Accent',
        }),
      ).toEqual('Accent: (унаследовано от Primary)');
    });

    it('shows translated restore dialog at call time', () => {
      languageService.setLanguage('ru');
      controller.restoreDefaultTheme();

      expect(mdDialog.confirm).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Восстановить тему по умолчанию?',
          ok: 'ВОССТАНОВИТЬ',
          cancel: 'ОТМЕНА',
        }),
      );
    });
  });
});
