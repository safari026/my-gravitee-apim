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
import { Injectable } from '@angular/core';
import { addTranslations, setLanguage } from '@gravitee/ui-components/src/lib/i18n';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  static readonly STORAGE_KEY = 'gio-portal-lang';

  constructor(
    private translateService: TranslateService,
    private titleService: Title,
  ) {}

  load() {
    return new Promise(resolve => {
      this.translateService.addLangs(environment.locales);
      const defaultLang = environment.locales[0];
      this.translateService.setDefaultLang(defaultLang);
      this.use(this.readStoredLanguage() ?? defaultLang).subscribe(() => {
        this.translateService.get('site.title').subscribe(title => this.titleService.setTitle(title));
        resolve(true);
      });
    });
  }

  use(lang: string): Observable<unknown> {
    if (lang === 'en' || lang === 'ru') {
      localStorage.setItem(TranslationService.STORAGE_KEY, lang);
    }
    return this.translateService.use(lang).pipe(
      tap(translations => {
        setLanguage(this.translateService.currentLang);
        addTranslations(this.translateService.currentLang, translations as object, this.translateService.currentLang);
      }),
    );
  }

  private readStoredLanguage(): string | null {
    const stored = localStorage.getItem(TranslationService.STORAGE_KEY);
    return stored === 'en' || stored === 'ru' ? stored : null;
  }
}
