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
import { of } from 'rxjs';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator/jest';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';

jest.mock('@gravitee/ui-components/src/lib/i18n', () => ({
  setLanguage: jest.fn(),
  addTranslations: jest.fn(),
}));

import { addTranslations, setLanguage } from '@gravitee/ui-components/src/lib/i18n';

import { TranslationService } from './translation.service';

describe('TranslationService', () => {
  const translate = {
    addLangs: jest.fn(),
    setDefaultLang: jest.fn(),
    getBrowserLang: jest.fn(() => 'fr'),
    currentLang: 'en',
    use: jest.fn((lang: string) => {
      translate.currentLang = lang;
      return of({ 'site.title': 'Developer Portal' });
    }),
    get: jest.fn((key: string) => of(key === 'site.title' ? 'Developer Portal' : key)),
  };
  const title = { setTitle: jest.fn() };

  const createService = createServiceFactory({
    service: TranslationService,
    providers: [
      { provide: TranslateService, useValue: translate },
      { provide: Title, useValue: title },
    ],
  });

  let spectator: SpectatorService<TranslationService>;

  beforeEach(() => {
    localStorage.removeItem(TranslationService.STORAGE_KEY);
    translate.currentLang = 'en';
    translate.use.mockClear();
    title.setTitle.mockClear();
    (setLanguage as jest.Mock).mockClear();
    (addTranslations as jest.Mock).mockClear();
    spectator = createService();
  });

  it('should be created', () => {
    expect(spectator.service).toBeTruthy();
  });

  it('uses English when no language is stored', async () => {
    await spectator.service.load();

    expect(translate.use).toHaveBeenCalledWith('en');
    expect(localStorage.getItem(TranslationService.STORAGE_KEY)).toBe('en');
    expect(setLanguage).toHaveBeenCalledWith('en');
    expect(title.setTitle).toHaveBeenCalledWith('Developer Portal');
  });

  it('restores Russian from localStorage', async () => {
    localStorage.setItem(TranslationService.STORAGE_KEY, 'ru');

    await spectator.service.load();

    expect(translate.use).toHaveBeenCalledWith('ru');
    expect(addTranslations).toHaveBeenCalledWith('ru', { 'site.title': 'Developer Portal' }, 'ru');
  });

  it('ignores an unsupported stored language', async () => {
    localStorage.setItem(TranslationService.STORAGE_KEY, 'fr');

    await spectator.service.load();

    expect(translate.use).toHaveBeenCalledWith('en');
  });

  it('persists a language change without rewriting the document title', () => {
    spectator.service.use('ru').subscribe();

    expect(localStorage.getItem(TranslationService.STORAGE_KEY)).toBe('ru');
    expect(title.setTitle).not.toHaveBeenCalled();
  });
});
