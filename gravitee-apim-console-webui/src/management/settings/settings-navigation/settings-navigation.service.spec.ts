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
import { TestBed } from '@angular/core/testing';

import { SettingsNavigationService } from './settings-navigation.service';

import { GioPermissionService } from '../../../shared/components/gio-permission/gio-permission.service';
import { GioTestingModule } from '../../../shared/testing';
import { LanguageService } from '../../../shared/i18n/language.service';

describe('SettingsNavigationService', () => {
  let service: SettingsNavigationService;
  const envId = 'envId';

  afterEach(() => {
    localStorage.removeItem('gio-console-lang');
  });

  const init = (hasAnyMatching = true) => {
    localStorage.removeItem('gio-console-lang');
    TestBed.configureTestingModule({
      imports: [GioTestingModule],
      providers: [
        {
          provide: GioPermissionService,
          useValue: {
            hasAnyMatching: () => hasAnyMatching,
          },
        },
      ],
    });
    service = TestBed.inject(SettingsNavigationService);
  };

  it('should map routes to search items', () => {
    init();

    const menuSearchItems = service.getSettingsNavigationSearchItems(envId);

    expect(menuSearchItems).toHaveLength(17);
    expect(menuSearchItems).toEqual(
      expect.arrayContaining(
        [
          'Analytics',
          'API Portal Information',
          'API Quality',
          'Authentication',
          'Categories',
          'Client Registration',
          'Documentation',
          'Metadata',
          'Settings',
          'Theme',
          'Featured APIs',
          'API Logging',
          'Dictionaries',
          'Shared Policy Groups',
          'User Fields',
          'Groups',
          'Notification settings',
        ].map(name =>
          expect.objectContaining({
            name,
            routerLink: expect.not.stringContaining('./') && expect.stringContaining(`${envId}/settings`),
          }),
        ),
      ),
    );
  });

  it('switches search item names EN \u2192 RU \u2192 EN without reload', () => {
    init();
    const languageService = TestBed.inject(LanguageService);

    expect(service.getSettingsNavigationSearchItems(envId).map(item => item.name)).toEqual(
      expect.arrayContaining(['Analytics', 'Groups', 'Notification settings']),
    );

    languageService.setLanguage('ru');
    expect(service.getSettingsNavigationSearchItems(envId).map(item => item.name)).toEqual(
      expect.arrayContaining(['Аналитика', 'Группы', 'Настройки уведомлений']),
    );
    expect(service.getSettingsNavigationSearchItems(envId).every(item => item.routerLink.includes(`${envId}/settings`))).toBe(true);

    languageService.setLanguage('en');
    expect(service.getSettingsNavigationSearchItems(envId).map(item => item.name)).toEqual(
      expect.arrayContaining(['Analytics', 'Groups', 'Notification settings']),
    );
  });

  it('should not map any route to search items', () => {
    init(false);

    const menuSearchItems = service.getSettingsNavigationSearchItems(envId);

    expect(menuSearchItems).toStrictEqual([]);
  });

  it('should include Documentation when permission is granted', () => {
    init();
    const menuSearchItems = service.getSettingsNavigationSearchItems(envId);
    const documentationItem = menuSearchItems.find(i => i.name === 'Documentation');
    expect(documentationItem).toBeDefined();
    expect(documentationItem?.routerLink).toContain(`${envId}/settings/documentation`);
  });

  it('should exclude Documentation when permission is not granted', () => {
    init(false);
    const menuSearchItems = service.getSettingsNavigationSearchItems(envId);
    const documentationItem = menuSearchItems.find(i => i.name === 'Documentation');
    expect(documentationItem).toBeUndefined();
  });

  it('should exclude Documentation when permission is not granted', () => {
    // Mock hasAnyMatching to deny only "environment-documentation-r"
    TestBed.configureTestingModule({
      imports: [GioTestingModule],
      providers: [
        {
          provide: GioPermissionService,
          useValue: {
            hasAnyMatching: (permissions: string[]) => !permissions.includes('environment-documentation-r'),
          },
        },
      ],
    });
    service = TestBed.inject(SettingsNavigationService);
    const menuSearchItems = service.getSettingsNavigationSearchItems(envId);
    // Documentation should NOT exist
    const documentationItem = menuSearchItems.find(i => i.name === 'Documentation');
    expect(documentationItem).toBeUndefined();
    // Now we expect 16 items (17-1)
    expect(menuSearchItems).toHaveLength(16);
    expect(menuSearchItems.some(i => i.routerLink.includes('/documentation'))).toBe(false);
  });
});
