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
import { Component, computed, inject, signal } from '@angular/core';
import { LanguageService } from '../../../shared/i18n/language.service';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { PortalNavigationItem } from '../../../entities/management-api-v2';

export interface PublishNavigationItemDialogData {
  navItem: PortalNavigationItem;
}

export interface PublishNavigationItemDialogResult {
  confirmed: true;
  propagatePublishToChildren: boolean;
}

interface PublishNavigationItemDialogFormControls {
  propagatePublishToChildren: FormControl<boolean>;
}

type PublishNavigationItemDialogForm = FormGroup<PublishNavigationItemDialogFormControls>;

@Component({
  selector: 'publish-navigation-item-dialog',
  imports: [MatDialogModule, ReactiveFormsModule, MatButtonModule, MatCheckboxModule, TranslatePipe],
  templateUrl: './publish-navigation-item-dialog.component.html',
  styleUrls: ['./publish-navigation-item-dialog.component.scss'],
})
export class PublishNavigationItemDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<PublishNavigationItemDialogComponent, PublishNavigationItemDialogResult>);
  private readonly data: PublishNavigationItemDialogData = inject(MAT_DIALOG_DATA);
  private readonly languageService = inject(LanguageService);

  private readonly navItem = signal(this.data.navItem);
  readonly form: PublishNavigationItemDialogForm = new FormGroup<PublishNavigationItemDialogFormControls>({
    propagatePublishToChildren: new FormControl(false, { nonNullable: true }),
  });

  readonly isContainer = computed(() => this.navItem().type === 'FOLDER' || this.navItem().type === 'API');
  readonly typeLabel = computed(() => {
    this.languageService.currentLanguage();
    return this.navItem().type === 'API'
      ? 'API'
      : this.languageService.translate(`developerPortal.section.${this.navItem().type.toLowerCase()}`);
  });
  readonly isPublishing = computed(() => !this.navItem().published);
  readonly action = computed(() => {
    this.languageService.currentLanguage();
    return this.languageService.translate(this.isPublishing() ? 'developerPortal.common.publish' : 'developerPortal.common.unpublish');
  });
  readonly showPropagationCheckbox = computed(() => this.isPublishing() && this.isContainer());
  readonly title = computed(() =>
    this.languageService.translate('developerPortal.publish.title', {
      action: this.action(),
      name: this.navItem().title,
      type: this.typeLabel(),
    }),
  );
  readonly pastAction = computed(() => {
    this.languageService.currentLanguage();
    return this.languageService.translate(this.isPublishing() ? 'developerPortal.publish.published' : 'developerPortal.publish.unpublished');
  });
  readonly contentScope = computed(() => {
    this.languageService.currentLanguage();
    return this.languageService.translate(this.isContainer() ? 'developerPortal.publish.contentScope' : 'developerPortal.publish.space');
  });
  readonly propagatedItemsLabel = computed(() => {
    this.languageService.currentLanguage();
    return this.languageService.translate(
      this.navItem().type === 'FOLDER' ? 'developerPortal.publish.nestedDocsAndApis' : 'developerPortal.publish.nestedDocs',
    );
  });
  readonly propagationCheckboxLabel = computed(() =>
    this.languageService.translate('developerPortal.publish.alsoPublish', { items: this.propagatedItemsLabel() }),
  );
  readonly warning = computed(() => {
    if (!this.isContainer()) {
      return '';
    }
    return this.languageService.translate(
      this.isPublishing() ? 'developerPortal.publish.publishWarning' : 'developerPortal.publish.unpublishWarning',
      { type: this.typeLabel(), items: this.propagatedItemsLabel() },
    );
  });
  readonly messageWithPropagation = computed(() =>
    this.languageService.translate('developerPortal.publish.withPropagation', { type: this.typeLabel(), past: this.pastAction() }),
  );
  readonly messageWithoutPropagation = computed(() =>
    this.languageService.translate('developerPortal.publish.withoutPropagation', {
      type: this.typeLabel(),
      scope: this.contentScope(),
      past: this.pastAction(),
      warning: this.warning(),
    }),
  );
  readonly message = computed(() => (this.showPropagationCheckbox() ? this.messageWithPropagation() : this.messageWithoutPropagation()));

  onConfirm(): void {
    this.dialogRef.close({
      confirmed: true,
      propagatePublishToChildren: this.showPropagationCheckbox() ? this.form.controls.propagatePublishToChildren.value : false,
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
