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
import { flatMap } from 'lodash';
import { filter, map, shareReplay, skip, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { GIO_DIALOG_WIDTH, GioBannerTypes, GioMenuSearchService, GioMenuService, MenuSearchItem } from '@gravitee/ui-particles-angular';
import { combineLatest, Observable, Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import {
  ApiConfirmDeploymentDialogComponent,
  ApiConfirmDeploymentDialogData,
  ApiConfirmDeploymentDialogResult,
} from './api-confirm-deployment-dialog/api-confirm-deployment-dialog.component';
import { ApiReviewDialogComponent, ApiReviewDialogData, ApiReviewDialogResult } from './api-review-dialog/api-review-dialog.component';
import { MenuGroupItem, MenuItem, MenuItemHeader } from './MenuGroupItem';
import { ApiV4MenuService } from './api-v4-menu.service';
import { ApiV2MenuService } from './api-v2-menu.service';
import { ApiFederatedMenuService } from './api-federated-menu.service';
import { ApiMenuService } from './ApiMenuService';

import { cleanRouterLink, getPathFromRoot } from '../../../util/router-link.util';
import { GioPermissionService } from '../../../shared/components/gio-permission/gio-permission.service';
import { Constants } from '../../../entities/Constants';
import { ApiV2Service } from '../../../services-ngx/api-v2.service';
import { Api } from '../../../entities/management-api-v2';
import { ApiService } from '../../../services-ngx/api.service';
import { SnackBarService } from '../../../services-ngx/snack-bar.service';
import { IntegrationsService } from '../../../services-ngx/integrations.service';
import { LanguageService } from '../../../shared/i18n/language.service';

type TopBanner = {
  title: string;
  body?: string;
  type: GioBannerTypes;
  action?: {
    btnText: string;
    onClick: () => void;
  };
};

@Component({
  selector: 'api-navigation',
  templateUrl: './api-navigation.component.html',
  styleUrls: ['./api-navigation.component.scss'],
  providers: [ApiV2MenuService, ApiV4MenuService, ApiFederatedMenuService],
  standalone: false,
})
export class ApiNavigationComponent implements OnInit, OnDestroy {
  public currentApi: Api;
  public subMenuItems: MenuItem[] = [];
  public groupItems: MenuGroupItem[] = [];
  public selectedItemWithTabs: MenuItem = undefined;
  public selectedItemHeader: MenuItemHeader;
  public bannerState: string;
  public hasBreadcrumb = false;
  public isActionDisabled = false;
  public breadcrumbItems: string[] = [];
  public banners$: Observable<TopBanner[]> = combineLatest([
    this.apiV2Service.getLastApiFetch(this.activatedRoute.snapshot.params.apiId),
    this.apiV2Service.verifyDeploy(this.activatedRoute.snapshot.params.apiId),
    toObservable(this.languageService.currentLanguage, { injector: this.injector }).pipe(
      startWith(this.languageService.currentLanguage()),
    ),
  ]).pipe(
    map(([api, verifyDeploymentResponse]) => {
      const banners: TopBanner[] = [];

      const isApiReviewer = this.permissionService.hasAnyMatching(['api-reviews-u']);
      // Only for API reviewer
      if (isApiReviewer && this.constants.env.settings?.apiReview?.enabled && api.workflowState === 'IN_REVIEW') {
        // 'api-reviews-u'
        banners.push({
          title: this.t('banners.reviewerChangesNeeded'),
          type: 'info',
          action: {
            btnText: this.t('banners.reviewChanges'),
            onClick: () => {
              this.isActionDisabled = true;
              this.matDialog
                .open<ApiReviewDialogComponent, ApiReviewDialogData, ApiReviewDialogResult>(ApiReviewDialogComponent, {
                  data: {
                    apiId: api.id,
                  },
                  role: 'alertdialog',
                  id: 'gioApiReviewDialog',
                  width: GIO_DIALOG_WIDTH.MEDIUM,
                })
                .afterClosed()
                .pipe(
                  tap(() => (this.isActionDisabled = false)),
                  takeUntil(this.unsubscribe$),
                )
                .subscribe();
            },
          },
        });
      }
      if (isApiReviewer && this.constants.env.settings?.apiReview?.enabled && api.workflowState === 'REVIEW_OK') {
        banners.push({
          title: this.t('banners.reviewerAccepted'),
          type: 'success',
          action: {
            btnText: this.t('banners.reviewChanges'),
            onClick: () => {
              this.isActionDisabled = true;
              this.matDialog
                .open<ApiReviewDialogComponent, ApiReviewDialogData, ApiReviewDialogResult>(ApiReviewDialogComponent, {
                  data: {
                    apiId: api.id,
                  },
                  role: 'alertdialog',
                  id: 'gioApiReviewDialog',
                  width: GIO_DIALOG_WIDTH.MEDIUM,
                })
                .afterClosed()
                .pipe(
                  tap(() => (this.isActionDisabled = false)),
                  takeUntil(this.unsubscribe$),
                )
                .subscribe();
            },
          },
        });
      }
      if (isApiReviewer && this.constants.env.settings?.apiReview?.enabled && api.workflowState === 'REQUEST_FOR_CHANGES') {
        banners.push({
          title: this.t('banners.reviewerRejected'),
          type: 'warning',
          action: {
            btnText: this.t('banners.reviewChanges'),
            onClick: () => {
              this.isActionDisabled = true;
              this.matDialog
                .open<ApiReviewDialogComponent, ApiReviewDialogData, ApiReviewDialogResult>(ApiReviewDialogComponent, {
                  data: {
                    apiId: api.id,
                  },
                  role: 'alertdialog',
                  id: 'gioApiReviewDialog',
                  width: GIO_DIALOG_WIDTH.MEDIUM,
                })
                .afterClosed()
                .pipe(
                  tap(() => (this.isActionDisabled = false)),
                  takeUntil(this.unsubscribe$),
                )
                .subscribe();
            },
          },
        });
      }

      // Only for not API reviewer
      if (!isApiReviewer && this.constants.env.settings?.apiReview?.enabled && api.workflowState === 'IN_REVIEW') {
        // not 'api-reviews-u'
        banners.push({
          title: this.t('banners.reviewAsked'),
          type: 'info',
        });
      }
      if (!isApiReviewer && this.constants.env.settings?.apiReview?.enabled && api.workflowState === 'REVIEW_OK') {
        // not 'api-reviews-u'
        banners.push({
          title: this.t('banners.reviewerAcceptedNonReviewer'),
          type: 'success',
        });
      }
      if (!isApiReviewer && this.constants.env.settings?.apiReview?.enabled && api.workflowState === 'REQUEST_FOR_CHANGES') {
        // not 'api-reviews-u'
        banners.push({
          title: this.t('banners.reviewerRequestedChanges'),
          type: 'warning',
        });
      }

      // Other banners
      if (this.constants.env.settings?.apiReview?.enabled && api.workflowState === 'DRAFT') {
        banners.push({
          title: this.t('banners.draft'),
          type: 'info',
        });
      }

      const apiReviewIsOKOrNotNeeded =
        (this.constants.env.settings?.apiReview?.enabled && api.workflowState === 'REVIEW_OK') ||
        !this.constants.env.settings?.apiReview?.enabled;
      const canUpdateApiDefinition = this.permissionService.hasAnyMatching(['api-definition-u']);
      if (api.deploymentState === 'NEED_REDEPLOY' && apiReviewIsOKOrNotNeeded && verifyDeploymentResponse.ok) {
        banners.push(
          canUpdateApiDefinition
            ? {
                title: this.t('banners.outOfSync'),
                type: 'warning',
                action: {
                  btnText: this.t('banners.deployApi'),
                  onClick: () => {
                    this.isActionDisabled = true;
                    this.matDialog
                      .open<ApiConfirmDeploymentDialogComponent, ApiConfirmDeploymentDialogData, ApiConfirmDeploymentDialogResult>(
                        ApiConfirmDeploymentDialogComponent,
                        {
                          data: {
                            apiId: api.id,
                          },
                          role: 'alertdialog',
                          id: 'gioApiConfirmDeploymentDialog',
                          width: GIO_DIALOG_WIDTH.MEDIUM,
                        },
                      )
                      .afterClosed()
                      .pipe(
                        tap(() => (this.isActionDisabled = false)),
                        takeUntil(this.unsubscribe$),
                      )
                      .subscribe();
                  },
                },
              }
            : {
                title: this.t('banners.outOfSync'),
                type: 'warning',
              },
        );
      }

      if (api.lifecycleState === 'DEPRECATED') {
        banners.push({
          title: this.t('banners.deprecated'),
          type: 'error',
        });
      }

      if (!verifyDeploymentResponse.ok) {
        banners.push({
          title: this.t('banners.cannotDeploy'),
          body: this.t('banners.cannotDeployBody'),
          type: 'error',
        });
      }

      return banners;
    }),
    shareReplay(1),
  );
  public hasBanner$ = this.banners$.pipe(map(banners => banners.length > 0));

  private unsubscribe$ = new Subject();
  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly permissionService: GioPermissionService,
    @Inject(Constants) private readonly constants: Constants,
    private readonly gioMenuService: GioMenuService,
    private readonly apiV2Service: ApiV2Service,
    private readonly legacyApiService: ApiService,
    private readonly matDialog: MatDialog,
    private readonly apiV2MenuService: ApiV2MenuService,
    private readonly apiNgV4MenuService: ApiV4MenuService,
    private readonly apiFederatedMenuService: ApiFederatedMenuService,
    private readonly snackBarService: SnackBarService,
    private readonly gioMenuSearchService: GioMenuSearchService,
    public readonly integrationsService: IntegrationsService,
    private readonly languageService: LanguageService,
    private readonly injector: Injector,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) {}

  private t(key: string, params?: Record<string, string | number>): string {
    return this.languageService.translate(`apis.navigation.${key}`, params);
  }

  ngOnInit() {
    this.gioMenuService.reduced$.pipe(takeUntil(this.unsubscribe$)).subscribe(reduced => {
      this.hasBreadcrumb = reduced;
    });

    this.bannerState = localStorage.getItem('gv-api-navigation-banner');

    this.apiV2Service
      .getLastApiFetch(this.activatedRoute.snapshot.params.apiId)
      .pipe(
        tap(api => (this.currentApi = api)),
        tap(api => this.applyMenu(api)),
        switchMap(() => this.router.events),
        filter(event => event instanceof NavigationEnd),
        map((event: NavigationEnd) => event),
        tap(() => {
          this.selectedItemWithTabs = this.findMenuItemWithTabs();
          this.selectedItemHeader = this.findActiveMenuItemHeader();
        }),
        takeUntil(this.unsubscribe$),
      )
      .subscribe();

    toObservable(this.languageService.currentLanguage, { injector: this.injector })
      .pipe(skip(1), takeUntil(this.unsubscribe$))
      .subscribe(() => {
        if (!this.currentApi) {
          return;
        }
        this.applyMenu(this.currentApi);
        this.changeDetectorRef.markForCheck();
      });
  }

  private applyMenu(api: Api): void {
    const menu = this.computeMenu(api).getMenu(api);
    this.groupItems = menu.groupItems;
    this.subMenuItems = menu.subMenuItems;
    this.gioMenuSearchService.removeMenuSearchItems([api.id]);
    this.gioMenuSearchService.addMenuSearchItems(this.getApiNavigationSearchItems());
    this.breadcrumbItems = this.computeBreadcrumbItems();
    this.selectedItemWithTabs = this.findMenuItemWithTabs();
    this.selectedItemHeader = this.findActiveMenuItemHeader();
  }

  ngOnDestroy() {
    this.unsubscribe$?.next(true);
    this.unsubscribe$?.unsubscribe();
    this.gioMenuSearchService.removeMenuSearchItems([this.currentApi?.id]);
  }

  private findMenuItemWithTabs(): MenuItem {
    let item: MenuItem = this.findActiveMenuItem(this.subMenuItems);
    if (item) {
      return item;
    }

    for (const groupItem of this.groupItems) {
      item = this.findActiveMenuItem(groupItem.items);
      if (item) {
        return item;
      }
    }
  }

  private findActiveMenuItem(items: MenuItem[]) {
    return items.filter(item => item?.tabs).find(item => this.isTabActive(item?.tabs));
  }

  private findActiveMenuItemHeader() {
    return this.subMenuItems.find(item => this.isActive(item) || this.isTabActive(item.tabs))?.header;
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

  isTabActive(tabs: MenuItem[]): boolean {
    return flatMap(tabs, tab => tab).some(tab => this.isActive(tab));
  }

  public computeBreadcrumbItems(): string[] {
    const breadcrumbItems: string[] = [];

    this.groupItems.forEach(groupItem => {
      groupItem.items.forEach(item => {
        if (this.isActive(item)) {
          breadcrumbItems.push(groupItem.title);
          breadcrumbItems.push(item.displayName);
        } else if (item.tabs && this.isTabActive(item.tabs)) {
          breadcrumbItems.push(groupItem.title);
          breadcrumbItems.push(item.displayName);
        }
      });
    });

    return breadcrumbItems;
  }

  private getApiNavigationSearchItems() {
    const environmentId = this.activatedRoute.snapshot.params.envHrid;
    const apiId = this.currentApi.id;
    const parentRouterLink = getPathFromRoot(this.activatedRoute);

    return this.mapToMenuSearchItem(environmentId, apiId, parentRouterLink, this.subMenuItems).concat(
      this.mapToMenuSearchItem(
        environmentId,
        apiId,
        parentRouterLink,
        this.groupItems.flatMap(item => item.items),
      ),
    );
  }

  private mapToMenuSearchItem(environmentId: string, apiId: string, parentRouterLink: string, items: MenuItem[]): MenuSearchItem[] {
    return items.reduce((acc: MenuSearchItem[], item: MenuItem) => {
      const cleanItemLink = cleanRouterLink(item.routerLink);
      const routerLink = cleanItemLink || cleanRouterLink(item.tabs?.[0]?.routerLink) || '';

      // check if parent route is empty  ('') and if the first tab has the same name than the parent.
      const isUniqueItem = cleanItemLink || item.displayName !== item.tabs?.[0]?.displayName;

      if (routerLink !== 'DISABLED' && isUniqueItem) {
        acc.push({
          name: item.displayName,
          routerLink: `${parentRouterLink}/${routerLink}`,
          category: this.t('searchCategory'),
          groupIds: [environmentId, apiId],
        });
      }

      item.tabs?.forEach(tab => {
        if (tab.routerLink !== 'DISABLED') {
          acc.push({
            name: tab.displayName,
            routerLink: `${parentRouterLink}/${cleanRouterLink(tab.routerLink)}`,
            category: this.t('searchCategoryItem', { item: item.displayName }),
            groupIds: [environmentId, apiId],
          });
        }
      });
      return acc;
    }, []);
  }

  public computeMenu(api: Api): ApiMenuService {
    if (api.definitionVersion === 'V4') {
      return this.apiNgV4MenuService;
    } else if (api.definitionVersion === 'FEDERATED' || api.definitionVersion === 'FEDERATED_AGENT') {
      return this.apiFederatedMenuService;
    }
    return this.apiV2MenuService;
  }
}
