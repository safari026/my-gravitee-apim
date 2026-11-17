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

  /**
   * First `TranslateService.use()` emission is the raw catalog.
   * Later emissions are MessageFormat functions. ui-components reads those
   * values as labels, so the raw catalog has to be kept.
   */
  private readonly plainCatalogs = new Map<string, object>();

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
        const lang = this.translateService.currentLang;
        const catalog = this.plainCatalog(lang, translations);
        setLanguage(lang);
        addTranslations(lang, catalog, lang);
        this.refreshTableComponents();
      }),
    );
  }

  private plainCatalog(lang: string, translations: unknown): object {
    if (!this.hasCompilerFunction(translations)) {
      const catalog = (translations ?? {}) as object;
      this.plainCatalogs.set(lang, catalog);
      return catalog;
    }
    return this.plainCatalogs.get(lang) ?? (this.stringsFromCompiler(translations) as object);
  }

  private hasCompilerFunction(value: unknown): boolean {
    if (typeof value === 'function') {
      return true;
    }
    if (Array.isArray(value)) {
      return value.some(child => this.hasCompilerFunction(child));
    }
    if (value && typeof value === 'object') {
      return Object.keys(value).some(key => this.hasCompilerFunction((value as Record<string, unknown>)[key]));
    }
    return false;
  }

  private stringsFromCompiler(value: unknown): unknown {
    if (typeof value === 'function') {
      const source = Function.prototype.toString.call(value);
      const literal = source.match(/^\(\)\s*=>\s*(?:"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)')$/);
      const text = literal?.[1] ?? literal?.[2];
      return text === undefined ? value : text.replace(/\\(["'\\])/g, '$1');
    }
    if (Array.isArray(value)) {
      return value.map(child => this.stringsFromCompiler(child));
    }
    if (value && typeof value === 'object') {
      const catalog = value as Record<string, unknown>;
      return Object.keys(catalog).reduce<Record<string, unknown>>((result, key) => {
        result[key] = this.stringsFromCompiler(catalog[key]);
        return result;
      }, {});
    }
    return value;
  }

  private refreshTableComponents(): void {
    if (typeof document === 'undefined') {
      return;
    }
    document.querySelectorAll('gv-pagination, gv-table, gv-row').forEach(element => {
      (element as { requestUpdate?: () => void }).requestUpdate?.();
    });
  }

  private readStoredLanguage(): string | null {
    const stored = localStorage.getItem(TranslationService.STORAGE_KEY);
    return stored === 'en' || stored === 'ru' ? stored : null;
  }
}
