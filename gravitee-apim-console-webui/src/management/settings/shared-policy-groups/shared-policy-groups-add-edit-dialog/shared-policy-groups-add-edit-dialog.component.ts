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
import { ChangeDetectorRef, Component, DestroyRef, inject, Inject, Injector } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { CommonModule } from '@angular/common';
import { GioFormFocusInvalidModule } from '@gravitee/ui-particles-angular';
import { map, skip, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { ApiV4, SharedPolicyGroup, FlowPhase } from '../../../../entities/management-api-v2';
import { LanguageService } from '../../../../shared/i18n/language.service';
import { TranslatePipe } from '../../../../shared/i18n/translate.pipe';

export type SharedPolicyGroupAddEditDialogData =
  | {
      apiType: ApiV4['type'];
    }
  | {
      sharedPolicyGroup: SharedPolicyGroup;
    };

export type SharedPolicyGroupAddEditDialogResult =
  | undefined
  | { name: string; description?: string; prerequisiteMessage?: string; phase: FlowPhase };

const PHASE_BY_API_TYPE: Record<ApiV4['type'], FlowPhase[]> = {
  PROXY: ['REQUEST', 'RESPONSE'],
  A2A_PROXY: ['REQUEST', 'RESPONSE'],
  LLM_PROXY: ['REQUEST', 'RESPONSE'],
  MCP_PROXY: ['REQUEST', 'RESPONSE'],
  MESSAGE: ['REQUEST', 'RESPONSE', 'PUBLISH', 'SUBSCRIBE'],
  NATIVE: ['PUBLISH', 'SUBSCRIBE', 'ENTRYPOINT_CONNECT', 'INTERACT'],
};

@Component({
  selector: 'shared-policy-groups-add-edit-dialog',
  templateUrl: './shared-policy-groups-add-edit-dialog.component.html',
  styleUrls: ['./shared-policy-groups-add-edit-dialog.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInput,
    MatButtonToggleModule,
    GioFormFocusInvalidModule,
    TranslatePipe,
  ],
})
export class SharedPolicyGroupsAddEditDialogComponent {
  private readonly languageService = inject(LanguageService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly apiType: ApiV4['type'];

  protected apiTypeLabel: string;

  protected formGroup: FormGroup<{
    name: FormControl<string>;
    description: FormControl<string>;
    prerequisiteMessage: FormControl<string>;
    phase: FormControl<FlowPhase>;
  }>;
  protected isValid$: Observable<boolean>;

  protected phases: { name: string; value: FlowPhase }[];
  protected isEdit: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: SharedPolicyGroupAddEditDialogData,
    public dialogRef: MatDialogRef<SharedPolicyGroupsAddEditDialogComponent, SharedPolicyGroupAddEditDialogResult>,
  ) {
    this.isEdit = isEdit(data);
    this.apiType = isEdit(data) ? data.sharedPolicyGroup.apiType : data.apiType;
    this.buildLabels();

    this.formGroup = new FormGroup({
      name: new FormControl(isEdit(data) ? data.sharedPolicyGroup.name : '', Validators.required),
      description: new FormControl(isEdit(data) ? data.sharedPolicyGroup.description : ''),
      prerequisiteMessage: new FormControl(isEdit(data) ? data.sharedPolicyGroup.prerequisiteMessage : ''),
      phase: new FormControl(
        isEdit(data) ? { disabled: true, value: data.sharedPolicyGroup.phase } : this.phases[0].value,
        Validators.required,
      ),
    });

    this.isValid$ = this.formGroup.statusChanges.pipe(
      startWith(this.formGroup.status),
      map(status => status === 'VALID'),
    );

    toObservable(this.languageService.currentLanguage, { injector: this.injector })
      .pipe(skip(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.buildLabels();
        this.changeDetectorRef.markForCheck();
      });
  }

  private buildLabels(): void {
    this.apiTypeLabel =
      this.apiType === 'MESSAGE'
        ? this.languageService.translate('settings.sharedPolicyGroups.messageApi')
        : this.languageService.translate('settings.sharedPolicyGroups.proxyApi');
    this.phases = PHASE_BY_API_TYPE[this.apiType].map(phase => ({
      name: this.languageService.translate(`settings.sharedPolicyGroups.phases.${phase}`),
      value: phase,
    }));
  }

  protected onSave(): void {
    if (this.formGroup.invalid) {
      return;
    }
    this.dialogRef.close({
      name: this.formGroup.get('name').value,
      description: this.formGroup.get('description').value,
      prerequisiteMessage: this.formGroup.get('prerequisiteMessage').value,
      phase: this.formGroup.get('phase').value,
    });
  }
}

const isEdit = (data: SharedPolicyGroupAddEditDialogData): data is { sharedPolicyGroup: SharedPolicyGroup } => 'sharedPolicyGroup' in data;
