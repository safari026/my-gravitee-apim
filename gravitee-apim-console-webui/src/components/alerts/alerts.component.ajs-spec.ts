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
import { IComponentControllerService } from 'angular';

import { setupAngularJsTesting } from '../../../old-jest.setup';
import { Alert, Scope } from '../../../src/entities/alert';
import { LanguageService } from '../../../src/shared/i18n/language.service';

setupAngularJsTesting();

describe('AlertsComponent', () => {
  let $componentController: IComponentControllerService;
  let alertsComponent: any;
  let ngLanguageService: LanguageService;

  beforeEach(inject(_$componentController_ => {
    $componentController = _$componentController_;
    ngLanguageService = new LanguageService();
    localStorage.removeItem('gio-console-lang');
    ngLanguageService.setLanguage('en');
    alertsComponent = $componentController('alertsComponentAjs', { ngLanguageService }, {});
  }));

  describe('enhanceAlert', () => {
    const alert = new Alert('alert', 'INFO', 'source', 'my alert', 'test', undefined, undefined);

    it('should set reference_type to ENVIRONMENT', () => {
      alertsComponent.activatedRoute = {
        snapshot: {
          params: {
            apiId: undefined,
            applicationId: undefined,
          },
        },
      };

      alertsComponent.enhanceAlert(alert);

      expect(alert.reference_type).toEqual(Scope.ENVIRONMENT);
    });

    it('should set reference_type to API', () => {
      alertsComponent.activatedRoute = {
        snapshot: {
          params: {
            apiId: 'test-api',
            applicationId: undefined,
          },
        },
      };

      alertsComponent.enhanceAlert(alert);

      expect(alert.reference_type).toEqual(Scope.API);
    });

    it('should set reference_type to APPLICATION', () => {
      alertsComponent.activatedRoute = {
        snapshot: {
          params: {
            apiId: undefined,
            applicationId: 'test-application',
          },
        },
      };

      alertsComponent.enhanceAlert(alert);

      expect(alert.reference_type).toEqual(Scope.APPLICATION);
    });
  });

  describe('i18n', () => {
    it('translates list chrome and keeps technical severity values', () => {
      expect(alertsComponent.translate('alerts.list.title')).toBe('Alerts');
      expect(alertsComponent.translate('alerts.operators.GT')).toBe('greater than');
      expect(alertsComponent.getSeverityColor({ severity: 'INFO' })).toBe('#54a3ff');
      expect(alertsComponent.getSeverityColor({ severity: 'WARNING' })).toBe('#FF950D');
      expect(alertsComponent.getSeverityColor({ severity: 'CRITICAL' })).toBe('#d73a49');

      ngLanguageService.setLanguage('ru');
      expect(alertsComponent.translate('alerts.list.title')).toBe('Оповещения');
      expect(alertsComponent.translate('alerts.operators.GT')).toBe('больше');
      expect(alertsComponent.getSeverityColor({ severity: 'CRITICAL' })).toBe('#d73a49');

      ngLanguageService.setLanguage('en');
      expect(alertsComponent.translate('alerts.list.title')).toBe('Alerts');
      expect(alertsComponent.translate('alerts.operators.GT')).toBe('greater than');
    });
  });
});
