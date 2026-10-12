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
import { HttpTestingController } from '@angular/common/http/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatInputHarness } from '@angular/material/input/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';

import { LoginModule } from './login.module';
import { LoginComponent } from './login.component';

import { LanguageService } from '../../shared/i18n/language.service';
import { CONSTANTS_TESTING, GioTestingModule } from '../../shared/testing';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let loader: HarnessLoader;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, GioTestingModule, MatIconTestingModule, LoginModule],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);

    httpTestingController = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTestingController.verify();
    localStorage.removeItem('gio-console-lang');
  });

  it('should login with username & password', async () => {
    const usernameInput = await loader.getHarness(MatInputHarness.with({ selector: '[formControlName="username"]' }));
    await usernameInput.setValue('username');

    const passwordInput = await loader.getHarness(MatInputHarness.with({ selector: '[formControlName="password"]' }));
    await passwordInput.setValue('password');

    const loginButton = await loader.getHarness(MatButtonHarness.with({ selector: '[type="submit"]' }));
    await loginButton.click();

    const req = httpTestingController.expectOne({
      method: 'POST',
      url: `${CONSTANTS_TESTING.org.baseURL}/user/login`,
    });
    expect(req.request.headers.get('Authorization').startsWith('Basic')).toBeTruthy();
  });

  it('should show English login chrome by default', () => {
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Sign In');
    expect(text).toContain('to continue to the APIM Console');
    expect(text).toContain('Username');
    expect(text).toContain('Password');
    expect(text).toContain('Sign in');
  });

  it('should switch login chrome EN → RU → EN without recreating the component', () => {
    const languageService = TestBed.inject(LanguageService);

    languageService.setLanguage('ru');
    fixture.detectChanges();
    expect(localStorage.getItem('gio-console-lang')).toBe('ru');
    expect(fixture.nativeElement.textContent).toContain('Вход');
    expect(fixture.nativeElement.textContent).toContain('для продолжения работы с APIM Console');
    expect(fixture.nativeElement.textContent).toContain('Имя пользователя');
    expect(fixture.nativeElement.textContent).toContain('Пароль');
    expect(fixture.nativeElement.textContent).toContain('Войти');
    expect(fixture.nativeElement.textContent).not.toContain('Sign In');

    languageService.setLanguage('en');
    fixture.detectChanges();
    expect(localStorage.getItem('gio-console-lang')).toBe('en');
    expect(fixture.nativeElement.textContent).toContain('Sign In');
    expect(fixture.nativeElement.textContent).toContain('Sign in');
    expect(fixture.nativeElement.textContent).not.toContain('Вход');
  });

  it('should translate validation errors without reload', () => {
    fixture.componentInstance.loginForm.markAllAsTouched();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Username is required.');
    expect(fixture.nativeElement.textContent).toContain('Password is required.');

    TestBed.inject(LanguageService).setLanguage('ru');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Введите имя пользователя.');
    expect(fixture.nativeElement.textContent).toContain('Введите пароль.');
  });
});
