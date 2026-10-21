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
import { Inject, Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { GioLicenseService } from '@gravitee/ui-particles-angular';

import { MenuGroupItem, MenuItem } from './MenuGroupItem';
import { ApiMenuService } from './ApiMenuService';

import { GioPermissionService } from '../../../shared/components/gio-permission/gio-permission.service';
import { Constants } from '../../../entities/Constants';
import { ApiV2, DefinitionVersion } from '../../../entities/management-api-v2';
import { ApimFeature, UTMTags } from '../../../shared/components/gio-license/gio-license-data';
import { GioRoleService } from '../../../shared/components/gio-role/gio-role.service';
import { EnvironmentSettingsService } from '../../../services-ngx/environment-settings.service';
import { LanguageService } from '../../../shared/i18n/language.service';

@Injectable()
export class ApiV2MenuService implements ApiMenuService {
  constructor(
    private readonly permissionService: GioPermissionService,
    private readonly roleService: GioRoleService,
    private readonly environmentSettingsService: EnvironmentSettingsService,
    @Inject(Constants) private readonly constants: Constants,
    private readonly gioLicenseService: GioLicenseService,
    private readonly languageService: LanguageService,
  ) {}

  private t(key: string): string {
    return this.languageService.translate(`apis.navigation.${key}`);
  }

  public getMenu(api: ApiV2): {
    subMenuItems: MenuItem[];
    groupItems: MenuGroupItem[];
  } {
    const subMenuItems: MenuItem[] = [
      {
        displayName: this.t('items.policyStudio'),
        routerLink: 'v2/policy-studio',
      },
      {
        displayName: this.t('items.messages'),
        routerLink: 'messages',
      },
    ];

    const groupItems: MenuGroupItem[] = [
      this.getPortalGroup(api.definitionVersion),
      this.getProxyGroup(),
      this.getBackendServicesGroup(),
      this.getAnalyticsGroup(),
      this.getAuditGroup(),
      this.getNotificationsGroup(),
    ].filter(group => !!group);

    return { subMenuItems, groupItems };
  }

  private getPortalGroup(definitionVersion: DefinitionVersion): MenuGroupItem {
    const portalGroup: MenuGroupItem = {
      title: this.t('items.general'),
      items: [
        {
          displayName: this.t('items.info'),
          routerLink: '.',
          routerLinkActiveOptions: { exact: true },
        },
      ],
    };

    // Plans
    const plansMenuItem: MenuItem = {
      displayName: this.t('items.plans'),
      tabs: [],
    };
    if (this.permissionService.hasAnyMatching(['api-plan-r'])) {
      plansMenuItem.tabs.push({
        displayName: this.t('items.plans'),
        routerLink: 'plans',
      });
    }
    if (this.permissionService.hasAnyMatching(['api-subscription-r'])) {
      plansMenuItem.tabs.push({
        displayName: this.t('items.subscriptions'),
        routerLink: 'subscriptions',
      });
    }
    if (plansMenuItem.tabs.length > 0) {
      portalGroup.items.push(plansMenuItem);
    }

    // Documentation
    const documentationMenuItem: MenuItem = {
      displayName: this.t('items.documentation'),
      tabs: [],
    };
    if (this.permissionService.hasAnyMatching(['api-documentation-r'])) {
      documentationMenuItem.tabs.push({
        displayName: this.t('items.pages'),
        routerLink: 'documentation',
      });
    }
    if (this.permissionService.hasAnyMatching(['api-metadata-r'])) {
      documentationMenuItem.tabs.push({
        displayName: this.t('items.metadata'),
        routerLink: 'metadata',
      });
    }
    if (documentationMenuItem.tabs.length > 0) {
      portalGroup.items.push(documentationMenuItem);
    }

    // Users
    if (this.permissionService.hasAnyMatching(['api-member-r'])) {
      const userAndGroupAccessMenuItems: MenuItem = {
        displayName: this.t('items.userAndGroupAccess'),
        routerLink: 'members',
        tabs: [],
      };

      portalGroup.items.push(userAndGroupAccessMenuItems);
    }

    // Api Score
    if (this.environmentSettingsService.getSnapshot().apiScore.enabled && definitionVersion === 'V2') {
      portalGroup.items.push({
        displayName: this.t('items.apiScore'),
        routerLink: 'api-score',
      });
    }

    return portalGroup;
  }

  private getProxyGroup(): MenuGroupItem {
    const proxyGroup: MenuGroupItem = {
      title: this.t('items.proxy'),
      items: [],
    };

    if (this.permissionService.hasAnyMatching(['api-definition-r', 'api-health-r'])) {
      proxyGroup.items.push({
        displayName: this.t('items.entrypoints'),
        routerLink: 'v2/entrypoints',
      });
    }
    if (this.permissionService.hasAnyMatching(['api-definition-r'])) {
      proxyGroup.items.push(
        {
          displayName: this.t('items.cors'),
          routerLink: 'cors',
        },
        {
          displayName: this.t('items.deployments'),
          routerLink: 'deployments',
        },
      );
    }
    if (this.permissionService.hasAnyMatching(['api-response_templates-r'])) {
      proxyGroup.items.push({
        displayName: this.t('items.responseTemplates'),
        routerLink: 'response-templates',
      });
    }
    if (this.permissionService.hasAnyMatching(['api-definition-r'])) {
      proxyGroup.items.push(
        {
          displayName: this.t('items.properties'),
          routerLink: 'properties',
          tabs: [],
        },
        {
          displayName: this.t('items.resources'),
          routerLink: 'resources',
        },
      );
    }

    if (proxyGroup.items.length > 0) {
      return proxyGroup;
    }
    return undefined;
  }
  private getBackendServicesGroup(): MenuGroupItem {
    // Backend services
    const backendServicesGroup: MenuGroupItem = {
      title: this.t('items.backendServices'),
      items: [],
    };

    if (this.permissionService.hasAnyMatching(['api-definition-r'])) {
      backendServicesGroup.items.push(
        {
          displayName: this.t('items.endpoints'),
          routerLink: 'v2/endpoints',
        },
        {
          displayName: this.t('items.failover'),
          routerLink: 'v2/failover',
        },
      );
    }
    if (this.permissionService.hasAnyMatching(['api-health-r'])) {
      backendServicesGroup.items.push({
        displayName: this.t('items.healthCheck'),
        routerLink: 'v2/healthcheck',
      });
    }

    // Health-check dashboard
    if (this.permissionService.hasAnyMatching(['api-health-r'])) {
      backendServicesGroup.items.push({
        displayName: this.t('items.healthCheckDashboardV2'),
        routerLink: 'v2/healthcheck-dashboard',
      });
    }

    if (backendServicesGroup.items.length > 0) {
      return backendServicesGroup;
    }
    return undefined;
  }

  private getAnalyticsGroup(): MenuGroupItem {
    const analyticsGroup: MenuGroupItem = {
      title: this.t('items.analytics'),
      items: [],
    };

    if (this.permissionService.hasAnyMatching(['api-analytics-r'])) {
      analyticsGroup.items.push({
        displayName: this.t('items.overview'),
        routerLink: 'v2/analytics-overview',
      });
    }
    if (this.permissionService.hasAnyMatching(['api-log-r'])) {
      analyticsGroup.items.push({
        displayName: this.t('items.logs'),
        routerLink: 'v2/analytics-logs',
      });
    }
    if (this.permissionService.hasAnyMatching(['api-definition-u'])) {
      analyticsGroup.items.push({
        displayName: this.t('items.pathMappings'),
        routerLink: 'v2/path-mappings',
      });
    }
    if (!this.constants.isOEM && this.constants.org.settings.alert?.enabled && this.permissionService.hasAnyMatching(['api-alert-r'])) {
      const alertEngineLicenseOptions = {
        feature: ApimFeature.ALERT_ENGINE,
        context: UTMTags.CONTEXT_API_ANALYTICS,
      };
      const alertEngineIconRight$ = this.gioLicenseService
        .isMissingFeature$(alertEngineLicenseOptions.feature)
        .pipe(map(notAllowed => (notAllowed ? 'gio:lock' : null)));

      analyticsGroup.items.push({
        displayName: this.t('items.alerts'),
        routerLink: 'analytics-alerts',
        license: alertEngineLicenseOptions,
        iconRight$: alertEngineIconRight$,
      });
    }
    if (analyticsGroup.items.length > 0) {
      return analyticsGroup;
    }
    return undefined;
  }

  private getAuditGroup(): MenuGroupItem {
    const license = { feature: ApimFeature.APIM_AUDIT_TRAIL, context: UTMTags.CONTEXT_API };
    const iconRight$ = this.gioLicenseService.isMissingFeature$(license.feature).pipe(map(notAllowed => (notAllowed ? 'gio:lock' : null)));

    const auditGroup: MenuGroupItem = {
      title: this.t('items.audit'),
      items: [],
    };

    if (this.permissionService.hasAnyMatching(['api-audit-r'])) {
      auditGroup.items.push({
        displayName: this.t('items.audit'),
        routerLink: 'audit',
        license,
        iconRight$,
      });
    }
    if (this.permissionService.hasAnyMatching(['api-event-r'])) {
      auditGroup.items.push({
        displayName: this.t('items.history'),
        routerLink: 'history',
      });
    }
    if (this.permissionService.hasAnyMatching(['api-event-u'])) {
      auditGroup.items.push({
        displayName: this.t('items.events'),
        routerLink: 'events',
      });
    }

    if (auditGroup.items.length > 0) {
      return auditGroup;
    }
    return undefined;
  }
  private getNotificationsGroup(): MenuGroupItem {
    const notificationsGroup: MenuGroupItem = {
      title: this.t('items.notifications'),
      items: [],
    };

    if (this.permissionService.hasAnyMatching(['api-notification-r'])) {
      notificationsGroup.items.push({
        displayName: this.t('items.notificationSettings'),
        routerLink: 'notifications',
      });
    }

    if (!this.constants.isOEM && this.constants.org.settings.alert?.enabled && this.permissionService.hasAnyMatching(['api-alert-r'])) {
      const alertEngineLicenseOptions = {
        feature: ApimFeature.ALERT_ENGINE,
        context: UTMTags.CONTEXT_API_NOTIFICATIONS,
      };
      const alertEngineIconRight$ = this.gioLicenseService
        .isMissingFeature$(alertEngineLicenseOptions.feature)
        .pipe(map(notAllowed => (notAllowed ? 'gio:lock' : null)));

      notificationsGroup.items.push({
        displayName: this.t('items.alerts'),
        routerLink: 'alerts',
        license: alertEngineLicenseOptions,
        iconRight$: alertEngineIconRight$,
      });
    }

    if (notificationsGroup.items.length > 0) {
      return notificationsGroup;
    }
    return undefined;
  }
}
