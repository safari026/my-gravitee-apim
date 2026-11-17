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
import { Component, DestroyRef, Inject, inject, Injector, OnInit } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { AsyncPipe, NgOptimizedImage } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  GioLicenseExpirationNotificationModule,
  GioMenuModule,
  GioTopBarLinkModule,
  GioTopBarMenuModule,
  GioTopBarModule,
} from '@gravitee/ui-particles-angular';
import { MatButtonModule } from '@angular/material/button';
import { Observable, of } from 'rxjs';
import { map, skip } from 'rxjs/operators';
import { isEmpty } from 'lodash';

import { MenuItem, PortalNavigationService } from './portal-navigation.service';
import { PortalUserAvatarComponent } from './portal-user-avatar/portal-user-avatar.component';

import { Constants } from '../../entities/Constants';
import { GioPermissionModule } from '../../shared/components/gio-permission/gio-permission.module';
import { GioUserMenuModule } from '../../components/gio-user-menu/gio-user-menu.module';
import { GioNotificationMenuModule } from '../../components/gio-notification-menu/gio-notification-menu.module';
import { GioTopNavModule } from '../../components/gio-top-nav/gio-top-nav.module';
import { GioSideNavModule } from '../../components/gio-side-nav/gio-side-nav.module';
import { PortalSettingsService } from '../../services-ngx/portal-settings.service';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';
import { LanguageService } from '../../shared/i18n/language.service';

@Component({
  selector: 'portal-navigation',
  imports: [
    // Angular
    AsyncPipe,
    NgOptimizedImage,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatButtonModule,

    // Gravitee UI Particles & Custom Modules
    GioLicenseExpirationNotificationModule,
    GioMenuModule,
    GioNotificationMenuModule,
    GioPermissionModule,
    GioSideNavModule,
    GioTopBarLinkModule,
    GioTopBarMenuModule,
    GioTopBarModule,
    GioTopNavModule,
    GioUserMenuModule,

    // Custom Components
    PortalUserAvatarComponent,
    TranslatePipe,
  ],
  templateUrl: './portal-navigation.component.html',
  styleUrl: './portal-navigation.component.scss',
})
export class PortalNavigationComponent implements OnInit {
  mainMenuItems: MenuItem[] = [];
  footerMenuItems: MenuItem[] = [];
  customLogo: string;
  portalUrl$: Observable<string> = of();

  private readonly destroyRef = inject(DestroyRef);
  private readonly languageService = inject(LanguageService);
  private readonly injector = inject(Injector);

  constructor(
    @Inject(Constants) public readonly constants: Constants,
    private portalNavigationService: PortalNavigationService,
    private portalSettingsService: PortalSettingsService,
  ) {}

  ngOnInit() {
    this.refreshMenu();
    toObservable(this.languageService.currentLanguage, { injector: this.injector })
      .pipe(skip(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.refreshMenu());

    if (this.constants.customization && this.constants.customization.logo) {
      this.customLogo = this.constants.customization.logo;
    }

    this.portalUrl$ = this.portalSettingsService
      .get()
      .pipe(
        map(settings =>
          isEmpty(settings?.portal?.url)
            ? undefined
            : this.constants.env.baseURL.replace('{:envId}', this.constants.org.currentEnv.id) + '/portal/redirect',
        ),
      );
  }

  private refreshMenu(): void {
    this.mainMenuItems = this.portalNavigationService.getMainMenuItems();
  }
}
