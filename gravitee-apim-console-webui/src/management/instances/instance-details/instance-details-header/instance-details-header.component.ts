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

import { Component, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { startWith, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { Instance } from '../../../../entities/instance/instance';
import { LanguageService } from '../../../../shared/i18n/language.service';

interface MenuItem {
  displayName: string;
  routerLink: string;
  testId?: string;
}

@Component({
  selector: 'instance-details-header',
  templateUrl: './instance-details-header.component.html',
  styleUrls: ['./instance-details-header.component.scss'],
  standalone: false,
})
export class InstanceDetailsHeaderComponent implements OnInit, OnDestroy {
  @Input()
  public instance: Instance;

  public tabMenuItems: MenuItem[] = [];
  private readonly unsubscribe$ = new Subject<void>();

  constructor(
    private readonly languageService: LanguageService,
    private readonly injector: Injector,
  ) {}

  ngOnInit(): void {
    toObservable(this.languageService.currentLanguage, { injector: this.injector })
      .pipe(startWith(this.languageService.currentLanguage()), takeUntil(this.unsubscribe$))
      .subscribe(() => this.buildTabs());
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private buildTabs(): void {
    this.tabMenuItems = [
      {
        displayName: this.languageService.translate('gateways.details.tabs.environment'),
        routerLink: 'environment',
        testId: 'instances-detail-environment',
      },
      {
        displayName: this.languageService.translate('gateways.details.tabs.monitoring'),
        routerLink: 'monitoring',
        testId: 'instances-detail-monitoring',
      },
    ];
  }
}
