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
import DashboardComponent from './dashboard.component';

import { LanguageService } from '../../shared/i18n/language.service';

describe('DashboardComponent', () => {
  let controller: any;
  let languageService: LanguageService;

  beforeEach(() => {
    localStorage.removeItem('gio-console-lang');
    languageService = new LanguageService();
    const instance: any = {};
    const controllerFn = (DashboardComponent.controller as unknown[])[(DashboardComponent.controller as unknown[]).length - 1] as (
      ...args: unknown[]
    ) => void;
    controllerFn.call(instance, { $on: jest.fn(), $broadcast: jest.fn() }, languageService);
    controller = instance;
  });

  afterEach(() => {
    localStorage.removeItem('gio-console-lang');
  });

  it('translates update-mode empty state EN → RU → EN without reload', () => {
    expect(controller.translate('settings.analytics.editor.startAdding')).toEqual('Start adding widgets');
    expect(controller.translate('applications.analytics.noWidget')).toEqual('No widget defined');

    languageService.setLanguage('ru');
    expect(controller.translate('settings.analytics.editor.startAdding')).toEqual('Начните добавлять виджеты');
    expect(controller.translate('applications.analytics.noWidget')).toEqual('Виджеты не заданы');

    languageService.setLanguage('en');
    expect(controller.translate('settings.analytics.editor.startAdding')).toEqual('Start adding widgets');
  });
});
