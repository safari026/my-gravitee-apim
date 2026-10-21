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
import { Injectable } from '@angular/core';
import { GioLicenseService } from '@gravitee/ui-particles-angular';
import { map } from 'rxjs/operators';

import { MenuGroupItem, MenuItem } from './MenuGroupItem';
import { ApiMenuService } from './ApiMenuService';

import { ApimFeature, UTMTags } from '../../../shared/components/gio-license/gio-license-data';
import { GioPermissionService } from '../../../shared/components/gio-permission/gio-permission.service';
import { ApiV4 } from '../../../entities/management-api-v2';
import { ApiDocumentationV2Service } from '../../../services-ngx/api-documentation-v2.service';
import { EnvironmentSettingsService } from '../../../services-ngx/environment-settings.service';
import { ApiType } from '../../../entities/management-api-v2/api/v4/apiType';
import { LanguageService } from '../../../shared/i18n/language.service';

@Injectable()
export class ApiV4MenuService implements ApiMenuService {
  constructor(
    private readonly permissionService: GioPermissionService,
    private readonly gioLicenseService: GioLicenseService,
    private readonly apiDocumentationV2Service: ApiDocumentationV2Service,
    private readonly environmentSettingsService: EnvironmentSettingsService,
    private readonly languageService: LanguageService,
  ) {}

  private t(key: string): string {
    return this.languageService.translate(`apis.navigation.${key}`);
  }
  public getMenu(api: ApiV4): {
    subMenuItems: MenuItem[];
    groupItems: MenuGroupItem[];
  } {
    const hasTcpListeners = api.listeners.find(listener => listener.type === 'TCP') != null;
    const webhooksMenuEntry = this.addWebhooksMenuEntry(api);

    const subMenuItems: MenuItem[] = [
      this.addConfigurationMenuEntry(),
      ...(this.environmentSettingsService.getSnapshot().apiScore.enabled ? [this.addApiScoreMenuEntry()] : []),
      this.addEntrypointsMenuEntry(hasTcpListeners, api),
      this.addEndpointsMenuEntry(api, hasTcpListeners),
      this.addPoliciesMenuEntry(hasTcpListeners),
      this.addConsumersMenuEntry(hasTcpListeners),
      this.addDocumentationMenuEntry(api),
      this.addDeploymentMenuEntry(),
      this.addApiTrafficMenuEntry(hasTcpListeners, api.type),
      ...(api.type === 'NATIVE' ? [this.addNativeLogs()] : [this.addLogs(hasTcpListeners)]),
      ...(webhooksMenuEntry ? [webhooksMenuEntry] : []),
      ...(api.type !== 'NATIVE' ? [this.addApiRuntimeAlertsMenuEntry()] : []),
      ...(api.type !== 'LLM_PROXY' ? this.addAlertsMenuEntry() : []),
      ...(api.type === 'PROXY' ? [this.addDebugMenuEntry()] : []),
    ].filter(entry => entry != null && !entry.tabs?.every(tab => tab.routerLink === 'DISABLED'));

    return { subMenuItems, groupItems: [] };
  }

  private addConfigurationMenuEntry(): MenuItem {
    const license = { feature: ApimFeature.APIM_AUDIT_TRAIL, context: UTMTags.CONTEXT_API };
    const iconRight$ = this.gioLicenseService.isMissingFeature$(license.feature).pipe(map(notAllowed => (notAllowed ? 'gio:lock' : null)));

    const tabs: MenuItem[] = [
      {
        displayName: this.t('items.general'),
        routerLink: '.',
        routerLinkActiveOptions: { exact: true },
      },
    ];

    if (this.permissionService.hasAnyMatching(['api-member-r'])) {
      tabs.push({
        displayName: this.t('items.userPermissions'),
        routerLink: 'members',
      });
    }

    if (this.permissionService.hasAnyMatching(['api-definition-r'])) {
      tabs.push(
        {
          displayName: this.t('items.properties'),
          routerLink: 'properties',
        },
        {
          displayName: this.t('items.resources'),
          routerLink: 'resources',
          routerLinkActiveOptions: { exact: true },
        },
      );
    }

    if (this.permissionService.hasAnyMatching(['api-notification-r'])) {
      tabs.push({
        displayName: this.t('items.notifications'),
        routerLink: 'notifications',
        routerLinkActiveOptions: { exact: true },
      });
    }

    if (this.permissionService.hasAnyMatching(['api-audit-r'])) {
      tabs.push({
        displayName: this.t('items.auditLogs'),
        routerLink: 'v4/audit',
        license,
        iconRight$,
      });
    }

    return {
      displayName: this.t('items.configuration'),
      icon: 'settings',
      routerLink: '',
      header: {
        title: this.t('items.configuration'),
        subtitle: this.t('subtitles.configuration'),
      },
      tabs: tabs,
    };
  }

  private addApiScoreMenuEntry(): MenuItem {
    return {
      displayName: this.t('items.apiScore'),
      icon: 'shield-check',
      routerLink: 'api-score',
      header: {
        title: this.t('items.apiScore'),
      },
    };
  }

