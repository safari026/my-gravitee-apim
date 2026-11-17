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
import { TestBed } from '@angular/core/testing';

import { GioPaginatorIntl } from './gio-paginator-intl';

import { LanguageService } from '../i18n/language.service';

describe('GioPaginatorIntl', () => {
  let languageService: LanguageService;
  let intl: GioPaginatorIntl;

  beforeEach(() => {
    localStorage.removeItem('gio-console-lang');
    TestBed.configureTestingModule({
      providers: [LanguageService, GioPaginatorIntl],
    });
    languageService = TestBed.inject(LanguageService);
    intl = TestBed.inject(GioPaginatorIntl);
  });

  it('keeps the English Material labels by default', () => {
    expect(intl.itemsPerPageLabel).toBe('Items per page:');
    expect(intl.nextPageLabel).toBe('Next page');
    expect(intl.previousPageLabel).toBe('Previous page');
    expect(intl.firstPageLabel).toBe('First page');
    expect(intl.lastPageLabel).toBe('Last page');
    expect(intl.getRangeLabel(0, 10, 100)).toBe('1 – 10 of 100');
    expect(intl.getRangeLabel(0, 10, 0)).toBe('0 of 0');
    expect(intl.getRangeLabel(0, 10, -1)).toBe('1 – 10 of N/A');
  });

  it('switches labels without replacing the paginator instance', () => {
    const changes: number[] = [];
    intl.changes.subscribe(() => changes.push(1));

    languageService.setLanguage('ru');
    TestBed.flushEffects();

    expect(intl.itemsPerPageLabel).toBe('Элементов на странице:');
    expect(intl.nextPageLabel).toBe('Следующая страница');
    expect(intl.getRangeLabel(2, 25, 100)).toBe('51 – 75 из 100');

    languageService.setLanguage('en');
    TestBed.flushEffects();

    expect(intl.itemsPerPageLabel).toBe('Items per page:');
    expect(intl.getRangeLabel(2, 25, 100)).toBe('51 – 75 of 100');
    expect(changes.length).toBeGreaterThan(0);
  });
});
