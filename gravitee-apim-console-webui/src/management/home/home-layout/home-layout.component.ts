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
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Injector, OnDestroy } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { catchError, map, shareReplay, skip, startWith, takeUntil } from 'rxjs/operators';

import { TaskService } from '../../../services-ngx/task.service';
import { LanguageService } from '../../../shared/i18n/language.service';

@Component({
  selector: 'home-layout',
  templateUrl: './home-layout.component.html',
  styleUrls: ['./home-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class HomeLayoutComponent implements OnDestroy {
  private readonly unsubscribe$ = new Subject<void>();

  public taskLabel: Observable<string>;

  public tabs: { labelKey: string; useTaskLabel?: boolean; routerLink: string; dataTestId: string }[] = [
    {
      labelKey: 'dashboard.tabs.overview',
      routerLink: './overview',
      dataTestId: 'home-tab-overview',
    },
    {
      labelKey: 'dashboard.tabs.apiHealthCheck',
      routerLink: './apiHealthCheck',
      dataTestId: 'home-tab-api-health-check',
    },
    {
      labelKey: 'dashboard.tabs.tasks',
      useTaskLabel: true,
      routerLink: './tasks',
      dataTestId: 'home-tab-tasks',
    },
    {
      labelKey: 'dashboard.tabs.broadcasts',
      routerLink: './broadcasts',
      dataTestId: 'home-tab-broadcasts',
    },
  ];

  constructor(
    private readonly taskService: TaskService,
    private readonly languageService: LanguageService,
    private readonly injector: Injector,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) {
    this.taskLabel = combineLatest([
      this.taskService.getTasks().pipe(
        map(tasks => tasks.page.total_elements as number | null),
        startWith(null),
        catchError(() => of(null)),
      ),
      toObservable(this.languageService.currentLanguage, { injector: this.injector }),
    ]).pipe(
      map(([count]) =>
        count === null
          ? this.languageService.translate('dashboard.tabs.tasks')
          : this.languageService.translate('dashboard.tabs.myTasks', { count }),
      ),
      shareReplay(1),
    );

    toObservable(this.languageService.currentLanguage, { injector: this.injector })
      .pipe(skip(1), takeUntil(this.unsubscribe$))
      .subscribe(() => this.changeDetectorRef.markForCheck());
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
