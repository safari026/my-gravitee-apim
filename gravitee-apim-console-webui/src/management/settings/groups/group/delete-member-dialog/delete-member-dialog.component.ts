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
import { Component, computed, effect, Inject, inject, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { Observable, of, startWith } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { MatListModule } from '@angular/material/list';
import { MatChip, MatChipRemove, MatChipSet } from '@angular/material/chips';
import { GioBannerModule } from '@gravitee/ui-particles-angular';

import { GroupMembership, GroupMembershipMemberRoleEntity } from '../../../../../entities/group/groupMember';
import { Member, RoleName } from '../membershipState';
import { UsersService } from '../../../../../services-ngx/users.service';
import { DeleteMemberDialogData } from '../group.component';
import { LanguageService } from '../../../../../shared/i18n/language.service';
import { TranslatePipe } from '../../../../../shared/i18n/translate.pipe';

@Component({
  selector: 'delete-member-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatAutocompleteModule,
    MatInputModule,
    MatListModule,
    MatChip,
    MatChipRemove,
    MatChipSet,
    GioBannerModule,
    TranslatePipe,
  ],
  templateUrl: './delete-member-dialog.component.html',
  styleUrl: './delete-member-dialog.component.scss',
})
export class DeleteMemberDialogComponent implements OnInit {
  member: Member = null;
  filteredMembers$: Observable<Member[]> = of([]);
  newPrimaryOwner: Member = null;
  deleteMemberForm: FormGroup<{
    searchTerm: FormControl<string>;
  }>;
  ownershipTransferMessage: string = null;
  disableSubmit = false;
  readonly primaryOwnerScopes = signal<('API' | 'API_PRODUCT')[]>([]);
  readonly isPrimaryOwner = computed(() => this.primaryOwnerScopes().length > 0);

  private members: Member[] = [];
  private primaryOwnerMembership: GroupMembership = null;
  private readonly languageService = inject(LanguageService);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DeleteMemberDialogData,
    private usersService: UsersService,
    private matDialogRef: MatDialogRef<DeleteMemberDialogComponent>,
  ) {
    effect(() => {
      this.languageService.currentLanguage();
      if (this.newPrimaryOwner) {
        this.ownershipTransferMessage = this.buildOwnershipTransferMessage();
      }
    });
  }

  ngOnInit(): void {
    this.initializeDataFromInput();
    this.initializeForm();
    this.initializeFilterFn();
  }

  private initializeDataFromInput() {
    this.member = this.data.member;
    this.members = this.data.members;
    this.primaryOwnerScopes.set(
      (['API', 'API_PRODUCT'] as ('API' | 'API_PRODUCT')[]).filter(scope => this.member.roles[scope] === RoleName.PRIMARY_OWNER),
    );
  }

  private initializeForm() {
    this.deleteMemberForm = new FormGroup({
      searchTerm: new FormControl<string>({ value: '', disabled: true }),
    });

    if (this.isPrimaryOwner()) {
      this.deleteMemberForm.controls.searchTerm.enable();
      this.deleteMemberForm.controls.searchTerm.addValidators(Validators.required);
      this.disableSubmit = true;
    }
  }

  private initializeFilterFn() {
    this.filteredMembers$ = this.deleteMemberForm.controls.searchTerm.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      map(searchTerm => this.filterMembers(searchTerm)),
    );
  }

  private filterMembers(searchTerm: string): Member[] {
    if (!searchTerm.trim()) {
      return [];
    }

    const filterValue = searchTerm.toLowerCase();
    return this.members.filter(member => member.displayName.toLowerCase().includes(filterValue) && member.id !== this.member.id);
  }

  submit(): void {
    this.matDialogRef.close({ primaryOwnerMembership: this.primaryOwnerMembership, shouldDelete: true });
  }

  selectPrimaryOwner($event: MatAutocompleteSelectedEvent) {
    this.newPrimaryOwner = $event.option.value;
    this.deleteMemberForm.controls.searchTerm.setValue('');
    this.deleteMemberForm.controls.searchTerm.disable();
    this.deleteMemberForm.controls.searchTerm.removeValidators(Validators.required);
    this.ownershipTransferMessage = this.buildOwnershipTransferMessage();
    this.mapGroupMembership();
    this.disableSubmit = false;
  }

  deselectPrimaryOwner() {
    this.newPrimaryOwner = null;
    this.ownershipTransferMessage = null;
    this.primaryOwnerMembership = null;
    this.deleteMemberForm.controls.searchTerm.setValue('');
    this.deleteMemberForm.controls.searchTerm.enable();
    this.deleteMemberForm.controls.searchTerm.addValidators(Validators.required);
    this.disableSubmit = true;
  }

  private buildOwnershipTransferMessage(): string {
    const scopes = this.primaryOwnerScopes();
    const scopesLabel =
      scopes.length === 2
        ? this.languageService.translate('settings.groups.scopeBoth')
        : this.languageService.translate(scopes[0] === 'API' ? 'settings.groups.scopeApi' : 'settings.groups.scopeApiProduct');
    return this.languageService.translate('settings.groups.ownershipDeleteTransfer', {
      owner: this.member.displayName,
      scopes: scopesLabel,
      successor: this.newPrimaryOwner.displayName,
    });
  }

  private mapGroupMembership() {
    this.usersService.search(this.newPrimaryOwner.displayName).subscribe({
      next: response => {
        const reference = response.find(user => user.id === this.newPrimaryOwner.id).reference;
        const roles: GroupMembershipMemberRoleEntity[] = [];
        for (const [scope, name] of Object.entries(this.newPrimaryOwner.roles)) {
          if (name) {
            roles.push({ name, scope: scope as GroupMembershipMemberRoleEntity['scope'] });
          }
        }
        for (const scope of this.primaryOwnerScopes()) {
          const existing = roles.find(role => role.scope === scope);
          if (existing) {
            existing.name = RoleName.PRIMARY_OWNER;
          } else {
            roles.push({ name: RoleName.PRIMARY_OWNER, scope });
          }
        }
        this.primaryOwnerMembership = {
          id: this.newPrimaryOwner.id,
          reference: reference,
          roles,
        };
      },
    });
  }
}
