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
import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, Subject } from 'rxjs';
import { filter, switchMap, takeUntil, tap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { GioConfirmDialogComponent, GioConfirmDialogData } from '@gravitee/ui-particles-angular';

import { IdentityProviderService } from '../../../services-ngx/identity-provider.service';
import { IdentityProviderListItem, IdentityProviderActivation } from '../../../entities/identity-provider';
import { ConsoleSettingsService } from '../../../services-ngx/console-settings.service';
import { ConsoleSettings } from '../../../entities/consoleSettings';
import { SnackBarService } from '../../../services-ngx/snack-bar.service';
import { OrganizationService } from '../../../services-ngx/organization.service';
import { GioTableWrapperFilters } from '../../../shared/components/gio-table-wrapper/gio-table-wrapper.component';
import { gioTableFilterCollection } from '../../../shared/components/gio-table-wrapper/gio-table-wrapper.util';
import { LanguageService } from '../../../shared/i18n/language.service';

type TableData = {
  logo: string;
  id: string;
  name: string;
  description: string;
  availableOnPortal: boolean;
  activated: boolean;
  sync: boolean;
  updatedAt: number;
};

@Component({
  selector: 'org-settings-identity-providers',
  styleUrls: ['./org-settings-identity-providers.component.scss'],
  templateUrl: './org-settings-identity-providers.component.html',
  standalone: false,
})
export class OrgSettingsIdentityProvidersComponent implements OnInit, OnDestroy {

  displayedColumns: string[] = ['logo', 'id', 'name', 'description', 'activated', 'sync', 'availableOnPortal', 'updatedAt', 'actions'];
  tableData: TableData[] = [];
  filteredTableData: TableData[] = [];
  tableUnpaginatedLength = 0;

  consoleSettings: ConsoleSettings;

  private unsubscribe$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private readonly identityProviderService: IdentityProviderService,
    private readonly consoleSettingsService: ConsoleSettingsService,
    private readonly organizationService: OrganizationService,
    private readonly snackBarService: SnackBarService,
    private readonly matDialog: MatDialog,
    private readonly languageService: LanguageService,
  ) {}

  ngOnInit() {
    combineLatest([
      this.identityProviderService.list(),
      this.consoleSettingsService.get(),
      this.organizationService.listActivatedIdentityProviders(),
    ])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(([identityProviders, consoleSettings, activatedIdentityProviders]) => {
        this.setDataSourceFromIdentityProviders(identityProviders, activatedIdentityProviders);
        this.consoleSettings = consoleSettings;
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next(true);
    this.unsubscribe$.unsubscribe();
  }

  onFiltersChanged(filters: GioTableWrapperFilters) {
    const filtered = gioTableFilterCollection(this.tableData, filters);
    this.filteredTableData = filtered.filteredCollection;
    this.tableUnpaginatedLength = filtered.unpaginatedLength;
  }

  onDeleteActionClicked(identityProvider: TableData) {
    this.matDialog
      .open<GioConfirmDialogComponent, GioConfirmDialogData>(GioConfirmDialogComponent, {
        width: '500px',
        data: {
          title: this.languageService.translate('settings.organization.identityProviders.deleteTitle'),
          content: this.languageService.translate('settings.organization.identityProviders.deleteContent', {
            name: identityProvider.name,
          }),
          confirmButton: this.languageService.translate('common.delete'),
        },
        role: 'alertdialog',
        id: 'deleteIdentityProviderConfirmDialog',
      })
      .afterClosed()
      .pipe(
        filter(confirm => confirm === true),
        switchMap(() => this.identityProviderService.delete(identityProvider.id)),
        tap(() =>
          this.snackBarService.success(
            this.languageService.translate('settings.organization.identityProviders.deleted', { name: identityProvider.name }),
          ),
        ),

        takeUntil(this.unsubscribe$),
      )
      .subscribe(() => this.ngOnInit());
  }

  onActivationToggleActionClicked(identityProvider: TableData) {
    this.matDialog
      .open<GioConfirmDialogComponent, GioConfirmDialogData>(GioConfirmDialogComponent, {
        width: '500px',
        data: {
          title: this.languageService.translate(
            identityProvider.activated
              ? 'settings.organization.identityProviders.deactivateTitle'
              : 'settings.organization.identityProviders.activateTitle',
          ),
          content: this.languageService.translate('settings.organization.identityProviders.toggleContent', {
            action: this.languageService.translate(
              identityProvider.activated
                ? 'settings.organization.identityProviders.deactivateAction'
                : 'settings.organization.identityProviders.activateAction',
            ),
            name: identityProvider.name,
          }),
          confirmButton: this.languageService.translate('settings.organization.shared.ok'),
        },
        role: 'alertdialog',
        id: 'deleteIdentityProviderConfirmDialog',
      })
      .afterClosed()
      .pipe(
        filter(confirm => confirm === true),
        switchMap(() => {
          const idp = this.tableData.find(idp => idp.id === identityProvider.id);
          idp.activated = !idp.activated;

          const activatedIdps = this.tableData.filter(idp => idp.activated === true).map(idp => ({ identityProvider: idp.id }));
          return this.organizationService.updateActivatedIdentityProviders(activatedIdps);
        }),
        tap(() =>
          this.snackBarService.success(
            this.languageService.translate(
              identityProvider.activated
                ? 'settings.organization.identityProviders.activatedSuccess'
                : 'settings.organization.identityProviders.deactivatedSuccess',
              { name: identityProvider.name },
            ),
          ),
        ),
        takeUntil(this.unsubscribe$),
      )
      .subscribe(() => this.ngOnInit());
  }

  updateLocalLogin(shouldActivateLoginForm: boolean): void {
    this.consoleSettingsService
      .save({
        ...this.consoleSettings,
        authentication: {
          ...this.consoleSettings.authentication,
          localLogin: {
            enabled: shouldActivateLoginForm,
          },
        },
      })
      .pipe(
        tap(() =>
          this.snackBarService.success(this.languageService.translate('settings.organization.identityProviders.configUpdated')),
        ),
        takeUntil(this.unsubscribe$),
      )
      .subscribe(updatedConsoleSettings => {
        this.consoleSettings = updatedConsoleSettings;
      });
  }

  isReadonlySetting(property: string): boolean {
    return ConsoleSettingsService.isReadonly(this.consoleSettings, property);
  }

  hasActivatedIdp(): boolean {
    return this.tableData.some(idp => idp.activated);
  }

  private setDataSourceFromIdentityProviders(
    identityProviders: IdentityProviderListItem[],
    activatedIdentityProviders: IdentityProviderActivation[],
  ) {
    const matTableData = identityProviders
      .map(idp => ({
        logo: `assets/logo_${idp.type.toLowerCase()}-idp.svg`,
        id: idp.id,
        name: idp.name,
        description: idp.description,
        availableOnPortal: idp.enabled,
        activated: activatedIdentityProviders.some(activatedIdp => activatedIdp.identityProvider === idp.id),
        sync: idp.sync,
        updatedAt: idp.updated_at,
      }))
      // Use a custom sort to always have Gravitee AM first
      .sort((idpA, idpB) => {
        if (idpA.id === 'gravitee-am') {
          return -1;
        } else if (idpB.id === 'gravitee-am') {
          return 1;
        }
        return idpA.id.localeCompare(idpB.id);
      });

    this.tableData = matTableData;
    this.filteredTableData = matTableData;
    this.tableUnpaginatedLength = matTableData.length;
  }

  getLocalLoginTooltipMessage(): string | null {
    if (this.isReadonlySetting('console.authentication.localLogin.enabled')) {
      return this.languageService.translate('settings.systemConfig');
    }
    if (!this.hasActivatedIdp()) {
      return this.languageService.translate('settings.organization.identityProviders.localLoginRequiresIdp');
    }
    return null;
  }
}
