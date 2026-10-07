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
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HarnessLoader } from '@angular/cdk/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { MatMenuItemHarness } from '@angular/material/menu/testing';

import { SharedPolicyGroupsComponent } from './shared-policy-groups.component';
import { SharedPolicyGroupsHarness } from './shared-policy-groups.harness';
import { SharedPolicyGroupsAddEditDialogHarness } from './shared-policy-groups-add-edit-dialog/shared-policy-groups-add-edit-dialog.harness';

import { CONSTANTS_TESTING, GioTestingModule } from '../../../shared/testing';
import { GioTestingPermissionProvider } from '../../../shared/components/gio-permission/gio-permission.service';
import {
  expectCreateSharedPolicyGroupRequest,
  expectListSharedPolicyGroupsRequest,
} from '../../../services-ngx/shared-policy-groups.service.spec';
import { fakeCreateSharedPolicyGroup } from '../../../entities/management-api-v2';
import { LanguageService } from '../../../shared/i18n/language.service';

describe('SharedPolicyGroupsComponent', () => {
  let fixture: ComponentFixture<SharedPolicyGroupsComponent>;
  let componentHarness: SharedPolicyGroupsHarness;
  let rootLoader: HarnessLoader;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    localStorage.removeItem('gio-console-lang');
    await TestBed.configureTestingModule({
      imports: [SharedPolicyGroupsComponent, NoopAnimationsModule, GioTestingModule],
      providers: [
        {
          provide: GioTestingPermissionProvider,
          useValue: [
            'environment-shared_policy_group-c',
            'environment-shared_policy_group-r',
            'environment-shared_policy_group-u',
            'environment-shared_policy_group-d',
          ],
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SharedPolicyGroupsComponent);
    httpTestingController = TestBed.inject(HttpTestingController);
    fixture.autoDetectChanges();
    rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    componentHarness = await TestbedHarnessEnvironment.harnessForFixture(fixture, SharedPolicyGroupsHarness);
  });

  afterEach(() => {
    localStorage.removeItem('gio-console-lang');
    httpTestingController.verify();
  });

  it('should display resources table', async () => {
    const table = await componentHarness.getTable();
    const tableHost = await table.host();
    expect(await tableHost.text()).toContain('Loading...');

    expectListSharedPolicyGroupsRequest(httpTestingController);

    expect(await table.getCellTextByIndex()).toStrictEqual([
      ['Shared policy group', 'Proxy API', 'Request', expect.any(String), expect.any(String), ''],
    ]);
  });

  it('should show English chrome by default', async () => {
    expectListSharedPolicyGroupsRequest(httpTestingController);
    expect(fixture.nativeElement.textContent).toContain('Shared Policy Group');
    expect(fixture.nativeElement.textContent).toContain('Add Shared Policy Group');
    expect(fixture.nativeElement.textContent).toContain('Last updated');
    expect(fixture.nativeElement.textContent).toContain('Request');
  });

  it('should refresh the table when filters change', async () => {
    const table = await componentHarness.getTable();
    const getTableWrapper = await componentHarness.getTableWrapper();

    const tableHost = await table.host();
    expect(await tableHost.text()).toContain('Loading...');
    expectListSharedPolicyGroupsRequest(httpTestingController);

    await getTableWrapper.setSearchValue('test');

    // ExpectOne canceled before only when testing
    httpTestingController.expectOne(`${CONSTANTS_TESTING.env.v2BaseURL}/shared-policy-groups?page=1&perPage=25`);
    expectListSharedPolicyGroupsRequest(httpTestingController, undefined, '?page=1&perPage=25&q=test');

    expect(await table.getCellTextByIndex()).toStrictEqual([
      ['Shared policy group', 'Proxy API', 'Request', expect.any(String), expect.any(String), ''],
    ]);
  });

  it('should add a new shared policy group', async () => {
    await componentHarness.clickAddButton('MESSAGE');

    fixture.detectChanges();
    const addDialog = await rootLoader.getHarness(SharedPolicyGroupsAddEditDialogHarness);

    await addDialog.setName('test');
    await addDialog.setDescription('test');
    await addDialog.setPrerequisiteMessage('test');
    await addDialog.setPhase('Response');
    await addDialog.save();

    expectCreateSharedPolicyGroupRequest(
      httpTestingController,
      fakeCreateSharedPolicyGroup({ name: 'test', description: 'test', prerequisiteMessage: 'test', phase: 'RESPONSE' }),
    );
    expectListSharedPolicyGroupsRequest(httpTestingController);
  });

  it('should switch chrome to Russian and back without recreating the component', async () => {
    expectListSharedPolicyGroupsRequest(httpTestingController);
    const languageService = TestBed.inject(LanguageService);

    languageService.setLanguage('ru');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Общая группа политик');
    expect(fixture.nativeElement.textContent).toContain('Добавить общую группу политик');
    expect(fixture.nativeElement.textContent).toContain('Запрос');
    expect(fixture.nativeElement.textContent).not.toContain('Last updated');

    languageService.setLanguage('en');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Shared Policy Group');
    expect(fixture.nativeElement.textContent).toContain('Last updated');
    expect(fixture.nativeElement.textContent).toContain('Request');
  });

  it('should keep PROXY and MESSAGE values when creating a Shared Policy Group', async () => {
    const addButton = await componentHarness.getAddButton();
    await addButton.click();
    await rootLoader.getHarness(MatMenuItemHarness.with({ text: 'Message API' })).then(item => item.click());

    fixture.detectChanges();
    const addDialog = await rootLoader.getHarness(SharedPolicyGroupsAddEditDialogHarness);

    await addDialog.setName('message-spg');
    await addDialog.setPhase('Publish');
    await addDialog.save();

    expectCreateSharedPolicyGroupRequest(
      httpTestingController,
      fakeCreateSharedPolicyGroup({
        name: 'message-spg',
        description: '',
        prerequisiteMessage: '',
        apiType: 'MESSAGE',
        phase: 'PUBLISH',
      }),
    );
    expectListSharedPolicyGroupsRequest(httpTestingController);
  });

  it('should keep phase REQUEST/RESPONSE values after switching language', async () => {
    expectListSharedPolicyGroupsRequest(httpTestingController);
    const languageService = TestBed.inject(LanguageService);
    languageService.setLanguage('ru');
    fixture.detectChanges();

    const addButton = await componentHarness.getAddButton();
    await addButton.click();
    await rootLoader.getHarness(MatMenuItemHarness.with({ text: 'Message API' })).then(item => item.click());

    fixture.detectChanges();
    const addDialog = await rootLoader.getHarness(SharedPolicyGroupsAddEditDialogHarness);
    await addDialog.setName('ru-spg');
    await addDialog.setPhase('Ответ');
    await addDialog.save();

    expectCreateSharedPolicyGroupRequest(
      httpTestingController,
      fakeCreateSharedPolicyGroup({
        name: 'ru-spg',
        description: '',
        prerequisiteMessage: '',
        apiType: 'MESSAGE',
        phase: 'RESPONSE',
      }),
    );
    expectListSharedPolicyGroupsRequest(httpTestingController);
  });
});
