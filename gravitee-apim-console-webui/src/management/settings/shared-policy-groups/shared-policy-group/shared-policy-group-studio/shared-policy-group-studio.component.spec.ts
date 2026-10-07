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
import { ActivatedRoute } from '@angular/router';
import { HttpTestingController } from '@angular/common/http/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { importProvidersFrom } from '@angular/core';
import { GioFormJsonSchemaModule } from '@gravitee/ui-particles-angular';

import { SharedPolicyGroupStudioComponent } from './shared-policy-group-studio.component';
import { SharedPolicyGroupStudioHarness } from './shared-policy-group-studio.harness';

import { CONSTANTS_TESTING, GioTestingModule } from '../../../../../shared/testing';
import { LanguageService } from '../../../../../shared/i18n/language.service';
import { GioTestingPermissionProvider } from '../../../../../shared/components/gio-permission/gio-permission.service';
import {
  fakeSharedPolicyGroup,
  fakePoliciesPlugin,
  fakePolicyPlugin,
  fakeUpdateSharedPolicyGroup,
  SharedPolicyGroup,
} from '../../../../../entities/management-api-v2';
import { SharedPolicyGroupsAddEditDialogHarness } from '../../shared-policy-groups-add-edit-dialog/shared-policy-groups-add-edit-dialog.harness';
import { LanguageService } from '../../../../../shared/i18n/language.service';
import {
  expectDeploySharedPolicyGroupRequest,
  expectGetSharedPolicyGroupRequest,
  expectUndeploySharedPolicyGroupRequest,
  expectUpdateSharedPolicyGroupRequest,
} from '../../../../../services-ngx/shared-policy-groups.service.spec';