  private addAlertsMenuEntry(): MenuItem[] {
    if (this.permissionService.hasAnyMatching(['api-alert-r'])) {
      return [
        {
          displayName: this.t('items.alerts'),
          icon: 'alarm',
          routerLink: 'v4/alerts',
        },
      ];
    } else {
      return [];
    }
  }

  private addEntrypointsMenuEntry(hasTcpListeners: boolean, api: ApiV4): MenuItem {
    const menuItem: MenuItem = {
      displayName: this.t('items.entrypoints'),
      icon: 'entrypoints',
      header: {
        title: this.t('items.entrypoints'),
        subtitle: this.t('subtitles.entrypoints'),
      },
    };

    if (api.type === 'NATIVE') {
      return {
        ...menuItem,
        routerLink: 'v4/entrypoints',
      };
    }

    const tabs: MenuItem[] = [
      {
        displayName: this.t('items.entrypoints'),
        routerLink: 'v4/entrypoints',
      },
    ];

    if (api.type === 'PROXY' && !hasTcpListeners) {
      tabs.push({
        displayName: this.t('items.mcpEntrypoint'),
        routerLink: 'v4/mcp',
      });
    }

    if (api.type !== 'MCP_PROXY' && api.type !== 'LLM_PROXY' && this.permissionService.hasAnyMatching(['api-response_templates-r'])) {
      tabs.push({
        displayName: this.t('items.responseTemplates'),
        routerLink: hasTcpListeners ? 'DISABLED' : 'response-templates',
      });
    }

    if (!hasTcpListeners) {
      tabs.push({
        displayName: this.t('items.cors'),
        routerLink: 'v4/cors',
      });
    }

    return {
      ...menuItem,
      routerLink: '',
      tabs: tabs,
    };
  }

  private addEndpointsMenuEntry(api: ApiV4, hasTcpListeners: boolean): MenuItem {
    const menuItem: MenuItem = {
      displayName: this.t('items.endpoints'),
      icon: 'endpoints',
      header: {
        title: this.t('items.endpoints'),
        subtitle: this.t('subtitles.endpoints'),
      },
    };

    if (api.type === 'NATIVE') {
      return {
        ...menuItem,
        routerLink: 'v4/endpoints',
      };
    }

    const tabs: MenuItem[] = [];

    if (this.permissionService.hasAnyMatching(['api-definition-r'])) {
      tabs.push({
        displayName: this.t('items.endpoints'),
        routerLink: 'v4/endpoints',
      });
    }

    if ((api.type === 'PROXY' && !hasTcpListeners) || api.type === 'MESSAGE' || api.type === 'LLM_PROXY')
      tabs.push({
        displayName: this.t('items.failover'),
        routerLink: 'v4/failover',
      });

    if (this.permissionService.hasAnyMatching(['api-definition-r'])) {
      if (api.type === 'PROXY' && !hasTcpListeners) {
        tabs.push({
          displayName: this.t('items.healthCheckDashboard'),
          routerLink: 'v4/health-check-dashboard',
        });
      }
    }

    return {
      ...menuItem,
      routerLink: tabs.length === 1 ? tabs[0].routerLink : '',
      tabs: tabs.length === 1 ? undefined : tabs,
    };
  }

  private addConsumersMenuEntry(hasTcpListeners: boolean): MenuItem {
    const tabs: MenuItem[] = [];

    if (this.permissionService.hasAnyMatching(['api-plan-r'])) {
      tabs.push({
        displayName: this.t('items.plans'),
        routerLink: 'plans',
      });
    }

    if (this.permissionService.hasAnyMatching(['api-subscription-r']) && !hasTcpListeners) {
      tabs.push({
        displayName: this.t('items.subscriptions'),
        routerLink: 'subscriptions',
      });
    }

    tabs.push({ displayName: this.t('items.broadcasts'), routerLink: 'messages' });
    return {
      displayName: this.t('items.consumers'),
      icon: 'cloud-consumers',
      routerLink: '',
      header: {
        title: this.t('items.consumers'),
        subtitle: this.t('subtitles.consumers'),
      },
      tabs: tabs,
    };
  }

  private addDocumentationMenuEntry(api: ApiV4): MenuItem {
    const tabs: MenuItem[] = [];

    if (this.permissionService.hasAnyMatching(['api-documentation-r'])) {
      tabs.push(
        {
          displayName: this.t('items.mainPages'),
          routerLink: 'v4/documentation/main-pages',
          routerLinkActiveOptions: { exact: false },
        },
        {
          displayName: this.t('items.documentationPages'),
          routerLink: 'v4/documentation/pages',
          routerLinkActiveOptions: { exact: false },
        },
      );
    }

    if (this.permissionService.hasAnyMatching(['api-metadata-r'])) {
      tabs.push({
        displayName: this.t('items.metadata'),
        routerLink: 'v4/documentation/metadata',
        routerLinkActiveOptions: { exact: true },
      });
    }

    return {
      displayName: this.t('items.documentation'),
      icon: 'book',
      routerLink: '',
      header: {
        title: this.t('items.documentation'),
        subtitle: this.t('subtitles.documentation'),
        action: {
          text: this.t('items.openInPortal'),
          targetUrl: this.apiDocumentationV2Service.getApiPortalUrl(api.id),
          disabled: api.lifecycleState !== 'PUBLISHED',
          disabledTooltip: this.apiDocumentationV2Service.getApiNotInPortalTooltip(api.lifecycleState),
        },
      },
      tabs: tabs,
    };
  }

