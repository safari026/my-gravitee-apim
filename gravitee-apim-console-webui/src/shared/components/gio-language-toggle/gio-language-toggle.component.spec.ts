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
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';

import { GioLanguageToggleComponent } from './gio-language-toggle.component';

import { LanguageService } from '../../i18n/language.service';
import { GioTestingModule } from '../../testing';

describe('GioLanguageToggleComponent', () => {
  let fixture: ComponentFixture<GioLanguageToggleComponent>;

  const button = (): HTMLButtonElement => fixture.nativeElement.querySelector('[data-testid="language-toggle"]');

  beforeEach(() => {
    localStorage.removeItem('gio-console-lang');
    TestBed.configureTestingModule({
      imports: [GioTestingModule, MatIconTestingModule, GioLanguageToggleComponent],
    });
    fixture = TestBed.createComponent(GioLanguageToggleComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.removeItem('gio-console-lang');
  });

  it('renders one keyboard-accessible language button', () => {
    const languageButton = button();
    const icon = languageButton.querySelector('mat-icon');

    expect(fixture.nativeElement.querySelectorAll('[data-testid="language-toggle"]')).toHaveLength(1);
    expect(languageButton.getAttribute('type')).toBe('button');
    expect(languageButton.getAttribute('aria-label')).toBe('Switch language');
    expect(icon?.getAttribute('data-mat-icon-namespace')).toBe('gio');
    expect(icon?.getAttribute('data-mat-icon-name')).toBe('language');
  });

  it('toggles EN and RU and keeps the choice', () => {
    button().click();
    fixture.detectChanges();

    expect(localStorage.getItem('gio-console-lang')).toBe('ru');
    expect(TestBed.inject(LanguageService).currentLanguage()).toBe('ru');
    expect(button().getAttribute('aria-label')).toBe('Переключить язык');

    button().click();
    fixture.detectChanges();

    expect(localStorage.getItem('gio-console-lang')).toBe('en');
    expect(TestBed.inject(LanguageService).currentLanguage()).toBe('en');
    expect(button().getAttribute('aria-label')).toBe('Switch language');
  });
});
