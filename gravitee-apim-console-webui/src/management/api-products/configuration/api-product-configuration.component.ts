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

import { Component, computed, DestroyRef, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, merge, of, Subject } from 'rxjs';
import { catchError, filter, map, switchMap, tap } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import {
  GIO_DIALOG_WIDTH,
  GioConfirmAndValidateDialogComponent,
  GioConfirmAndValidateDialogData,
  GioConfirmDialogComponent,
  GioConfirmDialogData,
  GioFormFocusInvalidModule,
  GioSaveBarModule,
} from '@gravitee/ui-particles-angular';

import { ApiProductDangerZoneComponent } from './danger-zone/api-product-danger-zone.component';

import { ApiProduct, UpdateApiProduct } from '../../../entities/management-api-v2/api-product';
import { ApiProductV2Service } from '../../../services-ngx/api-product-v2.service';
import { SnackBarService } from '../../../services-ngx/snack-bar.service';
import { GioPermissionService } from '../../../shared/components/gio-permission/gio-permission.service';
import { apiProductNameUniqueAsyncValidator } from '../validators/api-product-name-unique-async.validator';
import { LanguageService } from '../../../shared/i18n/language.service';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';

interface ConfigForm {
  name: FormControl<string>;
  version: FormControl<string>;
  description: FormControl<string>;
}

