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
import PlatformLogsController from './platform-logs.controller';

import { LanguageService } from '../../../shared/i18n/language.service';

describe('PlatformLogsController i18n', () => {
  let languageService: LanguageService;
  let controller: PlatformLogsController;

  beforeEach(() => {
    localStorage.removeItem('gio-console-lang');
    languageService = new LanguageService();
    controller = new PlatformLogsController({} as any, {} as any, {}, {} as any, {} as any, {} as any, languageService);
  });

  afterEach(() => {
    localStorage.removeItem('gio-console-lang');
  });

  it('translates logs chrome EN → RU → EN without reload', () => {
    expect(controller.translate('analytics.logs.title')).toEqual('Platform Logs');
    expect(controller.translate('analytics.logs.exportCsv')).toEqual('Export as CSV');
    expect(controller.translate('analytics.logs.columns.application')).toEqual('Application');
    expect(controller.translate('analytics.logs.columns.responseTime')).toEqual('Response time');
    expect(controller.translate('analytics.logs.empty')).toEqual('No log');
    expect(controller.translate('analytics.logs.details.title')).toEqual('Platform Log');
    expect(controller.translate('analytics.logs.details.bodyCopied')).toEqual('Body has been copied to clipboard');

    languageService.setLanguage('ru');
    expect(controller.translate('analytics.logs.title')).toEqual('Логи платформы');
    expect(controller.translate('analytics.logs.exportCsv')).toEqual('Экспорт в CSV');
    expect(controller.translate('analytics.logs.columns.application')).toEqual('Приложение');
    expect(controller.translate('analytics.logs.empty')).toEqual('Нет логов');
    expect(controller.translate('analytics.logs.details.back')).toEqual('К логам');
    expect(controller.translate('analytics.logs.details.bodyCopied')).toEqual('Тело скопировано в буфер обмена');

    languageService.setLanguage('en');
    expect(controller.translate('analytics.logs.title')).toEqual('Platform Logs');
    expect(controller.translate('analytics.logs.columns.method')).toEqual('Method');
  });
});
