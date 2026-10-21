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

import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Subject, combineLatest, EMPTY, Observable } from 'rxjs';
import { catchError, filter, switchMap, takeUntil, tap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { GioConfirmDialogComponent, GioConfirmDialogData, GioLicenseService, LicenseOptions } from '@gravitee/ui-particles-angular';

import { RoleService } from '../../../services-ngx/role.service';
import { Role, RoleScope } from '../../../entities/role/role';
import { SnackBarService } from '../../../services-ngx/snack-bar.service';
import { Constants } from '../../../entities/Constants';
import { ApimFeature } from '../../../shared/components/gio-license/gio-license-data';
import { LanguageService } from '../../../shared/i18n/language.service';

interface RoleVM {
  name: string;
  description: string;
  isDefault: boolean;
  isSystem: boolean;
  isReadOnly: boolean;
  canBeDeleted: boolean;
  icon: string;
  hasUserRoleManagement: boolean;
}

@Component({
  selector: 'org-settings-roles',
  templateUrl: './org-settings-roles.component.html',
  styleUrls: ['./org-settings-roles.component.scss'],
  standalone: false,
})
export class OrgSettingsRolesComponent implements OnInit, OnDestroy {
  rolesByScope: Array<{ scope: string; scopeId: string; roles: RoleVM[] }>;
  loading = true;
  customRolesLicenseOptions: LicenseOptions = { feature: ApimFeature.APIM_CUSTOM_ROLES };
  hasCustomRolesLock$: Observable<boolean>;

  constructor(
    private readonly roleService: RoleService,
    private readonly matDialog: MatDialog,
    private readonly snackBarService: SnackBarService,
    @Inject(Constants) private readonly constants: Constants,
    private readonly licenseService: GioLicenseService,
    private readonly languageService: LanguageService,
  ) {}

  private readonly unsubscribe$ = new Subject<boolean>();

  ngOnInit(): void {
    this.hasCustomRolesLock$ = this.licenseService.isMissingFeature$(this.customRolesLicenseOptions.feature);
    combineLatest([
      this.roleService.list('ORGANIZATION'),
      this.roleService.list('ENVIRONMENT'),
      this.roleService.list('API'),
      this.roleService.list('APPLICATION'),
      this.roleService.list('INTEGRATION'),
      this.roleService.list('CLUSTER'),
      this.roleService.list('API_PRODUCT'),
    ])
      .pipe(
        tap(([orgRoles, envRoles, apiRoles, appRoles, integrationRoles, clusterRoles, apiProductRoles]) => {
          this.rolesByScope = [
            { scope: this.scopeLabel('ORGANIZATION'), scopeId: 'ORGANIZATION', roles: this.convertToRoleVMs(orgRoles) },
            { scope: this.scopeLabel('ENVIRONMENT'), scopeId: 'ENVIRONMENT', roles: this.convertToRoleVMs(envRoles) },
            { scope: this.scopeLabel('API'), scopeId: 'API', roles: this.convertToRoleVMs(apiRoles) },
            { scope: this.scopeLabel('APPLICATION'), scopeId: 'APPLICATION', roles: this.convertToRoleVMs(appRoles) },
            { scope: this.scopeLabel('INTEGRATION'), scopeId: 'INTEGRATION', roles: this.convertToRoleVMs(integrationRoles) },
            { scope: this.scopeLabel('CLUSTER'), scopeId: 'CLUSTER', roles: this.convertToRoleVMs(clusterRoles) },
            { scope: this.scopeLabel('API_PRODUCT'), scopeId: 'API_PRODUCT', roles: this.convertToRoleVMs(apiProductRoles) },
          ];
          this.loading = false;
        }),
        takeUntil(this.unsubscribe$),
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.unsubscribe$.next(true);
    this.unsubscribe$.unsubscribe();
  }

  onDeleteRoleClicked(scope: string, role: RoleVM) {
    this.matDialog
      .open<GioConfirmDialogComponent, GioConfirmDialogData, boolean>(GioConfirmDialogComponent, {
        width: '500px',
        data: {
          title: this.languageService.translate('settings.organization.roles.deleteTitle'),
          content: this.languageService.translate('settings.organization.roles.deleteContent', { name: role.name }),
          confirmButton: this.languageService.translate('common.delete'),
        },
        role: 'alertdialog',
        id: 'deleteRoleConfirmDialog',
      })
      .afterClosed()
      .pipe(
        filter(confirm => confirm === true),
        switchMap(() => this.roleService.delete(scope, role.name)),
        tap(() =>
          this.snackBarService.success(
            this.languageService.translate('settings.organization.roles.deleted', { name: role.name }),
          ),
        ),
        catchError(() => {
          this.snackBarService.error(
            this.languageService.translate('settings.organization.roles.deleteFailed', { name: role.name }),
          );
          return EMPTY;
        }),
        takeUntil(this.unsubscribe$),
      )
      .subscribe(() => this.ngOnInit());
  }

  private scopeLabel(scopeId: string): string {
    return this.languageService.translate(`settings.organization.roles.scopes.${scopeId}`);
  }

  private convertToRoleVMs(roles: Role[]): RoleVM[] {
    return roles.map(role => ({
      name: role.name,
      description: role.description,
      isDefault: role.default,
      isSystem: role.system,
      hasUserRoleManagement: role.scope === 'ORGANIZATION',
      canBeDeleted: !role.default && !role.system,
      isReadOnly: this.isReadOnly(role),
      icon: OrgSettingsRolesComponent.getScopeIcon(role.scope),
    }));
  }

  private isReadOnly(role: Role) {
    if (this.hasSystemRoleEditionEnabled()) {
      return role.scope === 'ORGANIZATION' && role.name === 'ADMIN';
    }
    return role.system;
  }

  private hasSystemRoleEditionEnabled(): boolean {
    return this.constants?.org?.settings?.management?.systemRoleEdition?.enabled;
  }

  private static getScopeIcon(scope: RoleScope): string {
    switch (scope) {
      case 'API':
        return 'dashboard';
      case 'APPLICATION':
        return 'list';
      case 'ENVIRONMENT':
        return 'dns';
      case 'ORGANIZATION':
        return 'corporate_fare';
      case 'INTEGRATION':
        return 'list';
      case 'API_PRODUCT':
        return 'folder';
      default:
        return '';
    }
  }
}
