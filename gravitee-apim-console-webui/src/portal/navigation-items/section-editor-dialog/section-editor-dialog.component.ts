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
import { Component, computed, DestroyRef, HostListener, inject, Injector, OnInit, Signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { skip } from 'rxjs/operators';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconRegistry } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { LowerCasePipe } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { GioBannerModule, GioFormSelectionInlineModule } from '@gravitee/ui-particles-angular';
import { isEqual } from 'lodash';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Observable, of } from 'rxjs';

import {
  PortalNavigationApi,
  PortalNavigationItem,
  PortalNavigationItemType,
  PortalNavigationLink,
  PortalPageContentType,
  PortalVisibility,
} from '../../../entities/management-api-v2';
import { ApiV2Service } from '../../../services-ngx/api-v2.service';
import { urlValidator } from '../../../shared/validators/url.validator';
import { isPublicVisibilityDisabled } from '../visibility-toggle.util';
import { LanguageService } from '../../../shared/i18n/language.service';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';

export type SectionEditorDialogMode = 'create' | 'edit';

export type SectionEditorDialogItemType = Exclude<PortalNavigationItemType, 'API'>;

interface SectionEditorDialogCreateData {
  mode: 'create';
  type: SectionEditorDialogItemType;
  parentItem?: PortalNavigationItem;
}

interface SectionEditorDialogEditData {
  mode: 'edit';
  type: PortalNavigationItemType;
  existingItem: PortalNavigationItem;
  parentItem?: PortalNavigationItem;
}

export type SectionEditorDialogData = SectionEditorDialogCreateData | SectionEditorDialogEditData;

export interface SectionEditorDialogResult {
  title: string;
  visibility: PortalVisibility;
  url?: string;
  contentType?: PortalPageContentType;
}

export interface PortalPageTypeOption {
  value: PortalPageContentType;
  label: string;
  icon: string;
  available: boolean;
}

export const PORTAL_PAGE_CONTENT_TYPE_OPTIONS: PortalPageTypeOption[] = [
  { value: 'GRAVITEE_MARKDOWN', label: 'Markdown', icon: 'gio:gravitee', available: true },
  { value: 'OPENAPI', label: 'OpenAPI', icon: 'gio:open-api', available: true },
  { value: 'ASYNCAPI', label: 'AsyncAPI', icon: 'gio:async-api', available: true },
];

const TITLE_FIELD_LABEL_KEY: Record<PortalNavigationItemType, string> = {
  API: 'developerPortal.section.apiDisplayName',
  FOLDER: 'developerPortal.section.folderTitle',
  LINK: 'developerPortal.section.linkTitle',
  PAGE: 'developerPortal.section.pageTitle',
};

const PAGE_TYPE_LABEL_KEY: Record<PortalPageContentType, string> = {
  GRAVITEE_MARKDOWN: 'developerPortal.section.markdown',
  OPENAPI: 'developerPortal.section.openapi',
  ASYNCAPI: 'developerPortal.section.asyncapi',
};

interface SectionFormControls {
  title: FormControl<string>;
  isPrivate: FormControl<boolean>;
  url?: FormControl<string>; // Optional for 'LINK' type
  contentType?: FormControl<PortalPageContentType>; // Optional for 'PAGE' create only
}

interface SectionFormValues {
  title: string;
  isPrivate: boolean;
  url?: string;
  contentType?: PortalPageContentType;
}

type SectionForm = FormGroup<SectionFormControls>;

@Component({
  selector: 'section-editor-dialog',
  imports: [
    MatDialogModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatInputModule,
    GioBannerModule,
    GioFormSelectionInlineModule,
    LowerCasePipe,
    MatTooltipModule,
    TranslatePipe,
  ],
  templateUrl: './section-editor-dialog.component.html',
  styleUrls: ['./section-editor-dialog.component.scss'],
})
export class SectionEditorDialogComponent implements OnInit {
  form: SectionForm = new FormGroup<SectionFormControls>({
    title: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
    isPrivate: new FormControl(false),
  });
  public initialFormValues: SectionFormValues;

  public type: PortalNavigationItemType;
  public mode: SectionEditorDialogMode;
  public title: string;
  public titleFieldLabel: string;
  readonly pageContentTypeOptions = PORTAL_PAGE_CONTENT_TYPE_OPTIONS.map(option => ({ ...option }));

  showPageTypeSelection(): boolean {
    return this.mode === 'create' && this.type === 'PAGE';
  }

