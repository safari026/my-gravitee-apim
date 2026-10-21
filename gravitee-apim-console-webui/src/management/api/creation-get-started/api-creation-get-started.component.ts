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

import { Component, OnDestroy } from '@angular/core';
import { catchError, filter, switchMap, takeUntil, tap } from 'rxjs/operators';
import { EMPTY, Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';

import { PolicyService } from '../../../services-ngx/policy.service';
import { SnackBarService } from '../../../services-ngx/snack-bar.service';
import { GioApiImportDialogComponent, GioApiImportDialogData } from '../component/gio-api-import-dialog/gio-api-import-dialog.component';
import { LanguageService } from '../../../shared/i18n/language.service';

@Component({
  selector: 'api-creation-get-started',
  templateUrl: './api-creation-get-started.component.html',
  styleUrls: ['./api-creation-get-started.component.scss'],
  standalone: false,
})
export class ApiCreationGetStartedComponent implements OnDestroy {
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly policyService: PolicyService,
    private readonly snackBarService: SnackBarService,
    private readonly matDialog: MatDialog,
    private readonly languageService: LanguageService,
  ) {}

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.unsubscribe();
  }

  goToApiImport() {
    this.policyService
      .listSwaggerPolicies()
      .pipe(
        switchMap(policies =>
          this.matDialog
            .open<GioApiImportDialogComponent, GioApiImportDialogData>(GioApiImportDialogComponent, {
              data: {
                policies,
              },
              role: 'alertdialog',
              id: 'importApiDialog',
            })
            .afterClosed(),
        ),
        filter(apiId => !!apiId),
        tap(apiId => this.router.navigate(['..', apiId], { relativeTo: this.activatedRoute })),
        catchError(err => {
          this.snackBarService.error(err.error?.message ?? this.languageService.translate('apis.creation.importError'));
          return EMPTY;
        }),
        takeUntil(this.unsubscribe$),
      )
      .subscribe();
  }
}
