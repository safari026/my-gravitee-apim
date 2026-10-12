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

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import {
  GioBreadcrumbModule,
  GioIconsModule,
  GioLicenseService,
  GioMenuSearchService,
  GioMenuService,
  GioSubmenuModule,
  LicenseOptions,
  MenuSearchItem,
} from '@gravitee/ui-particles-angular';
import { Observable, Subject } from 'rxjs';
import { filter, map, skip, switchMap, takeUntil, tap } from 'rxjs/operators';
import { flatMap } from 'lodash';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { ClusterNavigationTabsComponent } from './cluster-navigation-tabs/cluster-navigation-tabs.component';

import { ApimFeature, UTMTags } from '../../../shared/components/gio-license/gio-license-data';
import { cleanRouterLink, getPathFromRoot } from '../../../util/router-link.util';
import { GioPermissionService } from '../../../shared/components/gio-permission/gio-permission.service';
import { ClusterService } from '../../../services-ngx/cluster.service';
import { Cluster } from '../../../entities/management-api-v2';
import { LanguageService } from '../../../shared/i18n/language.service';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';

export interface MenuItem {
  displayName: string;
  permissions?: string[];
  tabs?: MenuItem[];
  header?: MenuItemHeader;
  routerLink?: string;
  routerLinkActiveOptions?: { exact: boolean };
  license?: LicenseOptions;
  iconRight$?: Observable<string>;
}

export interface MenuItemHeader {
  title?: string;
  subtitle?: string;
}

@Component({
  selector: 'cluster-navigation',
  templateUrl: './cluster-navigation.component.html',
  styleUrls: ['./cluster-navigation.component.scss'],
  imports: [
    CommonModule,
    GioSubmenuModule,
    GioBreadcrumbModule,
    RouterModule,
    GioIconsModule,
    ClusterNavigationTabsComponent,
    TranslatePipe,
  ],
})
export class ClusterNavigationComponent implements OnInit, OnDestroy {
  public cluster: Cluster;
  public subMenuItems: MenuItem[] = [];
  public hasBreadcrumb = false;
  public selectedItemWithTabs: MenuItem = undefined;
  private unsubscribe$ = new Subject<void>();

  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly permissionService = inject(GioPermissionService);
  private readonly gioMenuService = inject(GioMenuService);
  private readonly clusterService = inject(ClusterService);
  private readonly gioMenuSearchService = inject(GioMenuSearchService);
  private readonly gioLicenseService = inject(GioLicenseService);
  private readonly languageService = inject(LanguageService);

