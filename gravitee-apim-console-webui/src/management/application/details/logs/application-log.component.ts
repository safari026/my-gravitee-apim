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
import { Component, ElementRef, Injector, Input, SimpleChange } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { skip, takeUntil } from 'rxjs/operators';

import { ApplicationService } from '../../../../services-ngx/application.service';
import { LanguageService } from '../../../../shared/i18n/language.service';
import { Language } from '../../../../shared/i18n/translations';

@Component({
  template: '',
  selector: 'application-log',
  standalone: false,
  host: {
    class: 'bootstrap',
  },
})
export class ApplicationLogComponent extends UpgradeComponent {
  @Input() language: Language;
  private unsubscribe$ = new Subject<void>();

  constructor(
    elementRef: ElementRef,
    private readonly injector: Injector,
    private readonly activatedRoute: ActivatedRoute,
    private readonly applicationService: ApplicationService,
    private readonly languageService: LanguageService,
  ) {
    super('applicationLog', elementRef, injector);
  }

  override ngOnInit() {
    this.language = this.languageService.currentLanguage();
    toObservable(this.languageService.currentLanguage, { injector: this.injector })
      .pipe(skip(1), takeUntil(this.unsubscribe$))
      .subscribe(language => {
        this.language = language;
        this.ngOnChanges({
          language: new SimpleChange(null, language, false),
        });
      });

    this.applicationService
      .getLog(
        this.activatedRoute.snapshot.params.applicationId,
        this.activatedRoute.snapshot.params.logId,
        this.activatedRoute.snapshot.queryParams.timestamp,
      )
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: log => {
          this.ngOnChanges({
            log: new SimpleChange(null, log, true),
            activatedRoute: new SimpleChange(null, this.activatedRoute, true),
            language: new SimpleChange(null, this.language, true),
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
