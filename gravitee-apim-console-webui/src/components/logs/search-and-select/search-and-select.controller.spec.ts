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
import { SearchAndSelectController } from './search-and-select.controller';

import { LanguageService } from '../../../shared/i18n/language.service';

describe('SearchAndSelectController', () => {
  let languageService: LanguageService;
  let controller: SearchAndSelectController;

  beforeEach(() => {
    localStorage.removeItem('gio-console-lang');
    languageService = new LanguageService();
    controller = new SearchAndSelectController(languageService);
  });

  afterEach(() => {
    localStorage.removeItem('gio-console-lang');
  });

  it('translates Application filter chrome EN → RU → EN without reload', () => {
    controller.context = 'Application';

    expect(controller.label).toEqual('Application');
    expect(controller.placeholder).toEqual('Search Application');

    languageService.setLanguage('ru');
    expect(controller.label).toEqual('Приложение');
    expect(controller.placeholder).toEqual('Найти приложение');

    languageService.setLanguage('en');
    expect(controller.label).toEqual('Application');
    expect(controller.placeholder).toEqual('Search Application');
  });

  it('keeps API filter labels on the existing applications keys', () => {
    controller.context = 'API';

    expect(controller.label).toEqual('API');
    expect(controller.placeholder).toEqual('Search API');

    languageService.setLanguage('ru');
    expect(controller.label).toEqual('API');
    expect(controller.placeholder).toEqual('Найти API');
  });
});
