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

import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { GioMenuSearchService, GioMenuService, MenuSearchItem } from '@gravitee/ui-particles-angular';
import { combineLatest, Subject } from 'rxjs';
import { filter, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
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
  ) {}

  private t(key: string): string {
    return this.languageService.translate(`applications.navigation.${key}`);
  }

  ngOnInit() {
    this.gioMenuService.reduced$.pipe(takeUntil(this.unsubscribe$)).subscribe(reduced => {
      this.hasBreadcrumb = reduced;
    });

    combineLatest([
      this.applicationService.getLastApplicationFetch(this.activatedRoute.snapshot.params.applicationId),
      toObservable(this.languageService.currentLanguage, { injector: this.injector }).pipe(
        startWith(this.languageService.currentLanguage()),
      ),
    ])
      .pipe(
        tap(([application]) => {
          this.application = application;
          this.subMenuItems = this.buildMenu(application);
          this.selectedItemWithTabs = this.subMenuItems.find(item => item.tabs && this.isTabActive(item.tabs));
          this.gioMenuSearchService.addMenuSearchItems(this.getApplicationNavigationSearchItems());
        }),
        switchMap(() => this.router.events),
        filter(event => event instanceof NavigationEnd),
        tap(() => {
          this.selectedItemWithTabs = this.subMenuItems.find(item => item.tabs && this.isTabActive(item.tabs));
        }),
        takeUntil(this.unsubscribe$),
      )
      .subscribe();
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

  private buildMenu(application: Application): MenuItem[] {
    return this.filterMenuByPermission([
      {
        displayName: this.t('globalSettings'),
        routerLink: 'general',
        permissions: ['application-definition-r'],
      },
      {
        displayName: this.t('userAndGroupAccess'),
        permissions: ['application-member-r'],
        routerLink: 'members',
        tabs: [
          {
            displayName: this.t('members'),
            routerLink: 'members',
          },
          {
            displayName: this.t('groups'),
            routerLink: 'groups',
          },
          {
            displayName: this.t('transferOwnership'),
            routerLink: 'transfer-ownership',
          },
        ],
      },
      ...(application.api_key_mode === 'SHARED'
        ? [
            {
              displayName: this.t('subscriptions'),
              permissions: ['application-member-r'],
              routerLink: 'subscriptions',
              tabs: [
                {
                  displayName: this.t('subscriptions'),
                  routerLink: 'subscriptions',
                },
                {
                  displayName: this.t('sharedApiKeys'),
                  routerLink: 'shared-api-keys',
                },
              ],
            },
          ]
        : [
            {
              displayName: this.t('subscriptions'),
              routerLink: 'subscriptions',
              permissions: ['application-subscription-r'],
            },
          ]),
      {
        displayName: this.t('analytics'),
        routerLink: 'analytics',
        permissions: ['application-analytics-r'],
      },
      {
        displayName: this.t('logs'),
        routerLink: 'logs',
        permissions: ['application-log-r'],
      },
      {
        displayName: this.t('notifications'),
        routerLink: 'notifications',
        permissions: ['application-notification-r', 'application-alert-r'],
      },
    ]);
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
        category: this.t('applications'),
        groupIds: [environmentId, applicationId],
      });

      item.tabs?.forEach(tab => {
        acc.push({
          name: tab.displayName,
          routerLink: `${parentRouterLink}/${cleanRouterLink(tab.routerLink)}`,
          category: `${this.t('applications')} / ${item.displayName}`,
          groupIds: [environmentId, applicationId],
        });
      });

      return acc;
    }, []);
  }
}
