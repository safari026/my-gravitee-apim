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
import { GioLicenseService, GioLicenseTestingModule } from '@gravitee/ui-particles-angular';
import { of } from 'rxjs';

import { OrgNavigationComponent } from './org-navigation.component';

import { OrganizationSettingsModule } from '../organization-settings.module';
import { CONSTANTS_TESTING, GioTestingModule } from '../../../shared/testing';
import { Constants } from '../../../entities/Constants';
import { GioPermissionService, GioTestingPermissionProvider } from '../../../shared/components/gio-permission/gio-permission.service';
import { CurrentUserService } from '../../../services-ngx/current-user.service';
import { TaskService } from '../../../services-ngx/task.service';
import { UiCustomizationService } from '../../../services-ngx/ui-customization.service';
import { fakeUser } from '../../../entities/user/user.fixture';

describe('OrgNavigationComponent', () => {
  let fixture: ComponentFixture<OrgNavigationComponent>;
  let component: OrgNavigationComponent;
  const constantsProvider = {
    provide: Constants,
    useValue: {
      ...CONSTANTS_TESTING,
      org: {
        ...CONSTANTS_TESTING.org,
        settings: {
          ...CONSTANTS_TESTING.org.settings,
          management: { support: { enabled: false } },
          newsletter: { enabled: false },
        },
      },
    },
  };

  function createComponent(hasAnyMatching: boolean) {
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, GioTestingModule, OrganizationSettingsModule, GioLicenseTestingModule],
      providers: [
        {
          provide: GioPermissionService,
          useValue: {
            hasAnyMatching: () => hasAnyMatching,
          },
        },
        {
          provide: CurrentUserService,
          useValue: {
            current: () => of(fakeUser()),
            getUserPictureUrl: () => 'avatar-url',
          },
        },
        constantsProvider,
        {
          provide: TaskService,
          useValue: { getTasksAutoFetch: () => of({ page: { total_elements: 0 } }) },
        },
        {
          provide: GioLicenseService,
          useValue: {
            isOEM$: () => of(false),
            isMissingFeature$: () => of(false),
            getFeatureInfo: () => ({}),
            getTrialURL: () => '',
            openDialog: () => undefined,
          },
        },
        {
          provide: UiCustomizationService,
          useValue: { getConsoleCustomization: () => of(null) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrgNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  function createComponentWithPermissions(permissions: string[]) {
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, GioTestingModule, OrganizationSettingsModule, GioLicenseTestingModule],
      providers: [
        {
          provide: GioTestingPermissionProvider,
          useValue: permissions,
        },
        {
          provide: CurrentUserService,
          useValue: {
            current: () => of(fakeUser()),
            getUserPictureUrl: () => 'avatar-url',
          },
        },
        constantsProvider,
        {
          provide: TaskService,
          useValue: { getTasksAutoFetch: () => of({ page: { total_elements: 0 } }) },
        },
        {
          provide: GioLicenseService,
          useValue: {
            isOEM$: () => of(false),
            isMissingFeature$: () => of(false),
            getFeatureInfo: () => ({}),
            getTrialURL: () => '',
            openDialog: () => undefined,
          },
        },
        {
          provide: UiCustomizationService,
          useValue: { getConsoleCustomization: () => of(null) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrgNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('with all permissions', () => {
    beforeEach(() => {
      createComponent(true);
    });

    it('should build group items', () => {
      expect(component.groupItems.length).toEqual(6);
      expect(component.groupItems.map(item => item.title)).toEqual([
        'Console',
        'User Management',
        'Gateway',
        'Notifications',
        'Audit',
        'Gravitee Cloud',
      ]);
    });

    it('shows the shared header once and keeps the organization menu', () => {
      expect(fixture.nativeElement.querySelectorAll('gio-top-nav')).toHaveLength(1);
      expect(fixture.nativeElement.querySelectorAll('[data-testid="language-toggle"]')).toHaveLength(1);
      expect(fixture.nativeElement.querySelectorAll('[data-testid="top-nav-user-menu-button"]')).toHaveLength(1);
      expect(fixture.nativeElement.textContent).not.toContain('Developer Portal');
      expect(fixture.nativeElement.textContent).toContain('Organization');
    });
  });

  describe('without any permission', () => {
    beforeEach(() => {
      createComponentWithPermissions(['organization-settings-r']);
    });

    it('should build group items', () => {
      expect(component.groupItems.length).toEqual(2);
      expect(component.groupItems.map(item => item.title)).toEqual(['Console', 'Audit']);
    });
  });
});