describe('SharedPolicyGroupStudioComponent', () => {
  const SHARED_POLICY_GROUP_ID = 'sharedPolicyGroupId';

  let fixture: ComponentFixture<SharedPolicyGroupStudioComponent>;
  let componentHarness: SharedPolicyGroupStudioHarness;
  let httpTestingController: HttpTestingController;
  let rootLoader: HarnessLoader;

  beforeEach(async () => {
    localStorage.removeItem('gio-console-lang');
    await TestBed.configureTestingModule({
      imports: [SharedPolicyGroupStudioComponent, GioTestingModule, NoopAnimationsModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { params: { sharedPolicyGroupId: SHARED_POLICY_GROUP_ID } } },
        },
        {
          provide: GioTestingPermissionProvider,
          useValue: [
            'environment-shared_policy_group-c',
            'environment-shared_policy_group-r',
            'environment-shared_policy_group-u',
            'environment-shared_policy_group-d',
          ],
        },
        importProvidersFrom(GioFormJsonSchemaModule),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SharedPolicyGroupStudioComponent);
    httpTestingController = TestBed.inject(HttpTestingController);
    rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);

    componentHarness = await TestbedHarnessEnvironment.harnessForFixture(fixture, SharedPolicyGroupStudioHarness);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.removeItem('gio-console-lang');
    httpTestingController.verify();
  });

  it('should show English chrome by default', async () => {
    expectSharedPolicyGroup();
    expectGetPolicies();
    expect(fixture.nativeElement.textContent).toContain('Proxy API');
    expect(fixture.nativeElement.textContent).toContain('Request');
    expect(fixture.nativeElement.textContent).toContain('Save');
    expect(fixture.nativeElement.textContent).toContain('Deploy');
  });

  it('should switch chrome to Russian and back without recreating the component', async () => {
    expectSharedPolicyGroup();
    expectGetPolicies();
    const languageService = TestBed.inject(LanguageService);

    languageService.setLanguage('ru');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Запрос');
    expect(fixture.nativeElement.textContent).toContain('Сохранить');
    expect(fixture.nativeElement.textContent).toContain('Развернуть');
    expect(fixture.nativeElement.textContent).not.toContain('Deploy');

    languageService.setLanguage('en');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Request');
    expect(fixture.nativeElement.textContent).toContain('Deploy');
  });

  it('should display empty request phase', async () => {
    expectSharedPolicyGroup();
    expectGetPolicies();
    const studio = await componentHarness.getPolicyGroupStudio();

    const phase = await studio.getPolicyGroupPhase();
    expect(await phase.getSteps()).toEqual([
      {
        name: 'Incoming request',
        type: 'connector',
      },
      {
        name: 'Outgoing request',
        type: 'connector',
      },
    ]);
  });

  it('should edit shared policy group', async () => {
    expectSharedPolicyGroup();
    expectGetPolicies();
    await componentHarness.clickEditButton();

    fixture.detectChanges();
    const addDialog = await rootLoader.getHarness(SharedPolicyGroupsAddEditDialogHarness);

    expect(await addDialog.getName()).toEqual('Shared Policy Group');
    expect(await addDialog.getDescription()).toEqual('');
    expect(await addDialog.getPrerequisiteMessage()).toEqual('');
    expect(await addDialog.getPhase()).toEqual('Request');

    await addDialog.setName('New name');
    await addDialog.setDescription('New description');
    await addDialog.setPrerequisiteMessage('New prerequisite message');
    await addDialog.save();

    expectUpdateSharedPolicyGroupRequest(
      httpTestingController,
      SHARED_POLICY_GROUP_ID,
      fakeUpdateSharedPolicyGroup({
        name: 'New name',
        description: 'New description',
        prerequisiteMessage: 'New prerequisite message',
      }),
    );

    expectGetSharedPolicyGroupRequest(
      httpTestingController,
      fakeSharedPolicyGroup({
        id: SHARED_POLICY_GROUP_ID,
        name: 'Shared Policy Group',
        description: '',
        steps: [],
      }),
    );
  });

  it('should add policy to phase', async () => {
    expectSharedPolicyGroup();
    expectGetPolicies();
    const studio = await componentHarness.getPolicyGroupStudio();

    const phase = await studio.getPolicyGroupPhase();

    await phase.addStep(0, {
      policyName: fakePolicyPlugin().name,
      description: 'What does the 🦊 say?',
      waitForInitHttpRequestCompletionCb: async () => {
        httpTestingController.expectOne(`${CONSTANTS_TESTING.org.v2BaseURL}/plugins/policies/${fakePolicyPlugin().id}/schema`).flush({});
        httpTestingController
          .expectOne(`${CONSTANTS_TESTING.org.v2BaseURL}/plugins/policies/${fakePolicyPlugin().id}/documentation-ext`)
          .flush('');
      },
    });

    await componentHarness.save();

    expectUpdateSharedPolicyGroupRequest(
      httpTestingController,
      SHARED_POLICY_GROUP_ID,
      fakeUpdateSharedPolicyGroup({
        name: 'Shared Policy Group',
        description: '',
        steps: [
          {
            policy: 'test-policy',
            name: 'Test policy',
            description: 'What does the 🦊 say?',
            condition: undefined,
            messageCondition: undefined,
            configuration: {},
            enabled: true,
          },
        ],
      }),
    );

    expectGetSharedPolicyGroupRequest(
      httpTestingController,
      fakeSharedPolicyGroup({
        id: SHARED_POLICY_GROUP_ID,
        name: 'Shared Policy Group',
        description: '',
        steps: [],
      }),
    );
  });

  it.each([<Partial<SharedPolicyGroup>>{ lifecycleState: 'UNDEPLOYED' }, <Partial<SharedPolicyGroup>>{ lifecycleState: 'PENDING' }])(
    'should display Deploy button: %p',
    async (modifier: Partial<SharedPolicyGroup>) => {
      expectSharedPolicyGroup(modifier);
      expectGetPolicies();
      const deployButton = await componentHarness.getDeployButton();

      expect(await deployButton.isDisabled()).toEqual(false);
    },
  );

  it('should deploy shared policy group', async () => {
    expectSharedPolicyGroup({ lifecycleState: 'UNDEPLOYED' });
    expectGetPolicies();
    const deployButton = await componentHarness.getDeployButton();
    await deployButton.click();

    expectDeploySharedPolicyGroupRequest(httpTestingController, SHARED_POLICY_GROUP_ID);
    expectSharedPolicyGroup();
  });

  it.each([<Partial<SharedPolicyGroup>>{ lifecycleState: 'DEPLOYED' }, <Partial<SharedPolicyGroup>>{ lifecycleState: 'PENDING' }])(
    'should display Undeploy button: %p',
    async (modifier: Partial<SharedPolicyGroup>) => {
      expectSharedPolicyGroup(modifier);
      expectGetPolicies();
      const undeployButton = await componentHarness.getUndeployButton();

      expect(await undeployButton.isDisabled()).toEqual(false);
    },
  );

  it('should undeploy shared policy group', async () => {
    expectSharedPolicyGroup({ lifecycleState: 'DEPLOYED' });
    expectGetPolicies();
    const undeployButton = await componentHarness.getUndeployButton();
    await undeployButton.click();

    expectUndeploySharedPolicyGroupRequest(httpTestingController, SHARED_POLICY_GROUP_ID);
    expectSharedPolicyGroup();
  });

  it('should keep unsaved step modification even after deploy', async () => {
    expectSharedPolicyGroup({ lifecycleState: 'DEPLOYED' });
    expectGetPolicies();

    // Add a step
    const studio = await componentHarness.getPolicyGroupStudio();
    const phaseToAdd = await studio.getPolicyGroupPhase();
    await phaseToAdd.addStep(0, {
      policyName: fakePolicyPlugin().name,
      description: 'What does the 🦊 say?',
      waitForInitHttpRequestCompletionCb: async () => {
        httpTestingController.expectOne(`${CONSTANTS_TESTING.org.v2BaseURL}/plugins/policies/${fakePolicyPlugin().id}/schema`).flush({});
        httpTestingController
          .expectOne(`${CONSTANTS_TESTING.org.v2BaseURL}/plugins/policies/${fakePolicyPlugin().id}/documentation-ext`)
          .flush('');
      },
    });

    // Click on deploy and expect deploy request
    const undeployButton = await componentHarness.getUndeployButton();
    await undeployButton.click();
    expectUndeploySharedPolicyGroupRequest(httpTestingController, SHARED_POLICY_GROUP_ID);
    expectSharedPolicyGroup();

    // Expect save button to be enabled and check that the step is still there
    const saveButton = await componentHarness.getSaveButton();
    expect(await saveButton.isDisabled()).toEqual(false);
    const phase = await studio.getPolicyGroupPhase();
    expect(await phase.getSteps()).toStrictEqual(
      expect.arrayContaining([
        {
          description: 'What does the 🦊 say?',
          hasCondition: false,
          name: 'Test policy',
          type: 'step',
        },
      ]),
    );
  });

  function expectSharedPolicyGroup(modifier?: Partial<SharedPolicyGroup> | ((base: SharedPolicyGroup) => SharedPolicyGroup)) {
    expectGetSharedPolicyGroupRequest(
      httpTestingController,
      fakeSharedPolicyGroup({
        ...modifier,
        id: SHARED_POLICY_GROUP_ID,
        name: 'Shared Policy Group',
        description: '',
        steps: [],
      }),
    );
    fixture.detectChanges();
  }

  function expectGetPolicies() {
    httpTestingController
      .expectOne({
        url: `${CONSTANTS_TESTING.org.v2BaseURL}/plugins/policies`,
        method: 'GET',
      })
      .flush([fakePolicyPlugin(), ...fakePoliciesPlugin()]);
  }
});
