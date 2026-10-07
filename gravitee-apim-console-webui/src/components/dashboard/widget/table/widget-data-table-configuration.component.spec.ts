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
import WidgetDataTableConfigurationComponent from './widget-data-table-configuration.component';

import { LanguageService } from '../../../../shared/i18n/language.service';

describe('WidgetDataTableConfigurationComponent', () => {
  let controller: any;
  let languageService: LanguageService;

  const dashboardService = {
    getIndexedFields: () => [{ label: 'API', value: 'api' }],
    getAverageableFields: () => [{ label: 'Global latency (ms)', value: 'response-time', type: 'duration' }],
  };

  beforeEach(() => {
    localStorage.removeItem('gio-console-lang');
    languageService = new LanguageService();
    const instance: any = {
      chart: {
        request: { type: 'group_by', field: 'api' },
        columns: [],
        paging: 5,
      },
    };
    const controllerFn = (WidgetDataTableConfigurationComponent.controller as unknown[])[
      (WidgetDataTableConfigurationComponent.controller as unknown[]).length - 1
    ] as (...args: unknown[]) => void;
    controllerFn.call(instance, dashboardService, languageService);
    instance.$onInit();
    controller = instance;
  });

  afterEach(() => {
    localStorage.removeItem('gio-console-lang');
  });

  it('translates editor chrome EN → RU → EN without persisting translated columns', () => {
    expect(controller.translate('settings.analytics.editor.field')).toEqual('Field');
    expect(controller.translate('settings.analytics.editor.projection')).toEqual('Projection');
    expect(controller.translate('settings.analytics.editor.order')).toEqual('Order');
    expect(controller.translate('settings.analytics.editor.customField')).toEqual('Use custom field?');
    expect(controller.translate('settings.analytics.editor.percent')).toEqual('Display percentage');
    expect(controller.chart.columns).toEqual(['API', 'Hits']);
    expect(controller.projections[0]).toEqual({ label: 'Hits', value: '_count', type: 'count' });

    languageService.setLanguage('ru');
    controller.onFieldChanged();
    controller.onProjectionChanged();

    expect(controller.translate('settings.analytics.editor.field')).toEqual('Поле');
    expect(controller.translate('settings.analytics.editor.projection')).toEqual('Проекция');
    expect(controller.translate('settings.analytics.editor.order')).toEqual('Порядок');
    expect(controller.chart.columns).toEqual(['API', 'Hits']);
    expect(controller.projections[0].label).toEqual('Hits');

    languageService.setLanguage('en');
    expect(controller.translate('settings.analytics.editor.field')).toEqual('Field');
    expect(controller.chart.columns).toEqual(['API', 'Hits']);
  });
});
