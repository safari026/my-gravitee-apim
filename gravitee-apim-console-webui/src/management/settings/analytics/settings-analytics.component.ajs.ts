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
import { Router } from '@angular/router';
import { cloneDeep, flattenDeep, merge, values } from 'lodash';

import { Dashboard } from '../../../entities/dashboard';
import DashboardService from '../../../services/dashboard.service';
import NotificationService from '../../../services/notification.service';
import PortalSettingsService from '../../../services/portalSettings.service';
import UserService from '../../../services/user.service';
import { LanguageService } from '../../../shared/i18n/language.service';

const SettingsAnalyticsComponentAjs: ng.IComponentOptions = {
  bindings: {
    dashboardsPlatform: '<',
    dashboardsApi: '<',
    dashboardsApplication: '<',
  },
  template: require('html-loader!./settings-analytics.html').default, // eslint-disable-line @typescript-eslint/no-var-requires
  controller: [
    'NotificationService',
    'PortalSettingsService',
    'Constants',
    '$mdDialog',
    'DashboardService',
    'UserService',
    'ngRouter',
    'ngLanguageService',
    function (
      NotificationService: NotificationService,
      PortalSettingsService: PortalSettingsService,
      Constants: any,
      $mdDialog: angular.material.IDialogService,
      DashboardService: DashboardService,
      UserService: UserService,
      router: Router,
      ngLanguageService: LanguageService,
    ) {
      this.router = router;
      this.settings = cloneDeep(Constants.env.settings);
      this.translate = (key: string, params?: Record<string, string | number>) => ngLanguageService.translate(key, params);
      this.displayType = (type: string) => {
        if (type === 'Platform' || type === 'API' || type === 'Application') {
          return this.translate('settings.analytics.types.' + type);
        }
        return type;
      };

      this.$onInit = () => {
        Promise.all([DashboardService.list('PLATFORM'), DashboardService.list('API'), DashboardService.list('APPLICATION')]).then(
          ([dashboardsPlatform, dashboardsApi, dashboardsApplication]) => {
            this.dashboardsByType = {
              Platform: dashboardsPlatform.data,
              API: dashboardsApi.data,
              Application: dashboardsApplication.data,
            };
          },
        );

        this.canUpdateSettings = UserService.isUserHasPermissions([
          'environment-settings-c',
          'environment-settings-u',
          'environment-settings-d',
        ]);
      };

      this.isDashboardsEmpty = () => {
        return flattenDeep(values(this.dashboardsByType)).length === 0;
      };

      this.save = () => {
        PortalSettingsService.save(this.settings).then(response => {
          merge(Constants.env.settings, response.data);
          NotificationService.show(this.translate('settings.analytics.saved'));
          this.formSettings.$setPristine();
        });
      };

      this.reset = () => {
        this.settings = cloneDeep(Constants.env.settings);
        this.formSettings.$setPristine();
      };

      this.delete = (dashboard: Dashboard) => {
        $mdDialog
          .show({
            controller: 'DialogConfirmController',
            controllerAs: 'ctrl',
            template: require('html-loader!../../../components/dialog/confirmWarning.dialog.html').default, // eslint-disable-line @typescript-eslint/no-var-requires
            clickOutsideToClose: true,
            locals: {
              title: this.translate('settings.analytics.deleteTitle', { name: dashboard.name }),
              msg: '',
              confirmButton: this.translate('common.delete'),
            },
          })
          .then(response => {
            if (response) {
              DashboardService.delete(dashboard).then(() => {
                NotificationService.show(this.translate('settings.analytics.deleted', { name: dashboard.name }));
                this.$onInit();
              });
            }
          });
      };

      this.update = (dashboard: Dashboard) => {
        DashboardService.update(dashboard)
          .then(() => {
            NotificationService.show(this.translate('settings.analytics.dashboardSaved'));
          })
          .finally(() => {
            this.$onInit();
          });
      };

      this.upward = (dashboard: Dashboard) => {
        dashboard.order--;
        this.update(dashboard);
      };

      this.downward = (dashboard: Dashboard) => {
        dashboard.order++;
        this.update(dashboard);
      };

      this.toggleEnable = (dashboard: Dashboard) => {
        dashboard.enabled = !dashboard.enabled;
        this.update(dashboard);
      };

      this.isReadonlySetting = (property: string): boolean => {
        return PortalSettingsService.isReadonly(this.settings, property);
      };

      this.navigateToDashboard = (type: string, dashboardId: string) => {
        this.router.navigate(['dashboard', type, dashboardId], { relativeTo: this.activatedRoute });
      };

      this.newDashboard = (type: string) => {
        this.router.navigate(['dashboard', type, 'new'], { relativeTo: this.activatedRoute });
      };
    },
  ],
};

export default SettingsAnalyticsComponentAjs;