  ngOnInit() {
    this.gioMenuService.reduced$.pipe(takeUntil(this.unsubscribe$)).subscribe(reduced => {
      this.hasBreadcrumb = reduced;
    });

    this.clusterService
      .get(this.activatedRoute.snapshot.params.clusterId)
      .pipe(
        tap(cluster => {
          this.cluster = cluster;
          this.rebuildSubMenu();
          this.gioMenuSearchService.addMenuSearchItems(this.getClusterNavigationSearchItems());
        }),
        switchMap(() => this.router.events),
        filter(event => event instanceof NavigationEnd),
        tap(() => {
          this.selectedItemWithTabs = this.subMenuItems.find(item => item.tabs && this.isTabActive(item.tabs));
        }),
        takeUntil(this.unsubscribe$),
      )
      .subscribe();

    toObservable(this.languageService.currentLanguage)
      .pipe(skip(1), takeUntil(this.unsubscribe$))
      .subscribe(() => {
        if (!this.cluster) {
          return;
        }
        this.rebuildSubMenu();
        const clusterId = this.activatedRoute.snapshot.params.clusterId;
        this.gioMenuSearchService.removeMenuSearchItems([clusterId]);
        this.gioMenuSearchService.addMenuSearchItems(this.getClusterNavigationSearchItems());
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.unsubscribe();
    this.gioMenuSearchService.removeMenuSearchItems([this.activatedRoute.snapshot.params.clusterId]);
  }

  isActive(item: MenuItem): boolean {
    if (!item.routerLink) {
      return false;
    }
    return this.router.isActive(this.router.createUrlTree([item.routerLink], { relativeTo: this.activatedRoute }), {
      paths: item.routerLinkActiveOptions?.exact ? 'exact' : 'subset',
      queryParams: 'subset',
      fragment: 'ignored',
      matrixParams: 'ignored',
    });
  }

  computeBreadcrumbItems(): string[] {
    const breadcrumbItems: string[] = [];

    this.subMenuItems.forEach(item => {
      if (this.isActive(item)) {
        breadcrumbItems.push(item.displayName);
      }
    });

    return breadcrumbItems;
  }

  isTabActive(tabs: MenuItem[]): boolean {
    return flatMap(tabs, tab => tab).some(tab => this.isActive(tab));
  }

  private rebuildSubMenu(): void {
    const cluster = this.cluster;
    const explorerLicense: LicenseOptions = {
      feature: ApimFeature.APIM_NATIVE_KAFKA_EXPLORER,
      context: UTMTags.CONTEXT_ENVIRONMENT,
    };
    const explorerIconRight$ = this.gioLicenseService
      .isMissingFeature$(explorerLicense.feature)
      .pipe(map(notAllowed => (notAllowed ? 'gio:lock' : null)));

    const tabs: MenuItem[] = [
      {
        displayName: this.languageService.translate('kafka.navigation.general'),
        routerLink: 'general',
        permissions: ['cluster-definition-r'],
      },
    ];

    if (cluster.type === 'KAFKA_CLUSTER_STANDALONE') {
      tabs.push({
        displayName: this.languageService.translate('kafka.navigation.explorer'),
        routerLink: 'explorer',
        permissions: ['cluster-definition-r'],
        license: explorerLicense,
        iconRight$: explorerIconRight$,
      });
    }

    tabs.push({
      displayName: this.languageService.translate('kafka.navigation.configuration'),
      routerLink: 'configuration',
      permissions: ['cluster-configuration-r'],
    });

    tabs.push({
      displayName: this.languageService.translate('kafka.navigation.userPermissions'),
      routerLink: 'user-permissions',
      permissions: ['cluster-member-r'],
    });

    this.subMenuItems = this.filterMenuByPermission([
      {
        displayName: this.languageService.translate('kafka.navigation.general'),
        routerLink: '',
        permissions: ['cluster-definition-r'],
        tabs: this.filterMenuByPermission(tabs),
      },
    ]);

    this.selectedItemWithTabs = this.subMenuItems.find(item => item.tabs && this.isTabActive(item.tabs));
  }

  private filterMenuByPermission(menuItems: MenuItem[]): MenuItem[] {
    if (menuItems) {
      return menuItems.filter(item => !item.permissions || this.permissionService.hasAnyMatching(item.permissions));
    }
    return [];
  }

  private getClusterNavigationSearchItems(): MenuSearchItem[] {
    const environmentId = this.activatedRoute.snapshot.params.envHrid;
    const clusterId = this.activatedRoute.snapshot.params.clusterId;
    const parentRouterLink = getPathFromRoot(this.activatedRoute);
    const searchCategory = this.languageService.translate('kafka.navigation.searchCategory');

    return this.subMenuItems.reduce((acc: MenuSearchItem[], item: MenuItem) => {
      acc.push({
        name: item.displayName,
        routerLink: `${parentRouterLink}/${cleanRouterLink(item.routerLink)}`,
        category: searchCategory,
        groupIds: [environmentId, clusterId],
      });

      item.tabs?.forEach(tab => {
        acc.push({
          name: tab.displayName,
          routerLink: `${parentRouterLink}/${cleanRouterLink(tab.routerLink)}`,
          category: `${searchCategory} / ${item.displayName}`,
          groupIds: [environmentId, clusterId],
        });
      });

      return acc;
    }, []);
  }
}
