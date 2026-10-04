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
import { UpgradeComponent } from '@angular/upgrade/static';
import { Component, ElementRef, Injector, SimpleChange } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { skip, takeUntil } from 'rxjs/operators';

import { ApplicationService } from '../../../../services-ngx/application.service';
import { LanguageService } from '../../../../shared/i18n/language.service';

@Component({
  template: '',
  selector: 'application-logs',
  standalone: false,
  host: {
    class: 'bootstrap',
  },
})
export class ApplicationLogsComponent extends UpgradeComponent {
  private unsubscribe$ = new Subject<void>();

  constructor(
    elementRef: ElementRef,
    injector: Injector,
    private readonly activatedRoute: ActivatedRoute,
    private readonly applicationService: ApplicationService,
    private readonly languageService: LanguageService,
  ) {
    super('applicationLogs', elementRef, injector);
    toObservable(this.languageService.currentLanguage, { injector })
      .pipe(skip(1), takeUntil(this.unsubscribe$))
      .subscribe(language => {
        this.ngOnChanges({
          language: new SimpleChange(null, language, false),
        });
      });
  }

  override ngOnInit() {
    const applicationId = this.activatedRoute.snapshot.params.applicationId;
    combineLatest([
      this.applicationService.getLastApplicationFetch(applicationId),
      this.applicationService.getSubscribedAPIList(applicationId),
    ])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: ([application, subscribedApiList]) => {
          this.ngOnChanges({
            application: new SimpleChange(null, application, true),
            apis: new SimpleChange(null, subscribedApiList, true),
            activatedRoute: new SimpleChange(null, this.activatedRoute, true),
          });

          super.ngOnInit();
        },
      });
  }

  override ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();

    super.ngOnDestroy();
  }
}
