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

import { Component, Inject, Injector, OnDestroy, OnInit } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { GroupItem, OrganizationNavigationService } from './organization-navigation.service';

import { Constants } from '../../../entities/Constants';
import { LanguageService } from '../../../shared/i18n/language.service';

@Component({
  selector: 'org-navigation',
  styleUrls: ['./org-navigation.component.scss'],
  templateUrl: './org-navigation.component.html',
  standalone: false,
})
export class OrgNavigationComponent implements OnInit, OnDestroy {
  public groupItems: GroupItem[] = [];
  private unsubscribe$ = new Subject<void>();

  constructor(
    private readonly router: Router,
    @Inject(Constants) private readonly constants: Constants,
    private readonly organizationNavigationService: OrganizationNavigationService,
    private readonly languageService: LanguageService,
    private readonly injector: Injector,
  ) {}

  ngOnInit(): void {
    this.refreshNavigation();
    toObservable(this.languageService.currentLanguage, { injector: this.injector })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => this.refreshNavigation());
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  goBack() {
    // Reloads current environment if exists, otherwise loads the default root path
    this.router.navigate([this.constants.org.currentEnv?.id ?? '/']);
  }

  private refreshNavigation() {
    this.groupItems = this.organizationNavigationService.getOrganizationNavigationRoutes();
  }
}
