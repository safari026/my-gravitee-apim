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
import DictionariesController from './dictionaries.controller';

import { LanguageService } from '../../../shared/i18n/language.service';

describe('DictionariesController', () => {
  let controller: DictionariesController;
  let languageService: LanguageService;
  let $scope: { $applyAsync: jest.Mock };

  beforeEach(() => {
    localStorage.removeItem('gio-console-lang');
    languageService = new LanguageService();
    $scope = { $applyAsync: jest.fn() };
    controller = new DictionariesController(
      { list: jest.fn().mockResolvedValue({ data: [] }) } as any,
      {} as any,
      { navigate: jest.fn() } as any,
      languageService,
      $scope as any,
    );
  });

  afterEach(() => {
    localStorage.removeItem('gio-console-lang');
  });

  describe('i18n', () => {
    it('overlays MANUAL/DYNAMIC and lifecycle labels EN → RU → EN without changing values', () => {
      expect(controller.displayType('MANUAL')).toEqual('Manual');
      expect(controller.displayType('DYNAMIC')).toEqual('Dynamic');
      expect(controller.displayType('CUSTOM')).toEqual('CUSTOM');
      expect(controller.displayState('STARTED')).toEqual('Started');
      expect(controller.displayState('STOPPED')).toEqual('Stopped');
      expect(controller.translate('settings.dictionaries.title')).toEqual('Dictionaries');

      languageService.setLanguage('ru');
      controller.$onChanges();
      expect(controller.displayType('MANUAL')).toEqual('Ручной');
      expect(controller.displayType('DYNAMIC')).toEqual('Динамический');
      expect(controller.displayType('CUSTOM')).toEqual('CUSTOM');
      expect(controller.displayState('STARTED')).toEqual('Запущен');
      expect(controller.displayState('STOPPED')).toEqual('Остановлен');
      expect(controller.translate('settings.dictionaries.title')).toEqual('Словари');
      expect($scope.$applyAsync).toHaveBeenCalled();

      languageService.setLanguage('en');
      controller.$onChanges();
      expect(controller.displayType('MANUAL')).toEqual('Manual');
      expect(controller.displayState('STARTED')).toEqual('Started');
      expect(controller.translate('settings.dictionaries.title')).toEqual('Dictionaries');
    });
  });
});
