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

import { Component, EventEmitter, Inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  GioConfirmAndValidateDialogComponent,
  GioConfirmAndValidateDialogData,
  GioConfirmDialogComponent,
  GioConfirmDialogData,
  GioLicenseService,
  License,
} from '@gravitee/ui-particles-angular';
import { EMPTY, Observable, Subject } from 'rxjs';
import { catchError, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

import { Constants } from '../../../../entities/Constants';
import { Api, ApiV4, UpdateApi } from '../../../../entities/management-api-v2';
import { SnackBarService } from '../../../../services-ngx/snack-bar.service';
import { ApiV2Service } from '../../../../services-ngx/api-v2.service';
import { ApiReviewV2Service } from '../../../../services-ngx/api-review-v2.service';
import { ApimFeature, UTMTags } from '../../../../shared/components/gio-license/gio-license-data';
import { LanguageService } from '../../../../shared/i18n/language.service';

@Component({
  selector: 'api-general-info-danger-zone',
  templateUrl: './api-general-info-danger-zone.component.html',
  styleUrls: ['./api-general-info-danger-zone.component.scss'],
  standalone: false,
})
export class ApiGeneralInfoDangerZoneComponent implements OnChanges, OnDestroy, OnInit {
  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly apiReviewV2Service: ApiReviewV2Service,
    private readonly apiService: ApiV2Service,
    private readonly matDialog: MatDialog,
    private readonly snackBarService: SnackBarService,
    @Inject(Constants) private readonly constants: Constants,
    private readonly licenseService: GioLicenseService,
    private readonly languageService: LanguageService,
  ) {}

  private t(key: string, params?: Record<string, string | number>): string {
    return this.languageService.translate(`apis.general.${key}`, params);
  }

  private unsubscribe$: Subject<boolean> = new Subject<boolean>();

  private licenseOptions = {
    feature: ApimFeature.APIM_EN_MESSAGE_REACTOR,
    context: UTMTags.GENERAL_DANGER_ZONE,
  };

  private llmLicenseOptions = {
    feature: ApimFeature.APIM_LLM_PROXY_REACTOR,
    context: UTMTags.GENERAL_DANGER_ZONE,
  };

  @Input()
  public api: Api;

  // When some actions are done, we need to reload the details to keep the component up to date
  @Output()
  public reloadDetails = new EventEmitter<void>();

  public dangerActions = {
    canAskForReview: false,
    canStartApi: false,
    canStopApi: false,
    canChangeApiLifecycle: false,
    canPublish: false,
    canUnpublish: false,
    canChangeVisibilityToPublic: false,
    canChangeVisibilityToPrivate: false,
    canDeprecate: false,
    canDelete: false,
  };
  public isReadOnly = false;
  public canDetach = false;
  public license$: Observable<License>;
  public isOEM$: Observable<boolean>;
  public shouldUpgrade: boolean;
  public subject = 'API';

  ngOnInit(): void {
    this.updateOriginContextState();
    this.license$ = this.licenseService.getLicense$();
    this.isOEM$ = this.licenseService.isOEM$();

    this.subject = this.api.definitionVersion === 'FEDERATED_AGENT' ? 'Federated Agent' : 'API';
    if (this.api.definitionVersion !== 'V4' || (this.api as ApiV4).type === 'PROXY') {
      this.shouldUpgrade = false;
    } else {
      this.apiService.verifyDeploy(this.api.id).subscribe(resp => {
        this.shouldUpgrade = resp?.ok !== true;
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.api) {
      this.updateOriginContextState();
      this.dangerActions = {
        canAskForReview:
          this.constants.env?.settings?.apiReview?.enabled &&
          (this.api.workflowState === 'DRAFT' || this.api.workflowState === 'REQUEST_FOR_CHANGES' || !this.api.workflowState),
        canStartApi:
          (!this.constants.env?.settings?.apiReview?.enabled ||
            (this.constants.env?.settings?.apiReview?.enabled && (!this.api.workflowState || this.api.workflowState === 'REVIEW_OK'))) &&
          this.api.state === 'STOPPED',
        canStopApi:
          (!this.constants.env?.settings?.apiReview?.enabled ||
            (this.constants.env?.settings?.apiReview?.enabled && (!this.api.workflowState || this.api.workflowState === 'REVIEW_OK'))) &&
          this.api.state === 'STARTED',

        canChangeApiLifecycle: this.canChangeApiLifecycle(this.api),
        canPublish:
          (!this.api.lifecycleState || this.api.lifecycleState === 'CREATED' || this.api.lifecycleState === 'UNPUBLISHED') &&
          this.api.definitionVersion !== 'FEDERATED_AGENT',
        canUnpublish: this.api.lifecycleState === 'PUBLISHED',

        canChangeVisibilityToPublic:
          this.api.lifecycleState !== 'DEPRECATED' && this.api.visibility === 'PRIVATE' && this.api.definitionVersion !== 'FEDERATED_AGENT',
        canChangeVisibilityToPrivate:
          this.api.lifecycleState !== 'DEPRECATED' && this.api.visibility === 'PUBLIC' && this.api.definitionVersion !== 'FEDERATED_AGENT',
        canDeprecate:
          this.api.lifecycleState !== 'DEPRECATED' &&
          this.api.definitionVersion !== 'FEDERATED' &&
          this.api.definitionVersion !== 'FEDERATED_AGENT',
        canDelete: !(this.api.state === 'STARTED' || this.api.lifecycleState === 'PUBLISHED'),
      };
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next(true);
    this.unsubscribe$.unsubscribe();
  }

  askForReview() {
    this.matDialog
      .open<GioConfirmDialogComponent, GioConfirmDialogData>(GioConfirmDialogComponent, {
        width: '500px',
        data: {
          title: this.t('danger.reviewTitle'),
          content: this.t('danger.reviewContent'),
          confirmButton: this.t('danger.reviewConfirm'),
        },
        role: 'alertdialog',
        id: 'reviewApiDialog',
      })
      .afterClosed()
      .pipe(
        filter(confirm => confirm === true),
        switchMap(() => this.apiReviewV2Service.ask(this.api.id)),
        catchError(({ error }) => {
          this.snackBarService.error(error.message);
          return EMPTY;
        }),
        tap(() => this.reloadDetails.emit()),
        map(() => this.snackBarService.success(this.t('danger.reviewAsked'))),
        takeUntil(this.unsubscribe$),
      )
      .subscribe();
  }

  changeLifecycle(state: 'START' | 'STOP') {
    this.matDialog
      .open<GioConfirmDialogComponent, GioConfirmDialogData>(GioConfirmDialogComponent, {
        width: '500px',
        data: {
          title: state === 'START' ? this.t('danger.startTitle') : this.t('danger.stopTitle'),
          content: state === 'START' ? this.t('danger.startContent') : this.t('danger.stopContent'),
          confirmButton: state === 'START' ? this.t('danger.startConfirm') : this.t('danger.stopConfirm'),
        },
        role: 'alertdialog',
        id: 'lifecycleDialog',
      })
      .afterClosed()
      .pipe(
        filter(confirm => confirm === true),
        switchMap(() => (state === 'START' ? this.apiService.start(this.api.id) : this.apiService.stop(this.api.id))),
        catchError(({ error }) => {
          this.snackBarService.error(error.message);
          return EMPTY;
        }),
        tap(() => this.reloadDetails.emit()),
        map(() => this.snackBarService.success(state === 'START' ? this.t('danger.started') : this.t('danger.stopped'))),
      )
      .subscribe();
  }

  changeApiLifecycle(lifecycleState: 'PUBLISHED' | 'UNPUBLISHED' | 'DEPRECATED') {
    const titles = {
      PUBLISHED: this.t('danger.publishTitle'),
      UNPUBLISHED: this.t('danger.unpublishTitle'),
      DEPRECATED: this.t('danger.deprecateTitle'),
    };
    const contents = {
      PUBLISHED: this.t('danger.publishContent'),
      UNPUBLISHED: this.t('danger.unpublishContent'),
      DEPRECATED: this.t('danger.deprecateContent'),
    };
    const confirms = {
      PUBLISHED: this.t('danger.publishConfirm'),
      UNPUBLISHED: this.t('danger.unpublishConfirm'),
      DEPRECATED: this.t('danger.deprecateConfirm'),
    };
    const successes = {
      PUBLISHED: this.t('danger.published'),
      UNPUBLISHED: this.t('danger.unpublished'),
      DEPRECATED: this.t('danger.deprecated'),
    };
    this.matDialog
      .open<GioConfirmDialogComponent, GioConfirmDialogData>(GioConfirmDialogComponent, {
        width: '500px',
        data: {
          title: titles[lifecycleState],
          content: contents[lifecycleState],
          confirmButton: confirms[lifecycleState],
        },
        role: 'alertdialog',
        id: 'apiLifecycleDialog',
      })
      .afterClosed()
      .pipe(
        filter(confirm => confirm === true),
        switchMap(() => this.apiService.get(this.api.id)),
        switchMap(api => {
          if (api.definitionVersion === 'V2' || api.definitionVersion === 'V4' || api.definitionVersion === 'FEDERATED') {
            const apiToUpdate: UpdateApi = { ...api, lifecycleState: lifecycleState };
            return this.apiService.update(this.api.id, apiToUpdate);
          } else {
            return EMPTY;
          }
        }),
        catchError(({ error }) => {
          this.snackBarService.error(error.message);
          return EMPTY;
        }),
        tap(() => this.reloadDetails.emit()),
        map(() => this.snackBarService.success(successes[lifecycleState])),
        takeUntil(this.unsubscribe$),
      )
      .subscribe();
  }

  changeVisibility(visibility: 'PUBLIC' | 'PRIVATE') {
    this.matDialog
      .open<GioConfirmDialogComponent, GioConfirmDialogData>(GioConfirmDialogComponent, {
        width: '500px',
        data: {
          title: this.t('danger.changeVisibility'),
          content: visibility === 'PUBLIC' ? this.t('danger.makePublicContent') : this.t('danger.makePrivateContent'),
          confirmButton: visibility === 'PUBLIC' ? this.t('danger.makePublic') : this.t('danger.makePrivate'),
        },
        role: 'alertdialog',
        id: 'apiLifecycleDialog',
      })
      .afterClosed()
      .pipe(
        filter(confirm => confirm === true),
        switchMap(() => this.apiService.get(this.api.id)),
        switchMap(api => {
          if (api.definitionVersion === 'V2' || api.definitionVersion === 'V4' || api.definitionVersion === 'FEDERATED') {
            return this.apiService.update(api.id, {
              ...api,
              visibility: visibility,
            });
          } else {
            return EMPTY;
          }
        }),
        catchError(({ error }) => {
          this.snackBarService.error(error.message);
          return EMPTY;
        }),
        tap(() => this.reloadDetails.emit()),
        map(() => this.snackBarService.success(visibility === 'PUBLIC' ? this.t('danger.madePublic') : this.t('danger.madePrivate'))),
        takeUntil(this.unsubscribe$),
      )
      .subscribe();
  }

  delete() {
    const shouldClosePlans = this.api.definitionVersion === 'FEDERATED_AGENT';

    this.matDialog
      .open<GioConfirmAndValidateDialogComponent, GioConfirmAndValidateDialogData>(GioConfirmAndValidateDialogComponent, {
        width: '500px',
        data: {
          title: this.t('danger.deleteTitle'),
          content: this.t('danger.deleteContent'),
          confirmButton: this.t('danger.deleteConfirm'),
          validationMessage: this.t('danger.deleteValidation', { name: this.api.name }),
          validationValue: this.api.name,
          warning: this.t('danger.deleteWarning'),
        },
        role: 'alertdialog',
        id: 'apiDeleteDialog',
      })
      .afterClosed()
      .pipe(
        filter(confirm => confirm === true),
        switchMap(() => this.apiService.delete(this.api.id, shouldClosePlans)),
        catchError(({ error }) => {
          this.snackBarService.error(error.message);
          return EMPTY;
        }),
        map(() => this.snackBarService.success(this.t('danger.deleted'))),
        takeUntil(this.unsubscribe$),
      )
      .subscribe(() => {
        this.router.navigate(['..'], { relativeTo: this.activatedRoute });
      });
  }

  detach() {
    this.matDialog
      .open<GioConfirmAndValidateDialogComponent, GioConfirmAndValidateDialogData>(GioConfirmAndValidateDialogComponent, {
        width: '500px',
        data: {
          title: this.t('danger.detachTitle'),
          content: this.t('danger.detachContent'),
          confirmButton: this.t('danger.detachConfirm'),
          validationMessage: this.t('danger.detachValidation', { name: this.api.name }),
          validationValue: this.api.name,
          warning: this.t('danger.detachWarning'),
        },
        role: 'alertdialog',
        id: 'apiDetachDialog',
      })
      .afterClosed()
      .pipe(
        filter(confirm => confirm === true),
        switchMap(() => this.apiService.detach(this.api.id)),
        catchError(({ error }) => {
          this.snackBarService.error(error.message);
          return EMPTY;
        }),
        tap(() => this.reloadDetails.emit()),
        map(() => this.snackBarService.success(this.t('danger.detached'))),
        takeUntil(this.unsubscribe$),
      )
      .subscribe();
  }

  private updateOriginContextState(): void {
    this.isReadOnly = this.api?.originContext?.origin === 'KUBERNETES';
    this.canDetach = this.api?.originContext?.origin === 'KUBERNETES';
  }

  private canChangeApiLifecycle(api: Api): boolean {
    if (this.api.definitionVersion === 'FEDERATED_AGENT') {
      return false;
    } else if (this.constants.env?.settings?.apiReview?.enabled) {
      return !api.workflowState || api.workflowState === 'REVIEW_OK';
    } else {
      return api.lifecycleState === 'CREATED' || api.lifecycleState === 'PUBLISHED' || api.lifecycleState === 'UNPUBLISHED';
    }
  }

  public onRequestUpgrade() {
    if ((this.api as ApiV4).type === 'LLM_PROXY') {
      this.licenseService.openDialog(this.llmLicenseOptions);
    } else {
      this.licenseService.openDialog(this.licenseOptions);
    }
  }
}
