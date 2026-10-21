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
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { GioLicenseService } from '@gravitee/ui-particles-angular';
import { of } from 'rxjs';

import { GioTopNavComponent } from './gio-top-nav.component';
import { GioTopNavModule } from './gio-top-nav.module';

import { Constants } from '../../entities/Constants';
import { fakeUser } from '../../entities/user/user.fixture';
import { TaskService } from '../../services-ngx/task.service';
import { UiCustomizationService } from '../../services-ngx/ui-customization.service';
import { EnvironmentSettingsService } from '../../services-ngx/environment-settings.service';
import { CurrentUserService } from '../../services-ngx/current-user.service';
import { AuthService } from '../../auth/auth.service';
import { LanguageService } from '../../shared/i18n/language.service';
import { CONSTANTS_TESTING, GioTestingModule } from '../../shared/testing';

describe('GioTopNavComponent', () => {
  let fixture: ComponentFixture<GioTopNavComponent>;

  const helpButtons = (): HTMLButtonElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('[data-testid="top-nav-contextual-documentation-button"]'));

  const languageButtons = (): HTMLButtonElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('[data-testid="top-nav-language-button"]'));

  const init = async (displayContextualDocumentationButton = true, isOEM = false) => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, GioTestingModule, GioTopNavModule, MatIconTestingModule],
      providers: [
        {
          provide: Constants,
          useValue: {
            ...CONSTANTS_TESTING,
            isOEM,
            org: {
              ...CONSTANTS_TESTING.org,
              settings: {
                ...CONSTANTS_TESTING.org.settings,
                management: { support: { enabled: true } },
                newsletter: { enabled: true },
              },
            },
          },
        },
        {
          provide: TaskService,
          useValue: { getTasksAutoFetch: () => of({ page: { total_elements: 0 } }) },
        },
        {
          provide: GioLicenseService,
          useValue: { isOEM$: () => of(isOEM) },
        },
        {
          provide: UiCustomizationService,
          useValue: { getConsoleCustomization: () => of(null) },
        },
        {
          provide: EnvironmentSettingsService,
          useValue: { get: () => of({ portal: { url: 'https://portal.test' } }) },
        },
        {
          provide: CurrentUserService,
          useValue: {
            current: () => of(fakeUser()),
            getUserPictureUrl: () => 'avatar-url',
          },
        },
        {
          provide: AuthService,
          useValue: { logout: () => of(undefined) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GioTopNavComponent);
    fixture.componentInstance.displayContextualDocumentationButton = displayContextualDocumentationButton;
    fixture.detectChanges();
  };

  afterEach(() => {
    localStorage.removeItem('gio-console-lang');
  });

  it('renders a single help button and a single language toggle', async () => {
    await init(true);

    expect(helpButtons()).toHaveLength(1);
    expect(languageButtons()).toHaveLength(1);
    const languageIcon = languageButtons()[0].querySelector('mat-icon');
    expect(languageIcon?.getAttribute('data-mat-icon-namespace')).toBe('gio');
    expect(languageIcon?.getAttribute('data-mat-icon-name')).toBe('language');
  });

  it('keeps a single help button after inputs refresh as on section navigation', async () => {
    await init(true);

    fixture.componentInstance.displayContextualDocumentationButton = false;
    fixture.detectChanges();
    expect(helpButtons()).toHaveLength(0);
    expect(languageButtons()).toHaveLength(1);

    fixture.componentInstance.displayContextualDocumentationButton = true;
    fixture.detectChanges();
    expect(helpButtons()).toHaveLength(1);
    expect(languageButtons()).toHaveLength(1);

    fixture.detectChanges();
    fixture.detectChanges();
    expect(helpButtons()).toHaveLength(1);
    expect(languageButtons()).toHaveLength(1);
  });

  it('emits once per help click so a second help control cannot open a duplicate panel', async () => {
    await init(true);
    const open = jest.fn();
    fixture.componentInstance.openContextualDocumentationPage.subscribe(open);

    helpButtons()[0].click();
    helpButtons()[0].click();

    expect(helpButtons()).toHaveLength(1);
    expect(open).toHaveBeenCalledTimes(2);
  });

  it('hides the help button for OEM consoles and keeps the language toggle', async () => {
    await init(true, true);

    expect(helpButtons()).toHaveLength(0);
    expect(languageButtons()).toHaveLength(1);
  });

  it('translates top nav chrome EN → RU → EN without reload', async () => {
    await init(true);

    expect(fixture.nativeElement.textContent).toContain('API Management');
    expect(fixture.nativeElement.textContent).toContain('Developer Portal');
    expect(languageButtons()[0].getAttribute('aria-label')).toBe('Switch language');

    languageButtons()[0].click();
    fixture.detectChanges();
    expect(localStorage.getItem('gio-console-lang')).toBe('ru');
    expect(fixture.nativeElement.textContent).toContain('Управление API');
    expect(fixture.nativeElement.textContent).toContain('Портал разработчика');
    expect(fixture.nativeElement.textContent).not.toContain('API Management');
    expect(languageButtons()).toHaveLength(1);
    expect(languageButtons()[0].getAttribute('aria-label')).toBe('Переключить язык');

    languageButtons()[0].click();
    fixture.detectChanges();
    expect(localStorage.getItem('gio-console-lang')).toBe('en');
    expect(fixture.nativeElement.textContent).toContain('API Management');
    expect(fixture.nativeElement.textContent).toContain('Developer Portal');
    expect(TestBed.inject(LanguageService).currentLanguage()).toBe('en');
  });
});
