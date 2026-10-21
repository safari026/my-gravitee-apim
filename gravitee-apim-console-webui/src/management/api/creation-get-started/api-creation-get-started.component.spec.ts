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
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HarnessLoader } from '@angular/cdk/testing';
import { MatDialogHarness } from '@angular/material/dialog/testing';
import { MatButtonHarness } from '@angular/material/button/testing';

import { ApiCreationGetStartedComponent } from './api-creation-get-started.component';
import { ApiCreationGetStartedModule } from './api-creation-get-started.module';

import { CONSTANTS_TESTING, GioTestingModule } from '../../../shared/testing';
import { LanguageService } from '../../../shared/i18n/language.service';

describe('ApiCreationGetStartedComponent', () => {
  let fixture: ComponentFixture<ApiCreationGetStartedComponent>;
  let rootLoader: HarnessLoader;
  let loader: HarnessLoader;
  let component: ApiCreationGetStartedComponent;
  let httpTestingController: HttpTestingController;

  const initConfigureTestingModule = () => {
    localStorage.removeItem('gio-console-lang');

    TestBed.configureTestingModule({
      imports: [GioTestingModule, ApiCreationGetStartedModule, MatIconTestingModule, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ApiCreationGetStartedComponent);
    rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    loader = TestbedHarnessEnvironment.loader(fixture);
    component = fixture.componentInstance;

    httpTestingController = TestBed.inject(HttpTestingController);

    fixture.detectChanges();
  };

  afterEach(() => {
    localStorage.removeItem('gio-console-lang');
    httpTestingController.verify();
  });

  beforeEach(() => {
    initConfigureTestingModule();
  });

  it('should open api import dialog', async () => {
    component.goToApiImport();

    expectPoliciesSwaggerGetRequest();

    const confirmDialog = await rootLoader.getHarness(MatDialogHarness.with({ selector: '#importApiDialog' }));
    await confirmDialog.close();
  });

  it('should keep create and import actions and hide removed get-started extras', async () => {
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Choose API creation method');
    expect(text).toContain('Create Classic API');
    expect(text).toContain('Create New API');
    expect(text).not.toContain('Not sure which version to pick?');
    expect(text).not.toContain('Learn More');
    expect(text).not.toContain('Design API');
    expect(await loader.getHarness(MatButtonHarness.with({ text: 'Create V2 API' }))).toBeTruthy();
    expect(await loader.getHarness(MatButtonHarness.with({ text: 'Import V2 API' }))).toBeTruthy();
    expect(await loader.getHarness(MatButtonHarness.with({ text: 'Create V4 API' }))).toBeTruthy();
    expect(await loader.getHarness(MatButtonHarness.with({ text: 'Import V4 API' }))).toBeTruthy();
  });

  it('should switch chrome to Russian and back without recreating the component', async () => {
    expect(fixture.nativeElement.textContent).toContain('Choose API creation method');
    expect(fixture.nativeElement.textContent).toContain('Create Classic API');
    expect(fixture.nativeElement.textContent).toContain('Create New API');
    expect(await loader.getHarness(MatButtonHarness.with({ text: 'Create V2 API' }))).toBeTruthy();
    expect(await loader.getHarness(MatButtonHarness.with({ text: 'Create V4 API' }))).toBeTruthy();
    expect(await loader.getHarness(MatButtonHarness.with({ text: 'Import V4 API' }))).toBeTruthy();

    const languageService = TestBed.inject(LanguageService);
    languageService.setLanguage('ru');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Выберите способ создания API');
    expect(fixture.nativeElement.textContent).toContain('Создать классический API');
    expect(fixture.nativeElement.textContent).not.toContain('Choose API creation method');
    expect(fixture.nativeElement.textContent).not.toContain('Create Classic API');
    expect(await loader.getHarness(MatButtonHarness.with({ text: 'Создать API V2' }))).toBeTruthy();
    expect(await loader.getHarness(MatButtonHarness.with({ text: 'Импортировать API V2' }))).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Создать новый API');
    expect(fixture.nativeElement.textContent).not.toContain('Create New API');
    expect(await loader.getHarness(MatButtonHarness.with({ text: 'Создать API V4' }))).toBeTruthy();
    expect(await loader.getHarness(MatButtonHarness.with({ text: 'Импортировать API V4' }))).toBeTruthy();
    expect(fixture.nativeElement.textContent).not.toContain('Learn More');

    languageService.setLanguage('en');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Choose API creation method');
    expect(fixture.nativeElement.textContent).toContain('Create Classic API');
    expect(await loader.getHarness(MatButtonHarness.with({ text: 'Create V2 API' }))).toBeTruthy();
    expect(await loader.getHarness(MatButtonHarness.with({ text: 'Create V4 API' }))).toBeTruthy();
    expect(fixture.nativeElement.textContent).not.toContain('Learn More');
  });

  function expectPoliciesSwaggerGetRequest() {
    httpTestingController.expectOne({ url: `${CONSTANTS_TESTING.env.baseURL}/policies/swagger`, method: 'GET' }).flush([]);
  }
});