  private addDeploymentMenuEntry(): MenuItem {
    const tabs: MenuItem[] = [];

    if (this.permissionService.hasAnyMatching(['api-definition-r'])) {
      tabs.push({
        displayName: this.t('items.configuration'),
        routerLink: 'deployments',
      });
    }

    if (this.permissionService.hasAnyMatching(['api-event-r'])) {
      tabs.push({
        displayName: this.t('items.deploymentHistory'),
        routerLink: 'v4/history',
      });
    }

    if (this.permissionService.hasAnyMatching(['api-definition-r'])) {
      tabs.push({
        displayName: this.t('items.reporterSettings'),
        routerLink: 'reporter-settings',
      });
    }

    return {
      displayName: this.t('items.deployment'),
      icon: 'rocket',
      routerLink: '',
      header: {
        title: this.t('items.deployment'),
        subtitle: this.t('subtitles.deployment'),
      },
      tabs: tabs,
    };
  }

  private addPoliciesMenuEntry(hasTcpListeners: boolean): MenuItem {
    return {
      displayName: this.t('items.policies'),
      icon: 'shield-star',
      header: {
        title: this.t('items.policies'),
        subtitle: this.t('subtitles.policies'),
      },
      routerLink: hasTcpListeners ? 'DISABLED' : 'v4/policy-studio',
      tabs: undefined,
    };
  }

  private addApiTrafficMenuEntry(hasTcpListeners: boolean, apiType: ApiType): MenuItem | null {
    if (this.permissionService.hasAnyMatching(['api-analytics-r'])) {
      const baseMenuItem = {
        displayName: this.t('items.apiTraffic'),
        icon: 'bar-chart-2',
        routerLink: hasTcpListeners ? 'DISABLED' : 'v4/analytics',
      };
      if (apiType === 'PROXY' || apiType === 'MCP_PROXY' || apiType === 'LLM_PROXY' || apiType === 'NATIVE') {
        return baseMenuItem;
      } else {
        return {
          ...baseMenuItem,
          header: {
            title: this.t('items.apiTraffic'),
          },
        };
      }
    }
    return null;
  }

  private addLogs(hasTcpListeners: boolean): MenuItem | null {
    if (this.permissionService.hasAnyMatching(['api-log-r', 'api-log-u'])) {
      return {
        displayName: this.t('items.logs'),
        icon: 'align-justify',
        routerLink: hasTcpListeners ? 'DISABLED' : 'v4/runtime-logs',
      };
    }
    return null;
  }

  private addNativeLogs(): MenuItem | null {
    if (this.permissionService.hasAnyMatching(['api-native_log-r'])) {
      return {
        displayName: this.t('items.logs'),
        icon: 'align-justify',
        routerLink: 'v4/runtime-logs-native',
      };
    }
    return null;
  }

  private addApiRuntimeAlertsMenuEntry(): MenuItem {
    const tabs = [
      {
        displayName: this.t('items.alerts'),
        routerLink: 'DISABLED',
      },
      {
        displayName: this.t('items.notifications'),
        routerLink: 'DISABLED',
      },
      {
        displayName: this.t('items.history'),
        routerLink: 'DISABLED',
      },
    ];
    return {
      displayName: this.t('items.runtimeAlerts'),
      icon: 'alarm',
      routerLink: '',
      header: {
        title: this.t('items.runtimeAlerts'),
        subtitle: this.t('subtitles.runtimeAlerts'),
      },
      tabs,
    };
  }

  private addDebugMenuEntry(): MenuItem {
    return {
      displayName: this.t('items.debug'),
      icon: 'verified',
      header: {
        title: this.t('items.debug'),
        subtitle: this.t('subtitles.debug'),
      },
      routerLink: 'v4/debug',
      tabs: undefined,
    };
  }

  private addWebhooksMenuEntry(api: ApiV4): MenuItem | null {
    const hasWebhookEntrypoint =
      api.listeners?.some(
        listener => listener.type === 'SUBSCRIPTION' && listener.entrypoints?.some(entrypoint => entrypoint.type === 'webhook'),
      ) ?? false;

    if (!hasWebhookEntrypoint || !this.permissionService.hasAnyMatching(['api-log-r', 'api-log-u'])) {
      return null;
    }

    return {
      displayName: this.t('items.webhooks'),
      icon: 'webhook',
      routerLink: 'v4/webhook-logs',
    };
  }
}
