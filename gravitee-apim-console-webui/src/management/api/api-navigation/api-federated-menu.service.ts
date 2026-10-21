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

import { ApimFeature, UTMTags } from '../../../shared/components/gio-license/gio-license-data';
import { GioPermissionService } from '../../../shared/components/gio-permission/gio-permission.service';
import { Constants } from '../../../entities/Constants';
import { ApiFederated, ApiFederatedAgent } from '../../../entities/management-api-v2';
import { ApiDocumentationV2Service } from '../../../services-ngx/api-documentation-v2.service';
import { EnvironmentSettingsService } from '../../../services-ngx/environment-settings.service';
import { LanguageService } from '../../../shared/i18n/language.service';

@Injectable()
export class ApiFederatedMenuService implements ApiMenuService {
  constructor(
    private readonly permissionService: GioPermissionService,
    private readonly gioLicenseService: GioLicenseService,
    private readonly apiDocumentationV2Service: ApiDocumentationV2Service,
    private readonly environmentSettingsService: EnvironmentSettingsService,
    @Inject(Constants) private readonly constants: Constants,
    private readonly languageService: LanguageService,
  ) {}

  private t(key: string): string {
    return this.languageService.translate(`apis.navigation.${key}`);
  }

  public getMenu(api: ApiFederated | ApiFederatedAgent): {
    subMenuItems: MenuItem[];
    groupItems: MenuGroupItem[];
  } {
    const subMenuItems: MenuItem[] = [
      this.addConfigurationMenuEntry(api),
      ...(this.environmentSettingsService.getSnapshot().apiScore.enabled ? this.addApiScoreMenuEntry(api) : []),
      ...this.addConsumersMenuEntry(api),
      this.addDocumentationMenuEntry(api),
    ];

    return { subMenuItems, groupItems: [] };
  }

  private addConfigurationMenuEntry(api: ApiFederated | ApiFederatedAgent): MenuItem {
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

    if (this.permissionService.hasAnyMatching(['api-audit-r']) && api.definitionVersion !== 'FEDERATED_AGENT') {
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

  private addApiScoreMenuEntry(api: ApiFederated | ApiFederatedAgent): MenuItem[] {
    if (api.definitionVersion === 'FEDERATED_AGENT') {
      return [];
    }
    return [
      {
        displayName: this.t('items.apiScore'),
        icon: 'shield-check',
        routerLink: 'api-score',
        header: {
          title: this.t('items.apiScore'),
        },
      },
    ];
  }

  private addConsumersMenuEntry(api: ApiFederated | ApiFederatedAgent): MenuItem[] {
    const tabs: MenuItem[] = [];

    if (api.definitionVersion === 'FEDERATED_AGENT') {
      return [];
    }

    if (this.permissionService.hasAnyMatching(['api-plan-r'])) {
      tabs.push({
        displayName: this.t('items.plans'),
        routerLink: 'plans',
      });
    }

    if (this.permissionService.hasAnyMatching(['api-subscription-r'])) {
      tabs.push({
        displayName: this.t('items.subscriptions'),
        routerLink: 'subscriptions',
      });
    }

    return [
      {
        displayName: this.t('items.consumers'),
        icon: 'cloud-consumers',
        routerLink: '',
        header: {
          title: this.t('items.consumers'),
          subtitle: this.t('subtitles.consumers'),
        },
        tabs: [...tabs, { displayName: this.t('items.broadcasts'), routerLink: 'messages' }],
      },
    ];
  }

  private addDocumentationMenuEntry(api: ApiFederated | ApiFederatedAgent): MenuItem {
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
      tabs,
    };
  }
}
