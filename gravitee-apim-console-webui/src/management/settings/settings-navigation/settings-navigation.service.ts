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
import { MenuSearchItem } from '@gravitee/ui-particles-angular';

import { GioPermissionService } from '../../../shared/components/gio-permission/gio-permission.service';
import { LanguageService } from '../../../shared/i18n/language.service';
import { cleanRouterLink } from '../../../util/router-link.util';

export interface MenuItem {
  routerLink?: string;
  displayName: string;
  permissions?: string[];
  category?: string;
}

export interface GroupItem {
  title: string;
  items: MenuItem[];
}

@Injectable({ providedIn: 'root' })
export class SettingsNavigationService {
  constructor(
    private readonly permissionService: GioPermissionService,
    private readonly languageService: LanguageService,
  ) {}

  public getSettingsNavigationRoutes(): GroupItem[] {
    const translate = (key: string) => this.languageService.translate(key);
    const items: GroupItem[] = [
      {
        title: translate('settings.navigation.groups.portal'),
        items: [
          {
            displayName: translate('settings.navigation.items.analytics'),
            routerLink: './analytics',
            permissions: ['environment-dashboard-r'],
          },
          {
            displayName: translate('settings.navigation.items.apiPortalHeader'),
            routerLink: './api-portal-header',
            permissions: ['environment-api_header-r'],
          },
          {
            displayName: translate('settings.navigation.items.apiQuality'),
            routerLink: './api-quality-rules',
            permissions: ['environment-quality_rule-r'],
          },
          {
            displayName: translate('settings.navigation.items.authentication'),
            routerLink: './identity-providers',
            permissions: ['organization-identity_provider-r', 'environment-identity_provider_activation-r'],
          },
          {
            displayName: translate('settings.navigation.items.categories'),
            routerLink: './categories',
            permissions: ['environment-category-r'],
          },
          {
            displayName: translate('settings.navigation.items.clientRegistration'),
            routerLink: './client-registration-providers',
            permissions: ['environment-client_registration_provider-r'],
          },
          {
            displayName: translate('settings.navigation.items.documentation'),
            routerLink: './documentation',
            permissions: ['environment-documentation-r'],
          },
          {
            displayName: translate('settings.navigation.items.metadata'),
            routerLink: './metadata',
            permissions: ['environment-metadata-r'],
          },
          {
            displayName: translate('settings.navigation.items.portal'),
            routerLink: './portal',
            permissions: ['environment-settings-r'],
          },
          {
            displayName: translate('settings.navigation.items.theme'),
            routerLink: './theme',
            permissions: ['environment-theme-r'],
          },
          {
            displayName: translate('settings.navigation.items.topApis'),
            routerLink: './top-apis',
            permissions: ['environment-top_apis-r'],
          },
        ],
      },
      {
        title: translate('settings.navigation.groups.gateway'),
        items: [
          {
            displayName: translate('settings.navigation.items.apiLogging'),
            routerLink: './api-logging',
            permissions: ['organization-settings-r'],
          },
          {
            displayName: translate('settings.navigation.items.dictionaries'),
            routerLink: './dictionaries',
            permissions: ['environment-dictionary-r'],
          },
          {
            displayName: translate('settings.navigation.items.sharedPolicyGroups'),
            routerLink: './shared-policy-groups',
            permissions: ['environment-shared_policy_group-r'],
          },
        ],
      },
      {
        title: translate('settings.navigation.groups.userManagement'),
        items: [
          {
            displayName: translate('settings.navigation.items.userFields'),
            routerLink: './custom-user-fields',
            permissions: ['organization-custom_user_fields-r'],
          },
          {
            displayName: translate('settings.navigation.items.groups'),
            routerLink: './groups',
            permissions: ['environment-group-r'],
          },
        ],
      },
      {
        title: translate('settings.navigation.groups.notifications'),
        items: [
          {
            displayName: translate('settings.navigation.items.notifications'),
            routerLink: './notifications',
            permissions: ['environment-notification-r'],
          },
        ],
      },
    ];

    items.forEach(groupItem => {
      groupItem.items = groupItem.items.filter(item => !item.permissions || this.permissionService.hasAnyMatching(item.permissions));
    });

    return items;
  }

  public getSettingsNavigationSearchItems(environmentId: string): MenuSearchItem[] {
    return this.getSettingsNavigationRoutes().flatMap(groupItem =>
      groupItem.items.map(item => {
        return {
          name: item.displayName,
          routerLink: `/${environmentId}/settings/${cleanRouterLink(item.routerLink)}`,
          category: this.languageService.translate('settings.navigation.searchCategory', { group: groupItem.title }),
          groupIds: [environmentId],
        };
      }),
    );
  }
}
