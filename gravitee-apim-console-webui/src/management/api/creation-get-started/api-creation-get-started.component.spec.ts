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
import { fakeInstallation } from '../../../entities/installation/installation.fixture';
import { GioPermissionModule } from '../../../shared/components/gio-permission/gio-permission.module';
import { GioTestingPermission, GioTestingPermissionProvider } from '../../../shared/components/gio-permission/gio-permission.service';
import { LanguageService } from '../../../shared/i18n/language.service';

describe('ApiCreationGetStartedComponent', () => {
  let fixture: ComponentFixture<ApiCreationGetStartedComponent>;
  let rootLoader: HarnessLoader;
  let loader: HarnessLoader;
  let component: ApiCreationGetStartedComponent;
  let httpTestingController: HttpTestingController;

  const initConfigureTestingModule = (permissions: GioTestingPermission) => {
    localStorage.removeItem('gio-console-lang');

    TestBed.configureTestingModule({
      imports: [GioPermissionModule, GioTestingModule, ApiCreationGetStartedModule, MatIconTestingModule, NoopAnimationsModule],
      providers: [
        {
          provide: GioTestingPermissionProvider,
          useValue: permissions,
        },
      ],
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

  describe('as Admin', () => {
    beforeEach(() => {
      initConfigureTestingModule(['organization-installation-r']);
    });

    it('should use the cockpit link if installation registered', async () => {
      httpTestingController.expectOne(`${CONSTANTS_TESTING.org.baseURL}/installation`).flush(
        fakeInstallation({
          cockpitURL: 'https://cockpit.gravitee.io',
          additionalInformation: {
            COCKPIT_INSTALLATION_STATUS: 'ACCEPTED',
          },
        }),
      );
      expect(component.cockpitLink).toEqual(
        'https://cockpit.gravitee.io?utm_source=apim&utm_medium=InApp&utm_campaign=api_designer&utm_term=registered',
      );
    });

    it('should always use the cockpit.gravitee.io link even if installation not registered', async () => {
      httpTestingController.expectOne(`${CONSTANTS_TESTING.org.baseURL}/installation`).flush(
        fakeInstallation({
          cockpitURL: 'https://cockpit.gravitee.io',
          additionalInformation: {},
        }),
      );
      expect(component.cockpitLink).toEqual(
        'https://cockpit.gravitee.io?utm_source=apim&utm_medium=InApp&utm_campaign=api_designer&utm_term=not_registered',
      );
    });

    it('should open api import dialog', async () => {
      httpTestingController.expectOne(`${CONSTANTS_TESTING.org.baseURL}/installation`);
      component.goToApiImport();

      expectPoliciesSwaggerGetRequest();

      const confirmDialog = await rootLoader.getHarness(MatDialogHarness.with({ selector: '#importApiDialog' }));
      await confirmDialog.close();
    });

    it('should hide Design API, Create New API, Learn More, and not render Create new App', async () => {
      httpTestingController.expectOne(`${CONSTANTS_TESTING.org.baseURL}/installation`).flush(fakeInstallation());
      fixture.detectChanges();

      const pageText = fixture.nativeElement.textContent as string;
      expect(pageText).not.toContain('Create new App');
      expect(pageText).not.toContain('Create New API');
      expect(pageText).not.toContain('Design API');
      expect(pageText).not.toContain('Not sure which version to pick?');
      expect(pageText).not.toContain('Learn More');
      expect(await loader.getAllHarnesses(MatButtonHarness.with({ text: /Design API/ }))).toHaveLength(0);
      expect(await loader.getAllHarnesses(MatButtonHarness.with({ text: 'Learn More' }))).toHaveLength(0);
      expect(await loader.getAllHarnesses(MatButtonHarness.with({ text: 'Create V4 API' }))).toHaveLength(0);
      expect(await loader.getAllHarnesses(MatButtonHarness.with({ text: 'Import V4 API' }))).toHaveLength(0);

      expect(await loader.getHarness(MatButtonHarness.with({ text: 'Create V2 API' }))).toBeTruthy();
      expect(await loader.getHarness(MatButtonHarness.with({ text: 'Import V2 API' }))).toBeTruthy();
      expect(pageText).toContain('Create Classic API');
    });

    it('should switch chrome to Russian and back without recreating the component', async () => {
      httpTestingController.expectOne(`${CONSTANTS_TESTING.org.baseURL}/installation`).flush(fakeInstallation());
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Choose API creation method');
      expect(fixture.nativeElement.textContent).toContain('Create Classic API');
      expect(fixture.nativeElement.textContent).not.toContain('Create New API');
      expect(fixture.nativeElement.textContent).not.toContain('Learn More');
      expect(await loader.getHarness(MatButtonHarness.with({ text: 'Create V2 API' }))).toBeTruthy();

      const languageService = TestBed.inject(LanguageService);
      languageService.setLanguage('ru');
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Выберите способ создания API');
      expect(fixture.nativeElement.textContent).toContain('Создать классический API');
      expect(fixture.nativeElement.textContent).not.toContain('Создать новый API');
      expect(fixture.nativeElement.textContent).not.toContain('Choose API creation method');
      expect(fixture.nativeElement.textContent).not.toContain('Create Classic API');
      expect(fixture.nativeElement.textContent).not.toContain('Подробнее');
      expect(await loader.getHarness(MatButtonHarness.with({ text: 'Создать API V2' }))).toBeTruthy();
      expect(await loader.getHarness(MatButtonHarness.with({ text: 'Импортировать API V2' }))).toBeTruthy();
      expect(await loader.getAllHarnesses(MatButtonHarness.with({ text: 'Создать API V4' }))).toHaveLength(0);
      expect(await loader.getAllHarnesses(MatButtonHarness.with({ text: 'Импортировать API V4' }))).toHaveLength(0);
      expect(await loader.getAllHarnesses(MatButtonHarness.with({ text: 'Подробнее' }))).toHaveLength(0);
      expect(fixture.nativeElement.textContent).not.toContain('Design API');

      languageService.setLanguage('en');
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Choose API creation method');
      expect(fixture.nativeElement.textContent).toContain('Create Classic API');
      expect(await loader.getHarness(MatButtonHarness.with({ text: 'Create V2 API' }))).toBeTruthy();
      expect(await loader.getAllHarnesses(MatButtonHarness.with({ text: 'Learn More' }))).toHaveLength(0);
    });
  });

  describe('as ApiUser', () => {
    beforeEach(() => {
      initConfigureTestingModule([]);
    });

    it('should always use the cockpit.gravitee.io link even if no right to access the installation', async () => {
      httpTestingController.expectNone(`${CONSTANTS_TESTING.org.baseURL}/installation`);

      expect(component.cockpitLink).toEqual(
        'https://cockpit.gravitee.io?utm_source=apim&utm_medium=InApp&utm_campaign=api_designer&utm_term=not_registered',
      );
    });
  });

  function expectPoliciesSwaggerGetRequest() {
    httpTestingController.expectOne({ url: `${CONSTANTS_TESTING.env.baseURL}/policies/swagger`, method: 'GET' }).flush([]);
  }
});
