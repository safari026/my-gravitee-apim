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
import { MatSelectHarness } from '@angular/material/select/testing';

import { SignUpModule } from './sign-up.module';
import { SignUpComponent } from './sign-up.component';

import { CONSTANTS_TESTING, GioTestingModule } from '../../shared/testing';
import { LanguageService } from '../../shared/i18n/language.service';

describe('SignUpComponent', () => {
  let fixture: ComponentFixture<SignUpComponent>;
  let loader: HarnessLoader;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    localStorage.removeItem('gio-console-lang');
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, GioTestingModule, MatIconTestingModule, SignUpModule],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignUpComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);

    httpTestingController = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTestingController.verify();
    localStorage.removeItem('gio-console-lang');
  });

  it('should sign up', async () => {
    expectGetCustomUserFields();

    const firstNameInput = await loader.getHarness(MatInputHarness.with({ selector: '[formControlName="firstName"]' }));
    await firstNameInput.setValue('firstName');

    const lastNameInput = await loader.getHarness(MatInputHarness.with({ selector: '[formControlName="lastName"]' }));
    await lastNameInput.setValue('lastName');

    const emailInput = await loader.getHarness(MatInputHarness.with({ selector: '[formControlName="email"]' }));
    await emailInput.setValue('email@email.com');

    const customUserFieldKey1Input = await loader.getHarness(MatInputHarness.with({ label: 'label1' }));
    await customUserFieldKey1Input.setValue('value1');

    const customUserFieldKey2Input = await loader.getHarness(MatSelectHarness.with({ label: 'label2' }));
    await customUserFieldKey2Input.clickOptions({ text: 'value1' });

    const signUpButton = await loader.getHarness(MatButtonHarness.with({ selector: '[type="submit"]' }));
    await signUpButton.click();

    const req = httpTestingController.expectOne({
      method: 'POST',
      url: `${CONSTANTS_TESTING.org.baseURL}/users/registration`,
    });
    expect(req.request.body).toEqual({
      firstname: 'firstName',
      lastname: 'lastName',
      email: 'email@email.com',
      customFields: {
        key1: 'value1',
        key2: 'value1',
      },
    });
  });

  it('should show English copy by default', async () => {
    expectGetCustomUserFields();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Sign Up');
    expect(text).toContain('to access to the APIM Console');
    expect(text).toContain('First name');
    expect(text).toContain('Last name');
    expect(text).toContain('Email');
    expect(text).toContain('Sign up');
    expect(text).toContain('I have already an account!');
    expect(text).toContain('Sign in');
    expect(text).toContain('label1');
  });

  it('should switch Sign Up copy to Russian without recreating the component', async () => {
    expectGetCustomUserFields();
    fixture.detectChanges();

    const languageService = TestBed.inject(LanguageService);
    languageService.setLanguage('ru');
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Регистрация');
    expect(text).toContain('для доступа к APIM Console');
    expect(text).toContain('Имя');
    expect(text).toContain('Фамилия');
    expect(text).toContain('Зарегистрироваться');
    expect(text).toContain('У меня уже есть аккаунт!');
    expect(text).toContain('Войти');
    expect(text).not.toContain('I have already an account!');
    expect(text).toContain('label1');
  });

  it('should translate required validation messages', async () => {
    expectGetCustomUserFields();
    fixture.detectChanges();

    const firstNameInput = await loader.getHarness(MatInputHarness.with({ selector: '[formControlName="firstName"]' }));
    await firstNameInput.focus();
    await firstNameInput.blur();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('First name is required.');

    const languageService = TestBed.inject(LanguageService);
    languageService.setLanguage('ru');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Введите имя.');
    expect(fixture.nativeElement.textContent).not.toContain('First name is required.');
  });

  const expectGetCustomUserFields = () => {
    const req = httpTestingController.expectOne({
      method: 'GET',
      url: `${CONSTANTS_TESTING.org.baseURL}/configuration/custom-user-fields`,
    });
    req.flush([
      {
        key: 'key1',
        label: 'label1',
        required: true,
      },
      {
        key: 'key2',
        label: 'label2',
        required: false,
        values: ['value1', 'value2'],
      },
    ]);
  };
});
