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
import { Component, ElementRef, Injector, SimpleChange } from '@angular/core';
import { UpgradeComponent } from '@angular/upgrade/static';
import { toObservable } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { skip, takeUntil } from 'rxjs/operators';

import { LanguageService } from '../../../shared/i18n/language.service';
import { Language } from '../../../shared/i18n/translations';

@Component({
  template: '',
  selector: 'settings-dictionaries',
  standalone: false,
  host: {
    class: 'bootstrap gv-sub-content',
  },
})
export class DictionariesComponent extends UpgradeComponent {
  language: Language;
  private unsubscribe$ = new Subject<void>();

  constructor(
    elementRef: ElementRef,
    injector: Injector,
    private readonly activatedRoute: ActivatedRoute,
    private readonly languageService: LanguageService,
  ) {
    super('settingsDictionariesAjs', elementRef, injector);
    this.language = this.languageService.currentLanguage();
    toObservable(this.languageService.currentLanguage, { injector })
      .pipe(skip(1), takeUntil(this.unsubscribe$))
      .subscribe(language => {
        this.language = language;
        this.ngOnChanges({
          language: new SimpleChange(null, language, false),
        });
      });
  }

  override ngOnInit() {
    // Hack to Force the binding between Angular and AngularJS
    this.ngOnChanges({
      activatedRoute: new SimpleChange(null, this.activatedRoute, true),
      language: new SimpleChange(null, this.languageService.currentLanguage(), true),
    });

    super.ngOnInit();
  }

  override ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();

    super.ngOnDestroy();
  }
}
