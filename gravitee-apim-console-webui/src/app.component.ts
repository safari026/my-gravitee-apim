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
import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { GioMenuSearchService } from '@gravitee/ui-particles-angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  ORGANIZATION_MENU_GROUP_ID,
  OrganizationNavigationService,
} from './organization/configuration/navigation/organization-navigation.service';
import { LanguageService } from './shared/i18n/language.service';

@Component({
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`,
  standalone: false,
})
export class AppComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();

  constructor(
    private readonly organizationNavigationService: OrganizationNavigationService,
    private readonly gioMenuSearchService: GioMenuSearchService,
    private readonly languageService: LanguageService,
    private readonly injector: Injector,
  ) {}

  public ngOnInit() {
    this.refreshOrganizationSearchItems();
    toObservable(this.languageService.currentLanguage, { injector: this.injector })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => this.refreshOrganizationSearchItems());
  }

  public ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private refreshOrganizationSearchItems() {
    this.gioMenuSearchService.removeMenuSearchItems([ORGANIZATION_MENU_GROUP_ID]);
    this.gioMenuSearchService.addMenuSearchItems(this.organizationNavigationService.getOrganizationNavigationSearchItems());
  }
}
