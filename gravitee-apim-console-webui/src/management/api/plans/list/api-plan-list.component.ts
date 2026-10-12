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
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { catchError, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { EMPTY, forkJoin, Observable, of, Subject } from 'rxjs';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { orderBy } from 'lodash';
import {
  GioConfirmAndValidateDialogComponent,
  GioConfirmAndValidateDialogData,
  GioConfirmDialogComponent,
  GioConfirmDialogData,
} from '@gravitee/ui-particles-angular';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';

import { SubscriptionService } from '../../../../services-ngx/subscription.service';
import { GioPermissionService } from '../../../../shared/components/gio-permission/gio-permission.service';
import { SnackBarService } from '../../../../services-ngx/snack-bar.service';
import { ConstantsService, PlanMenuItemVM } from '../../../../services-ngx/constants.service';
import { ApiV2Service } from '../../../../services-ngx/api-v2.service';
import { Api, ApiV4, Plan, PLAN_STATUS, PlanStatus, UpdateApiV4 } from '../../../../entities/management-api-v2';
import { ApiPlanV2Service } from '../../../../services-ngx/api-plan-v2.service';
import { PlanActionEvent, PlanDS } from '../../component/plan/plan-list/plan-list.component';
import { LanguageService } from '../../../../shared/i18n/language.service';

@Component({
  selector: 'api-plan-list',
  templateUrl: './api-plan-list.component.html',
  styleUrls: ['./api-plan-list.component.scss'],
  standalone: false,
})
export class ApiPlanListComponent implements OnInit, OnDestroy {
  private unsubscribe$: Subject<boolean> = new Subject<boolean>();
  public api: Api;
  public plansTableDS: PlanDS[] = [];
  public isLoadingData = true;
  public apiPlanStatus: { name: PlanStatus; number: number | null }[] = PLAN_STATUS.map(status => ({ name: status, number: null }));
  public status: PlanStatus;
  public isReadOnly = false;
  public isV2Api: boolean;
  public planMenuItems: PlanMenuItemVM[];

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly plansService: ApiPlanV2Service,
    private readonly constantsService: ConstantsService,
    private readonly apiService: ApiV2Service,
    private readonly subscriptionService: SubscriptionService,
    private readonly permissionService: GioPermissionService,
    private readonly matDialog: MatDialog,
    private readonly snackBarService: SnackBarService,
    private readonly cdr: ChangeDetectorRef,
    private readonly languageService: LanguageService,
  ) {}

  private t(key: string, params?: Record<string, string | number>): string {
    return this.languageService.translate(`apis.plans.${key}`, params);
  }

  public ngOnInit(): void {
    this.status = this.activatedRoute.snapshot.queryParams?.status ?? 'PUBLISHED';

    this.apiService
      .get(this.activatedRoute.snapshot.params.apiId)
      .pipe(
        tap(api => {
          this.api = api;
          this.isV2Api = api && api.definitionVersion === 'V2';
          this.isReadOnly = !this.permissionService.hasAnyMatching(['api-plan-u']) || api.definitionContext?.origin === 'KUBERNETES';

          this.computePlanOptions();
        }),
        tap(() => this.initPlansTableDS(this.status, true)),
        catchError(({ error }) => {
          this.snackBarService.error(error.message);
          return EMPTY;
        }),
        takeUntil(this.unsubscribe$),
      )
      .subscribe();
  }

  public ngOnDestroy(): void {
    this.unsubscribe$.next(true);
    this.unsubscribe$.unsubscribe();
  }

  public searchPlansByStatus(status: PlanStatus): void {
    this.status = status;
    this.initPlansTableDS(this.status);
  }

  public navigateToNewPlan(planFormType: string): void {
    this.router.navigate(['./new'], {
      relativeTo: this.activatedRoute,
      queryParams: { selectedPlanMenuItem: planFormType },
    });
  }

  public navigateToPlan(plan: PlanDS): void {
    this.router.navigate(['./', plan.id], { relativeTo: this.activatedRoute });
  }

  public dropRow(event: CdkDragDrop<string[]>) {
    const currentData = [...this.plansTableDS];
    const elm = currentData[event.previousIndex];
    currentData.splice(event.previousIndex, 1);
    currentData.splice(event.currentIndex, 0, elm);
    this.plansTableDS = [...currentData];

    const movedPlan = this.plansTableDS[event.currentIndex];
    const newOrder = event.currentIndex + 1;

    this.plansService
      .get(this.api.id, movedPlan.id)
      .pipe(
        switchMap(fullPlan => this.plansService.update(this.api.id, movedPlan.id, { ...fullPlan, order: newOrder })),
        tap(() => this.ngOnInit()),
        catchError(({ error }) => {
          this.snackBarService.error(error.message);
          this.ngOnInit();
          return EMPTY;
        }),
        takeUntil(this.unsubscribe$),
      )
      .subscribe();
  }

  public designPlan(planId: string): void {
    if (this.api.definitionVersion === 'V2') {
      this.router.navigate(['../v2/policy-studio'], {
        relativeTo: this.activatedRoute,
        queryParams: { flows: `${planId}_0` },
      });
    }
    if (this.api.definitionVersion === 'V4') {
      this.router.navigate(['../v4/policy-studio'], {
        relativeTo: this.activatedRoute,
      });
    }
  }

  public onActionSelected(event: PlanActionEvent): void {
    switch (event.action) {
      case 'PUBLISH':
        this.publishPlan(event.plan);
        break;
      case 'DEPRECATE':
        this.deprecatePlan(event.plan);
        break;
      case 'CLOSE':
        this.closePlan(event.plan);
        break;
      case 'DESIGN':
        this.designPlan(event.plan.id);
        break;
    }
  }

  public publishPlan(plan: Plan): void {
    const publishPlan$ =
      this.api.definitionVersion === 'V4' && this.api.type === 'NATIVE' && this.api.listeners.some(l => l.type === 'KAFKA')
        ? this.publishNativeKafkaPlan$(plan)
        : this.httpPlanDialog$(plan);

    publishPlan$
      .pipe(
        catchError(({ error }) => {
          this.snackBarService.error(error.message);
          return EMPTY;
        }),
        map(plan => {
          this.snackBarService.success(this.t('snackbar.published', { name: plan.name }));
          this.ngOnInit();
        }),
        takeUntil(this.unsubscribe$),
      )
      .subscribe();
  }

  public deprecatePlan(plan: Plan): void {
    this.matDialog
      .open<GioConfirmDialogComponent, GioConfirmDialogData>(GioConfirmDialogComponent, {
        width: '500px',
        data: {
          title: this.t('deprecateDialog.title'),
          content: this.t('deprecateDialog.content', { name: plan.name }),
          confirmButton: this.t('deprecateDialog.confirm'),
        },
        role: 'alertdialog',
        id: 'deprecatePlanDialog',
      })
      .afterClosed()
      .pipe(
        filter(confirm => confirm === true),
        switchMap(() => this.plansService.deprecate(this.api.id, plan.id)),
        catchError(({ error }) => {
          this.snackBarService.error(error.message);
          return EMPTY;
        }),
        map(plan => {
          this.snackBarService.success(this.t('snackbar.deprecated', { name: plan.name }));
          this.ngOnInit();
        }),
        takeUntil(this.unsubscribe$),
      )
      .subscribe();
  }

  public closePlan(plan: Plan): void {
    this.subscriptionService
      .getApiSubscriptionsByPlan(plan.apiId, plan.id)
      .pipe(
        switchMap(subscriptions => {
          let content = '';
          if (plan.security?.type === 'KEY_LESS') {
            content = this.t('closeDialog.keyless');
          } else {
            if (subscriptions.page.size === 0) {
              content = this.t('closeDialog.noSubscriptions');
            } else if (subscriptions.page.size > 0) {
              content = this.t('closeDialog.withSubscriptions');
            }
          }
          return this.matDialog
            .open<GioConfirmAndValidateDialogComponent, GioConfirmAndValidateDialogData>(GioConfirmAndValidateDialogComponent, {
              width: '500px',
              data: {
                title: this.t('closeDialog.title'),
                warning: this.t('closeDialog.warning'),
                validationMessage: this.t('closeDialog.validation', { name: plan.name }),
                validationValue: plan.name,
                content,
                confirmButton: this.t('closeDialog.confirm'),
              },
              role: 'alertdialog',
              id: 'closePlanDialog',
            })
            .afterClosed();
        }),
        filter(confirm => confirm === true),
        switchMap(() => this.plansService.close(this.api.id, plan.id)),
        catchError(({ error }) => {
          this.snackBarService.error(error.message);
          return EMPTY;
        }),
        map(plan => {
          this.snackBarService.success(this.t('snackbar.closed', { name: plan.name }));
          this.ngOnInit();
        }),
        takeUntil(this.unsubscribe$),
      )
      .subscribe();
  }

  private httpPlanDialog$(plan: Plan): Observable<Plan> {
    return this.matDialog
      .open<GioConfirmDialogComponent, GioConfirmDialogData>(GioConfirmDialogComponent, {
        width: '500px',
        data: {
          title: this.t('publishDialog.title'),
          content: this.t('publishDialog.content', { name: plan.name }),
          confirmButton: this.t('publishDialog.confirm'),
        },
        role: 'alertdialog',
        id: 'publishPlanDialog',
      })
      .afterClosed()
      .pipe(
        filter(confirm => confirm === true),
        switchMap(() => this.plansService.publish(this.api.id, plan.id)),
      );
  }

  private publishNativeKafkaPlan$(plan: Plan): Observable<Plan> {
    return this.plansService.list(this.api.id, undefined, ['PUBLISHED'], undefined, ['-flow'], 1, 9999).pipe(
      switchMap(plansResponse => {
        const publishedKeylessPlan = plansResponse.data.filter(plan => plan.security.type === 'KEY_LESS');
        const publishedMtlsPlan = plansResponse.data.filter(plan => plan.security.type === 'MTLS');
        const publishedAuthPlans = plansResponse.data.filter(plan => plan.security.type !== 'KEY_LESS' && plan.security.type !== 'MTLS');

        if (plan.security?.type === 'KEY_LESS' && (publishedMtlsPlan.length || publishedAuthPlans.length)) {
          return this.nativeKafkaDialog$(plan, [...publishedMtlsPlan, ...publishedAuthPlans]);
        } else if (plan.security?.type === 'MTLS' && (publishedKeylessPlan.length || publishedAuthPlans.length)) {
          return this.nativeKafkaDialog$(plan, [...publishedKeylessPlan, ...publishedAuthPlans]);
        } else if (
          plan.security?.type !== 'KEY_LESS' &&
          plan.security?.type !== 'MTLS' &&
          (publishedKeylessPlan.length || publishedMtlsPlan.length)
        ) {
          return this.nativeKafkaDialog$(plan, [...publishedKeylessPlan, ...publishedMtlsPlan]);
        } else {
          return this.httpPlanDialog$(plan);
        }
      }),
      takeUntil(this.unsubscribe$),
    );
  }

  private nativeKafkaDialog$(plan: Plan, plansToClose: Plan[]): Observable<Plan> {
    const hasMtls = plansToClose.some(p => p.security.type === 'MTLS');
    const hasAuth = plansToClose.some(p => p.security.type !== 'KEY_LESS' && p.security.type !== 'MTLS');

    let planTypeToPublish: string;
    let ifSubscriptionContent = '';

    const plansList = plansToClose.map(p => `- <strong>${p.name}</strong> (${this.getSecurityTypeLabel(p.security.type)})`).join('\n');

    if (plan.security.type === 'KEY_LESS') {
      planTypeToPublish = this.t('publishCloseDialog.typeKeyless');
      if (hasMtls || hasAuth) {
        ifSubscriptionContent = this.t('publishCloseDialog.subscriptionWarning');
      }
    } else if (plan.security.type === 'MTLS') {
      planTypeToPublish = this.t('publishCloseDialog.typeMtls');
      if (hasAuth) {
        ifSubscriptionContent = this.t('publishCloseDialog.subscriptionWarning');
      }
    } else {
      planTypeToPublish = this.t('publishCloseDialog.typeAuthentication');
      if (hasMtls) {
        ifSubscriptionContent = this.t('publishCloseDialog.subscriptionWarning');
      }
    }

    const content = this.t('publishCloseDialog.kafkaRule', {
      planType: planTypeToPublish,
      name: plan.name,
      plansLabel: plansToClose.length > 1 ? this.t('publishCloseDialog.plans') : this.t('publishCloseDialog.plan'),
      plansList,
      subscriptionWarning: ifSubscriptionContent,
    });

    return this.matDialog
      .open<GioConfirmAndValidateDialogComponent, GioConfirmAndValidateDialogData>(GioConfirmAndValidateDialogComponent, {
        width: '500px',
        data: {
          title: plansToClose.length > 1 ? this.t('publishCloseDialog.titleMany') : this.t('publishCloseDialog.titleOne'),
          warning: this.t('closeDialog.warning'),
          validationMessage: this.t('closeDialog.validation', { name: plan.name }),
          validationValue: plan.name,
          content,
          confirmButton: this.t('publishCloseDialog.confirm'),
        },
        role: 'alertdialog',
        id: 'publishNativeKafkaPlanDialog',
      })
      .afterClosed()
      .pipe(
        filter(confirm => confirm === true),
        switchMap(() => forkJoin(plansToClose.map(p => this.plansService.close(this.api.id, p.id)))),
        switchMap(() => this.plansService.publish(this.api.id, plan.id)),
      );
  }

  private getSecurityTypeLabel(type?: string): string {
    if (!type) {
      return type;
    }
    const translated = this.languageService.translate(`apis.plans.securityTypes.${type}`);
    return translated === `apis.plans.securityTypes.${type}` ? type : translated;
  }

  private initPlansTableDS(selectedStatus: PlanStatus, fullReload = false): void {
    // For full reload, we need to reset the number of plans for each status
    const getApiPlans$: Observable<Plan[]> = fullReload
      ? this.plansService.list(this.activatedRoute.snapshot.params.apiId, undefined, [...PLAN_STATUS], undefined, ['-flow'], 1, 9999).pipe(
          map(plans => {
            // Update the number of plans for each status
            const plansNumber = plans.data.reduce(
              (acc, plan) => {
                const status = plan.status.toUpperCase();
                acc[status] = acc[status] ? acc[status] + 1 : 1;
                return acc;
              },
              {} as Record<PlanStatus, number>,
            );

            this.apiPlanStatus.forEach(plan => {
              plan.number = plansNumber[plan.name.toUpperCase()] ?? 0;
            });

            // Filter plans by status
            return plans.data.filter(p => p.status === selectedStatus);
          }),
        )
      : this.plansService
          .list(this.activatedRoute.snapshot.params.apiId, undefined, [selectedStatus], undefined, ['-flow'], 1, 9999)
          .pipe(map(response => response.data));

    getApiPlans$
      .pipe(
        map(plans =>
          plans.map(plan => ({
            ...plan,
            securityTypeLabel: this.getSecurityTypeLabel(plan.security?.type),
          })),
        ),
        tap(plans => {
          this.router.navigate(['../plans'], {
            relativeTo: this.activatedRoute,
            queryParams: { status: this.status },
          });
          this.plansTableDS = orderBy(plans, 'order', 'asc');
          this.isLoadingData = false;
        }),
        catchError(error => {
          this.snackBarService.error(error.message);
          return of({});
        }),
        takeUntil(this.unsubscribe$),
      )
      .subscribe();
  }

  private computePlanOptions(): void {
    this.planMenuItems = this.constantsService.getPlanMenuItems(
      this.api.definitionVersion,
      this.api.definitionVersion === 'V4' ? this.api.listeners.map(l => l.type) : null,
    );
  }

  public onAllowMultiJwtOauth2SubscriptionsChange(checked: boolean): void {
    if (checked) {
      (this.api as ApiV4).allowMultiJwtOauth2Subscriptions = true;
      this.matDialog
        .open<GioConfirmDialogComponent, GioConfirmDialogData>(GioConfirmDialogComponent, {
          width: '450px',
          data: {
            title: this.t('allowMultiDialog.title'),
            content: this.t('allowMultiDialog.content'),
            confirmButton: this.t('allowMultiDialog.confirm'),
          },
        })
        .afterClosed()
        .pipe(
          tap(confirm => {
            if (confirm !== true) {
              (this.api as ApiV4).allowMultiJwtOauth2Subscriptions = false;
              this.cdr.markForCheck();
            }
          }),
          filter(confirm => confirm === true),
          switchMap(() => {
            const updateApi: UpdateApiV4 = {
              ...(this.api as ApiV4),
              allowMultiJwtOauth2Subscriptions: true,
            };
            return this.apiService.update(this.api.id, updateApi);
          }),
          tap(api => {
            this.api = api;
            this.snackBarService.success(this.t('snackbar.updated'));
          }),
          catchError(({ error }) => {
            this.snackBarService.error(error?.message ?? this.t('snackbar.error'));
            (this.api as ApiV4).allowMultiJwtOauth2Subscriptions = false;
            this.cdr.markForCheck();
            return EMPTY;
          }),
          takeUntil(this.unsubscribe$),
        )
        .subscribe();
    } else {
      const updateApi: UpdateApiV4 = {
        ...(this.api as ApiV4),
        allowMultiJwtOauth2Subscriptions: false,
      };
      this.apiService
        .update(this.api.id, updateApi)
        .pipe(
          tap(api => {
            this.api = api;
            this.snackBarService.success(this.t('snackbar.updated'));
          }),
          catchError(({ error }) => {
            this.snackBarService.error(error?.message ?? this.t('snackbar.error'));
            return EMPTY;
          }),
          takeUntil(this.unsubscribe$),
        )
        .subscribe();
    }
  }
}