@Component({
  selector: 'api-product-configuration',
  templateUrl: './api-product-configuration.component.html',
  styleUrls: ['./api-product-configuration.component.scss'],
  standalone: true,
  providers: [{ provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher }],
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    GioFormFocusInvalidModule,
    GioSaveBarModule,
    ApiProductDangerZoneComponent,
    TranslatePipe,
  ],
})
export class ApiProductConfigurationComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly apiProductV2Service = inject(ApiProductV2Service);
  private readonly permissionService = inject(GioPermissionService);
  private readonly snackBarService = inject(SnackBarService);
  private readonly matDialog = inject(MatDialog);
  private readonly languageService = inject(LanguageService);

  protected readonly isReadOnly = !this.permissionService.hasAnyMatching(['api_product-definition-u']);
  protected readonly canDeleteApiProduct = this.permissionService.hasAnyMatching(['api_product-definition-d']);

  readonly nameMaxLength = 512;
  readonly versionMaxLength = 64;
  readonly form = this.buildForm();
  readonly initialFormValue = signal<Record<string, unknown> | null>(null);
  private readonly reload$ = new Subject<void>();
  private currentApiProduct: ApiProduct | null = null;

  private readonly apiProductId = toSignal(this.activatedRoute.params.pipe(map(p => p['apiProductId'] ?? null)), {
    initialValue: null as string | null,
  });

  private readonly fetchedProduct$ = merge(toObservable(this.apiProductId), this.reload$).pipe(
    switchMap(() => {
      const id = this.apiProductId();
      return id
        ? this.apiProductV2Service.get(id).pipe(
            catchError(error => {
              this.snackBarService.error(error.error?.message || this.languageService.translate('apiProducts.configuration.loadError'));
              return of(null);
            }),
          )
        : of(null);
    }),
  );

  readonly apiProduct = toSignal(this.fetchedProduct$, {
    initialValue: null as ApiProduct | null,
  });

  readonly apiIds = computed(() => this.apiProduct()?.apiIds ?? []);

  private readonly _formSync = effect(() => {
    const p = this.apiProduct();
    if (!p) return;

    this.currentApiProduct = p;
    this.form.reset({
      name: p.name ?? '',
      version: p.version ?? '',
      description: p.description ?? '',
    });
    if (this.isReadOnly) {
      this.form.disable({ emitEvent: false });
    } else {
      this.form.enable({ emitEvent: false });
    }
    this.initialFormValue.set(this.form.getRawValue());
  });

  onReloadDetails(): void {
    this.reload$.next();
  }

  onSubmit(): void {
    const product = this.apiProduct()!;
    const { name, version, description } = this.form.getRawValue();
    const updateApiProduct: UpdateApiProduct = {
      name: name?.trim() || '',
      version: version?.trim() || '',
      description: description?.trim() || undefined,
      apiIds: product?.apiIds,
    };

    this.apiProductV2Service
      .update(product.id, updateApiProduct)
      .pipe(
        tap(() => {
          this.apiProductV2Service.notifyApiProductChanged();
          this.initialFormValue.set(this.form.getRawValue());
          this.snackBarService.success(this.languageService.translate('apiProducts.configuration.saved'));
          this.onReloadDetails();
        }),
        catchError(error => {
          this.snackBarService.error(error.error?.message || error.message || this.languageService.translate('apiProducts.configuration.updateError'));
          return EMPTY;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  onReset(): void {
    const initial = this.initialFormValue();
    if (!initial) return;

    this.form.reset(initial);
  }

  onRemoveApis(): void {
    const apiProductId = this.apiProduct()?.id;
    if (!apiProductId) return;

    this.matDialog
      .open<GioConfirmDialogComponent, GioConfirmDialogData, boolean>(GioConfirmDialogComponent, {
        width: GIO_DIALOG_WIDTH.SMALL,
        data: {
          title: this.languageService.translate('apiProducts.danger.removeApisTitle'),
          content: this.languageService.translate('apiProducts.danger.removeApisContent'),
          confirmButton: this.languageService.translate('apiProducts.danger.removeApisConfirm'),
        },
        role: 'alertdialog',
        id: 'removeApisDialog',
      })
      .afterClosed()
      .pipe(
        filter((confirm): confirm is true => confirm === true),
        switchMap(() => this.apiProductV2Service.updateApiProductApis(apiProductId, [])),
        tap(() => {
          this.apiProductV2Service.notifyApiProductChanged();
          this.snackBarService.success(this.languageService.translate('apiProducts.danger.removeApisSuccess'));
          this.onReloadDetails();
        }),
        catchError(error => {
          this.snackBarService.error(error?.error?.message || error?.message || this.languageService.translate('apiProducts.danger.removeApisError'));
          return EMPTY;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  onDeleteApiProduct(): void {
    const product = this.apiProduct();
    const apiProductId = product?.id;
    if (!apiProductId) return;

    this.matDialog
      .open<GioConfirmAndValidateDialogComponent, GioConfirmAndValidateDialogData, boolean>(GioConfirmAndValidateDialogComponent, {
        width: GIO_DIALOG_WIDTH.MEDIUM,
        data: {
          title: this.languageService.translate('apiProducts.danger.deleteTitle'),
          content: this.languageService.translate('apiProducts.danger.deleteContent'),
          confirmButton: this.languageService.translate('apiProducts.danger.deleteConfirm'),
          validationMessage: this.languageService.translate('apiProducts.danger.deleteValidation', { name: product.name }),
          validationValue: product.name,
          warning: this.languageService.translate('apiProducts.danger.deleteWarning'),
        },
        role: 'alertdialog',
        id: 'deleteApiProductDialog',
      })
      .afterClosed()
      .pipe(
        filter((confirm): confirm is true => confirm === true),
        switchMap(() => this.apiProductV2Service.delete(apiProductId)),
        tap(() => {
          this.snackBarService.success(this.languageService.translate('apiProducts.danger.deleteSuccess'));
          this.router.navigate(['../../'], { relativeTo: this.activatedRoute });
        }),
        catchError(error => {
          this.snackBarService.error(error?.error?.message || error?.message || this.languageService.translate('apiProducts.danger.deleteError'));
          return EMPTY;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  onDeleteApi(apiId: string): void {
    const apiProductId = this.apiProduct()?.id;
    if (!apiProductId) return;

    this.matDialog
      .open<GioConfirmDialogComponent, GioConfirmDialogData, boolean>(GioConfirmDialogComponent, {
        width: GIO_DIALOG_WIDTH.SMALL,
        data: {
          title: this.languageService.translate('apiProducts.danger.removeApiTitle'),
          content: this.languageService.translate('apiProducts.danger.removeApiContent'),
          confirmButton: this.languageService.translate('apiProducts.danger.removeApiConfirm'),
        },
        role: 'alertdialog',
      })
      .afterClosed()
      .pipe(
        filter((confirm): confirm is true => confirm === true),
        switchMap(() => this.apiProductV2Service.deleteApiFromApiProduct(apiProductId, apiId)),
        tap(() => {
          this.snackBarService.success(this.languageService.translate('apiProducts.danger.removeApiSuccess'));
          this.onReloadDetails();
        }),
        catchError(error => {
          this.snackBarService.error(error.error?.message || this.languageService.translate('apiProducts.danger.removeApiError'));
          return EMPTY;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  private buildForm(): FormGroup<ConfigForm> {
    return new FormGroup<ConfigForm>({
      name: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(this.nameMaxLength), Validators.minLength(1)],
        asyncValidators: [apiProductNameUniqueAsyncValidator(this.apiProductV2Service, () => this.currentApiProduct?.name)],
      }),
      version: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(this.versionMaxLength), Validators.minLength(1)],
      }),
      description: new FormControl('', { nonNullable: true }),
    });
  }
}
