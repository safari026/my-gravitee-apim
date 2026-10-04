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

import { ChangeDetectorRef, Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { GioMenuSearchService, GioMenuService, MenuSearchItem } from '@gravitee/ui-particles-angular';
import { Subject } from 'rxjs';
import { filter, skip, switchMap, takeUntil, tap } from 'rxjs/operators';
import { flatMap } from 'lodash';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { cleanRouterLink, getPathFromRoot } from '../../../util/router-link.util';
import { GioPermissionService } from '../../../shared/components/gio-permission/gio-permission.service';
import { Application } from '../../../entities/application/Application';
import { ApplicationService } from '../../../services-ngx/application.service';
import { LanguageService } from '../../../shared/i18n/language.service';

export interface MenuItem {
  displayName: string;
  permissions?: string[];
  tabs?: MenuItem[];
  header?: MenuItemHeader;
  routerLink?: string;
  routerLinkActiveOptions?: { exact: boolean };
}

export interface MenuItemHeader {
  title?: string;
  subtitle?: string;
}

@Component({
  selector: 'application-navigation',
  templateUrl: './application-navigation.component.html',
  styleUrls: ['./application-navigation.component.scss'],
  standalone: false,
})
export class ApplicationNavigationComponent implements OnInit, OnDestroy {
  public application: Application;
  public subMenuItems: MenuItem[] = [];
  public hasBreadcrumb = false;
  public selectedItemWithTabs: MenuItem = undefined;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly permissionService: GioPermissionService,
    private readonly gioMenuService: GioMenuService,
    private readonly applicationService: ApplicationService,
    private readonly gioMenuSearchService: GioMenuSearchService,
    private readonly languageService: LanguageService,
    private readonly injector: Injector,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.gioMenuService.reduced$.pipe(takeUntil(this.unsubscribe$)).subscribe(reduced => {
      this.hasBreadcrumb = reduced;
    });

    this.applicationService
      .getLastApplicationFetch(this.activatedRoute.snapshot.params.applicationId)
      .pipe(
        tap(application => {
          this.application = application;
          this.applyNavigation(application);
        }),
        switchMap(() => this.router.events),
        filter(event => event instanceof NavigationEnd),
        tap(() => {
          this.selectedItemWithTabs = this.subMenuItems.find(item => item.tabs && this.isTabActive(item.tabs));
        }),
        takeUntil(this.unsubscribe$),
      )
      .subscribe();

    toObservable(this.languageService.currentLanguage, { injector: this.injector })
      .pipe(skip(1), takeUntil(this.unsubscribe$))
      .subscribe(() => {
        if (!this.application) {
          return;
        }
        this.applyNavigation(this.application);
        this.changeDetectorRef.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.unsubscribe();
    this.gioMenuSearchService.removeMenuSearchItems([this.activatedRoute.snapshot.params.applicationId]);
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

  private applyNavigation(application: Application): void {
    this.subMenuItems = this.filterMenuByPermission(this.buildSubMenuItems(application));
    this.selectedItemWithTabs = this.subMenuItems.find(item => item.tabs && this.isTabActive(item.tabs));
    this.gioMenuSearchService.removeMenuSearchItems([this.activatedRoute.snapshot.params.applicationId]);
    this.gioMenuSearchService.addMenuSearchItems(this.getApplicationNavigationSearchItems());
  }

  private buildSubMenuItems(application: Application): MenuItem[] {
    return [
      {
        displayName: this.languageService.translate('applications.navigation.globalSettings'),
        routerLink: 'general',
        permissions: ['application-definition-r'],
      },
      {
        displayName: this.languageService.translate('applications.navigation.userAndGroupAccess'),
        permissions: ['application-member-r'],
        routerLink: 'members',
        tabs: [
          {
            displayName: this.languageService.translate('applications.navigation.members'),
            routerLink: 'members',
          },
          {
            displayName: this.languageService.translate('applications.navigation.groups'),
            routerLink: 'groups',
          },
          {
            displayName: this.languageService.translate('applications.navigation.transferOwnership'),
            routerLink: 'transfer-ownership',
          },
        ],
      },
      ...(application.api_key_mode === 'SHARED'
        ? [
            {
              displayName: this.languageService.translate('applications.navigation.subscriptions'),
              permissions: ['application-member-r'],
              routerLink: 'subscriptions',
              tabs: [
                {
                  displayName: this.languageService.translate('applications.navigation.subscriptions'),
                  routerLink: 'subscriptions',
                },
                {
                  displayName: this.languageService.translate('applications.navigation.sharedApiKeys'),
                  routerLink: 'shared-api-keys',
                },
              ],
            },
          ]
        : [
            {
              displayName: this.languageService.translate('applications.navigation.subscriptions'),
              routerLink: 'subscriptions',
              permissions: ['application-subscription-r'],
            },
          ]),
      {
        displayName: this.languageService.translate('applications.navigation.analytics'),
        routerLink: 'analytics',
        permissions: ['application-analytics-r'],
      },
      {
        displayName: this.languageService.translate('applications.navigation.logs'),
        routerLink: 'logs',
        permissions: ['application-log-r'],
      },
      {
        displayName: this.languageService.translate('applications.navigation.notifications'),
        routerLink: 'notifications',
        permissions: ['application-notification-r', 'application-alert-r'],
      },
    ];
  }

  private filterMenuByPermission(menuItems: MenuItem[]): MenuItem[] {
    if (menuItems) {
      return menuItems.filter(item => !item.permissions || this.permissionService.hasAnyMatching(item.permissions));
    }
    return [];
  }

  private getApplicationNavigationSearchItems(): MenuSearchItem[] {
    const environmentId = this.activatedRoute.snapshot.params.envHrid;
    const applicationId = this.activatedRoute.snapshot.params.applicationId;
    const parentRouterLink = getPathFromRoot(this.activatedRoute);

    return this.subMenuItems.reduce((acc: MenuSearchItem[], item: MenuItem) => {
      acc.push({
        name: item.displayName,
        routerLink: `${parentRouterLink}/${cleanRouterLink(item.routerLink)}`,
        category: this.languageService.translate('applications.navigation.applications'),
        groupIds: [environmentId, applicationId],
      });

      item.tabs?.forEach(tab => {
        acc.push({
          name: tab.displayName,
          routerLink: `${parentRouterLink}/${cleanRouterLink(tab.routerLink)}`,
          category: `${this.languageService.translate('applications.navigation.applications')} / ${item.displayName}`,
          groupIds: [environmentId, applicationId],
        });
      });

      return acc;
    }, []);
  }
}
