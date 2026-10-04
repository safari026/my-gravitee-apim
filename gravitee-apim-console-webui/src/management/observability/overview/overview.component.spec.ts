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

import { OverviewComponent } from './overview.component';

import { GioTestingModule } from '../../../shared/testing';
import { LanguageService } from '../../../shared/i18n/language.service';

describe('OverviewComponent', () => {
  let component: OverviewComponent;
  let fixture: ComponentFixture<OverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverviewComponent, GioTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(OverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should switch overview chrome EN → RU → EN without reload', () => {
    const languageService = TestBed.inject(LanguageService);

    expect(fixture.nativeElement.textContent).toContain('Overview');
    expect(fixture.nativeElement.textContent).toContain("Get a quick overview of what's happening across your platform.");

    languageService.setLanguage('ru');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Обзор');
    expect(fixture.nativeElement.textContent).toContain('Краткий обзор того, что происходит на платформе.');
    expect(fixture.nativeElement.textContent).not.toContain("Get a quick overview of what's happening across your platform.");

    languageService.setLanguage('en');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Overview');
    expect(fixture.nativeElement.textContent).toContain("Get a quick overview of what's happening across your platform.");
  });
});
