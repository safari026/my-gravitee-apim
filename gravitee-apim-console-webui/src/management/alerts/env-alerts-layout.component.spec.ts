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
import { RouterTestingModule } from '@angular/router/testing';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { EnvAlertsLayoutComponent } from './env-alerts-layout.component';

import { LanguageService } from '../../shared/i18n/language.service';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';

describe('EnvAlertsLayoutComponent', () => {
  let fixture: ComponentFixture<EnvAlertsLayoutComponent>;
  let languageService: LanguageService;

  beforeEach(() => {
    localStorage.removeItem('gio-console-lang');
    TestBed.configureTestingModule({
      declarations: [EnvAlertsLayoutComponent],
      imports: [NoopAnimationsModule, RouterTestingModule, MatTabsModule, MatIconModule, MatIconTestingModule, TranslatePipe],
    });
    fixture = TestBed.createComponent(EnvAlertsLayoutComponent);
    languageService = TestBed.inject(LanguageService);
    languageService.setLanguage('en');
    fixture.detectChanges();
  });

  afterEach(() => {
    languageService.setLanguage('en');
  });

  it('localizes tabs and switches EN → RU → EN', () => {
    const text = () => fixture.nativeElement.textContent as string;

    expect(text()).toContain('My alerts');
    expect(text()).toContain('Activity');

    languageService.setLanguage('ru');
    fixture.detectChanges();
    expect(text()).toContain('Мои оповещения');
    expect(text()).toContain('Активность');
    expect(text()).not.toContain('My alerts');

    languageService.setLanguage('en');
    fixture.detectChanges();
    expect(text()).toContain('My alerts');
    expect(text()).toContain('Activity');
  });
});
