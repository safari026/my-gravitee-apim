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
import { ChangeDetectorRef, Component, Inject, Injector, OnDestroy, OnInit } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { GioLicenseService, GioMenuSearchService, LicenseOptions, MenuSearchItem, SelectorItem } from '@gravitee/ui-particles-angular';
import { catchError, distinctUntilChanged, map, skip, switchMap, takeUntil } from 'rxjs/operators';
import { EMPTY, Observable, of, Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

import { GioPermissionService } from '../../shared/components/gio-permission/gio-permission.service';
import { Constants, EnvSettings } from '../../entities/Constants';
import { ApimFeature, UTMTags } from '../../shared/components/gio-license/gio-license-data';
import { Environment } from '../../entities/environment/environment';
import { cleanRouterLink } from '../../util/router-link.util';
import { EnvironmentSettingsService } from '../../services-ngx/environment-settings.service';
import { LanguageService } from '../../shared/i18n/language.service';

interface MenuItem {
  icon?: string;
  routerLink?: string;
  target?: string;
  displayName: string;
  permissions?: string[];
  licenseOptions?: LicenseOptions;
  iconRight$?: Observable<any>;
  iconRightTooltip?: string;
  subMenuPermissions?: string[];
  category: string;
  items?: MenuItem[];
  routerBasePath?: string;
  externalLink?: boolean;
}

export const SIDE_NAV_GROUP_ID = 'side-nav-items';

// prettier-ignore
export const PORTAL_SETTINGS_PERMISSIONS = [
  'environment-settings-r',
  'environment-settings-u',
  'environment-theme-r',
  'environment-theme-u',
  'environment-category-r',
  'environment-category-u',
  'environment-documentation-r',
  'environment-documentation-u',
  'environment-metadata-r',
  'environment-metadata-u',
];

@Component({
  selector: 'gio-side-nav',
  templateUrl: './gio-side-nav.component.html',
  styleUrls: ['./gio-side-nav.component.scss'],
  standalone: false,
})
export class GioSideNavComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();

  public mainMenuItems: MenuItem[] = [];
  public footerMenuItems: MenuItem[] = [];

  public environments: SelectorItem[] = [];

  public currentEnv: Environment;
  private envHrid: string;
  private envSettings?: EnvSettings;
  public licenseExpirationDate$: Observable<Date>;
  public licenseExpirationNotificationEnabled = true;

  constructor(
    private readonly permissionService: GioPermissionService,
    @Inject(Constants) private readonly constants: Constants,
    private readonly gioLicenseService: GioLicenseService,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly gioMenuSearchService: GioMenuSearchService,
    private readonly environmentSettingsService: EnvironmentSettingsService,
    private readonly languageService: LanguageService,
    private readonly injector: Injector,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params
      .pipe(
        map(p => p.envHrid),
        distinctUntilChanged(),
        switchMap(envHrid => {
          // The segment the URL actually carries. Building absolute paths from it keeps them in
          // agreement with router.url by construction: hrids are optional, an environment can hold
          // several, and the guard accepts the id as well -- so anything re-derived from currentEnv
          // can name the environment differently from the address bar the user is on.
          this.envHrid = envHrid;
          this.environments = this.constants.org.environments.map(env => ({ value: env.id, displayValue: env.name }));
          this.currentEnv = this.constants.org.currentEnv;

          this.mainMenuItems = this.buildMainMenuItems();
          this.footerMenuItems = this.buildFooterMenuItems();
          this.gioMenuSearchService.removeMenuSearchItems([SIDE_NAV_GROUP_ID]);
          this.gioMenuSearchService.addMenuSearchItems(this.getSideNaveMenuSearchItems());

          return this.environmentSettingsService.get().pipe(catchError(() => EMPTY));
        }),
        takeUntil(this.unsubscribe$),
      )
      .subscribe(envSettings => {
        this.envSettings = envSettings;
        this.mainMenuItems = this.buildMainMenuItems(envSettings);
      });

    toObservable(this.languageService.currentLanguage, { injector: this.injector })
      .pipe(skip(1), takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.mainMenuItems = this.buildMainMenuItems(this.envSettings);
        this.footerMenuItems = this.buildFooterMenuItems();
        this.gioMenuSearchService.removeMenuSearchItems([SIDE_NAV_GROUP_ID]);
        this.gioMenuSearchService.addMenuSearchItems(this.getSideNaveMenuSearchItems());
        this.changeDetectorRef.markForCheck();
      });

    if (this.constants.org.settings?.licenseExpirationNotification?.enabled !== undefined) {
      this.licenseExpirationNotificationEnabled = this.constants.org.settings.licenseExpirationNotification.enabled;
    }

    this.licenseExpirationDate$ = this.gioLicenseService.getExpiresAt$().pipe(distinctUntilChanged(), takeUntil(this.unsubscribe$));
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  changeCurrentEnv(envId: string): void {
    this.router.navigate(['/', envId]);
  }

  navigate(selectedItem: MenuSearchItem): void {
    this.router.navigate([selectedItem.routerLink]);
  }

  private buildMainMenuItems(envSettings?: EnvSettings): MenuItem[] {
    const auditLicenseOptions: LicenseOptions = {
      feature: ApimFeature.APIM_AUDIT_TRAIL,
      context: UTMTags.CONTEXT_ENVIRONMENT,
    };

    const auditIconRight$ = this.getMenuItemIconRight$(auditLicenseOptions);

    const alertEngineLicenseOptions: LicenseOptions = {
      feature: ApimFeature.ALERT_ENGINE,
      context: UTMTags.CONTEXT_ENVIRONMENT,
    };
    const alertEngineIconRight$ = this.getMenuItemIconRight$(alertEngineLicenseOptions);

    const clusterLicenseOptions: LicenseOptions = {
      feature: ApimFeature.APIM_CLUSTER,
      context: UTMTags.CONTEXT_ENVIRONMENT,
    };
    const clusterIconRight$ = this.getMenuItemIconRight$(clusterLicenseOptions);

    const apiProductsLicenseOptions: LicenseOptions = {
      feature: ApimFeature.APIM_API_PRODUCTS,
      context: UTMTags.CONTEXT_ENVIRONMENT,
    };
    const apiProductsIconRight$ = this.getMenuItemIconRight$(apiProductsLicenseOptions);

    const mainMenuItems: MenuItem[] = [
      {
        icon: 'gio:home',
        routerLink: './home',
        displayName: this.languageService.translate('navigation.dashboard'),
        category: this.languageService.translate('navigation.dashboard'),
      },
      {
        icon: 'gio:cloud-settings',
        routerLink: './apis',
        displayName: this.languageService.translate('navigation.apis'),
        category: this.languageService.translate('navigation.apis'),
      },
      {
        icon: 'gio:folder',
        routerLink: './api-products',
        displayName: this.languageService.translate('navigation.apiProducts'),
        category: this.languageService.translate('navigation.apiProducts'),
        permissions: ['environment-api_product-r'],
        licenseOptions: apiProductsLicenseOptions,
        iconRight$: apiProductsIconRight$,
      },
      {
        icon: 'gio:box',
        routerLink: './integrations',
        displayName: this.languageService.translate('navigation.integrations'),
        permissions: ['environment-integration-r'],
        category: this.languageService.translate('navigation.integrations'),
      },
      {
        icon: 'gio:multi-window',
        routerLink: './applications',
        displayName: this.languageService.translate('navigation.applications'),
        permissions: ['environment-application-r'],
        category: this.languageService.translate('navigation.applications'),
      },
    ];

    mainMenuItems.push({
      icon: 'gio:cloud-server',
      displayName: this.languageService.translate('navigation.gateways'),
      routerLink: './gateways',
      permissions: ['environment-instance-r'],
      category: this.languageService.translate('navigation.gateways'),
    });
    mainMenuItems.push({
      icon: 'gio:cluster',
      displayName: this.languageService.translate('navigation.kafka.title'),
      category: this.languageService.translate('navigation.kafka.title'),
      permissions: ['environment-cluster-r'],
      licenseOptions: clusterLicenseOptions,
      iconRight$: clusterIconRight$,
      routerBasePath: `/${this.envHrid}/clusters`,
      items: [
        {
          displayName: this.languageService.translate('navigation.kafka.standalone'),
          routerLink: './clusters/kafka-standalone',
          category: this.languageService.translate('navigation.kafka.title'),
        },
      ],
    });

    if (envSettings?.apiScore.enabled) {
      mainMenuItems.push({
        icon: 'gio:shield-check',
        routerLink: './api-score',
        displayName: this.languageService.translate('navigation.apiScore'),
        permissions: ['environment-integration-r'],
        category: this.languageService.translate('navigation.apiScore'),
      });
    }

    mainMenuItems.push({
      icon: 'gio:verified',
      displayName: this.languageService.translate('navigation.audit'),
      routerLink: './audit',
      permissions: ['environment-audit-r'],
      licenseOptions: auditLicenseOptions,
      iconRight$: auditIconRight$,
      category: this.languageService.translate('navigation.audit'),
    });

    mainMenuItems.push({
      icon: 'gio:dashboard-dots',
      displayName: this.languageService.translate('navigation.observability.title'),
      category: this.languageService.translate('navigation.observability.title'),
      permissions: ['environment-platform-r'],
      routerBasePath: `/${this.envHrid}/observability`,
      items: [
        {
          displayName: this.languageService.translate('navigation.observability.overview'),
          routerLink: './observability/overview',
          category: this.languageService.translate('navigation.analytics.title'),
        },
        {
          displayName: this.languageService.translate('navigation.observability.dashboards'),
          routerLink: './observability/dashboards',
          category: this.languageService.translate('navigation.analytics.title'),
          permissions: ['environment-dashboard-r', 'environment-api-r'],
        },
        {
          displayName: this.languageService.translate('navigation.observability.logs'),
          routerLink: './observability/logs-explorer',
          category: this.languageService.translate('navigation.analytics.title'),
        },
      ],
    });
    mainMenuItems.push({
      icon: 'gio:bar-chart-2',
      displayName: this.languageService.translate('navigation.analytics.title'),
      category: this.languageService.translate('navigation.analytics.title'),
      permissions: ['environment-platform-r'],
      routerBasePath: `/${this.envHrid}/analytics`,
      iconRight$: of('gio:info'),
      iconRightTooltip: this.languageService.translate('navigation.analytics.v2Tooltip'),
      items: [
        {
          displayName: this.languageService.translate('navigation.analytics.dashboard'),
          routerLink: './analytics/dashboard',
          category: this.languageService.translate('navigation.analytics.title'),
        },
        {
          displayName: this.languageService.translate('navigation.analytics.logs'),
          routerLink: './analytics/logs',
          category: this.languageService.translate('navigation.analytics.title'),
        },
      ],
    });

    if (!this.constants.isOEM && this.constants.org.settings.alert && this.constants.org.settings.alert.enabled) {
      mainMenuItems.push({
        icon: 'gio:alarm',
        displayName: this.languageService.translate('navigation.alerts'),
        routerLink: './alerts',
        permissions: ['environment-alert-r'],
        licenseOptions: alertEngineLicenseOptions,
        iconRight$: alertEngineIconRight$,
        category: this.languageService.translate('navigation.alerts'),
      });
    }

    if (envSettings?.portalNext?.access?.enabled) {
      mainMenuItems.push({
        icon: 'gio:monitor',
        routerLink: './_portal',
        displayName: this.languageService.translate('navigation.portalSettings'),
        category: this.languageService.translate('navigation.portalSettings'),
        permissions: PORTAL_SETTINGS_PERMISSIONS,
        target: '_blank',
        externalLink: true,
      });
    }

    mainMenuItems.push({
      icon: 'gio:settings',
      routerLink: './settings',
      displayName: this.languageService.translate('navigation.settings'),
      category: this.languageService.translate('navigation.environment'),
      // prettier-ignore
      permissions: [
        // Portal
        'environment-dashboard-r',                    // Analytics
        'environment-api_header-r',                   // API Portal Information
        'environment-quality_rule-r',                 // API Quality
        'organization-identity_provider-r',           // Authentication
        'environment-identity_provider_activation-r', // Authentication
        'environment-category-r',                     // Categories
        'environment-client_registration_provider-r', // Client Registration
        'environment-documentation-c',                // Documentation
        'environment-documentation-u',                // Documentation
        'environment-documentation-d',                // Documentation
        'environment-metadata-r',                     // Metadata
        'environment-settings-r',                     // Settings
        'environment-theme-r',                        // Theme
        'environment-top_apis-r',                     // Top APIs
        // Gateway
        'organization-settings-r',                    // API Logging + FIXME should be moved to organization settings screen
        'environment-dictionary-r',                   // Dictionaries
        'environment-tag-c',                          // Sharding Tags
        'environment-tag-u',                          // Sharding Tags
        'environment-tag-d',                          // Sharding Tags
        'environment-tenant-c',                       // Tenants
        'environment-tenant-u',                       // Tenants
        'environment-tenant-d',                       // Tenants
        // User Management
        'organization-custom_user_fields-r',          // User Fields + FIXME should be moved to organization settings screen
        'environment-group-r',                        // Groups
        // Notifications
        'environment-notification-r',                 // Notifications
      ],
    });

    return this.filterMenuByPermission(mainMenuItems);
  }

  private getMenuItemIconRight$(licenseOptions: LicenseOptions) {
    return this.gioLicenseService.isMissingFeature$(licenseOptions.feature).pipe(map(notAllowed => (notAllowed ? 'gio:lock' : null)));
  }

  private buildFooterMenuItems(): MenuItem[] {
    return this.filterMenuByPermission([
      {
        icon: 'gio:building',
        routerLink: '/_organization',
        displayName: this.languageService.translate('navigation.organization'),
        permissions: ['organization-settings-r'],
        category: this.languageService.translate('navigation.organization'),
      },
    ]);
  }

  private filterMenuByPermission(menuItems: MenuItem[]): MenuItem[] {
    return menuItems
      .filter(item => !item.permissions || this.permissionService.hasAnyMatching(item.permissions))
      .map(item => {
        if (item.items) {
          const subItems = this.filterMenuByPermission(item.items);
          if (subItems.length > 0 || item.routerLink) {
            return { ...item, items: subItems };
          }
          return null;
        }
        return item;
      })
      .filter((item): item is MenuItem => item !== null);
  }

  private getSideNaveMenuSearchItems(): MenuSearchItem[] {
    return this.mainMenuItems
      .filter(item => !!item.routerLink)
      .map(item => {
        return {
          name: item.displayName,
          routerLink: `/${this.envHrid}/${cleanRouterLink(item.routerLink)}`,
          category: item.category,
          groupIds: [SIDE_NAV_GROUP_ID],
        };
      })
      .concat(
        this.footerMenuItems
          .filter(item => !!item.routerLink)
          .map(item => ({
            name: item.displayName,
            routerLink: `/${cleanRouterLink(item.routerLink)}`,
            category: item.category,
            groupIds: [SIDE_NAV_GROUP_ID],
          })),
      );
  }
}