  private readonly dialogRef = inject(MatDialogRef<SectionEditorDialogComponent, SectionEditorDialogResult>);
  private readonly data: SectionEditorDialogData = inject(MAT_DIALOG_DATA);
  private readonly iconRegistry = inject(MatIconRegistry);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly apiService = inject(ApiV2Service);
  private readonly languageService = inject(LanguageService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  readonly publicDisabled: Signal<boolean> = computed(() => {
    return isPublicVisibilityDisabled(this.data.parentItem);
  });
  readonly publicDisabledTooltip: Signal<string> = computed(() => {
    this.languageService.currentLanguage();
    if (!isPublicVisibilityDisabled(this.data.parentItem)) {
      return '';
    }
    return this.languageService.translate('developerPortal.section.privateParent', {
      type: this.data.parentItem?.type.toLocaleLowerCase() ?? '',
    });
  });
  readonly linkedApiName: Signal<string | null> = toSignal(this.loadLinkedApiName(), { initialValue: null });
  public buttonTitle: string;

  constructor() {
    this.iconRegistry.addSvgIconInNamespace('gio', 'async-api', this.sanitizer.bypassSecurityTrustResourceUrl('assets/logo_asyncapi.svg'));
    this.type = this.data.type;
    this.mode = this.data.mode;
    this.refreshLabels();
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: BeforeUnloadEvent) {
    if (!this.formIsUnchanged()) {
      event.preventDefault();
      event.returnValue = '';
      return '';
    }
  }

  ngOnInit(): void {
    toObservable(this.languageService.currentLanguage, { injector: this.injector })
      .pipe(skip(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.refreshLabels());
    this.addTypeSpecificControls();
    this.prefillExistingItem();
    this.syncVisibilityControlState();

    this.initialFormValues = this.form.getRawValue();
  }

  private refreshLabels(): void {
    const type = this.languageService.translate(`developerPortal.section.${this.type.toLowerCase()}`);
    this.titleFieldLabel = this.languageService.translate(TITLE_FIELD_LABEL_KEY[this.type]);
    this.pageContentTypeOptions.forEach(option => {
      option.label = this.languageService.translate(PAGE_TYPE_LABEL_KEY[option.value]);
    });
    if (this.data.mode === 'create') {
      this.title = this.languageService.translate('developerPortal.section.addTitle', { type });
      this.buttonTitle = this.languageService.translate('common.add');
    } else {
      this.title = this.languageService.translate('developerPortal.section.editTitle', {
        name: this.data.existingItem.title,
        type,
      });
      this.buttonTitle = this.languageService.translate('common.save');
    }
  }

  private syncVisibilityControlState(): void {
    const isPrivateControl = this.form.controls.isPrivate;

    if (this.publicDisabled()) {
      isPrivateControl.setValue(true, { emitEvent: false });
      isPrivateControl.disable({ emitEvent: false });
      return;
    }

    isPrivateControl.enable({ emitEvent: false });
  }

  private addTypeSpecificControls(): void {
    if (this.type === 'LINK') {
      this.form.addControl(
        'url',
        new FormControl<string>('', {
          validators: [Validators.required, urlValidator()],
          nonNullable: true,
        }),
      );
    }
    if (this.showPageTypeSelection()) {
      this.form.addControl('contentType', new FormControl<PortalPageContentType>('GRAVITEE_MARKDOWN', { nonNullable: true }));
    }
  }

  private prefillExistingItem(): void {
    if (this.data.mode === 'edit') {
      this.form.patchValue({
        ...(this.data.existingItem.type === 'LINK' ? { url: (this.data.existingItem as PortalNavigationLink).url } : {}),
        title: this.data.existingItem.title,
        isPrivate: this.data.existingItem.visibility === 'PRIVATE',
      });
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      const formValues = this.form.getRawValue();

      this.dialogRef.close({
        title: formValues.title,
        visibility: formValues.isPrivate ? 'PRIVATE' : 'PUBLIC',
        ...(this.type === 'LINK' ? { url: formValues.url! } : {}),
        ...(this.showPageTypeSelection() && formValues.contentType ? { contentType: formValues.contentType } : {}),
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  formIsUnchanged(): boolean {
    return isEqual(this.form.getRawValue(), this.initialFormValues);
  }

  private loadLinkedApiName(): Observable<string | null> {
    if (this.data.mode !== 'edit' || this.data.type !== 'API') {
      return of(null);
    }

    const apiId = (this.data.existingItem as PortalNavigationApi).apiId;
    return this.apiService.resolveNameById(apiId);
  }
}
