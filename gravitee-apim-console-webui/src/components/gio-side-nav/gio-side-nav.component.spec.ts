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
import { HttpTestingController } from '@angular/common/http/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { InteractivityChecker } from '@angular/cdk/a11y';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import {
  GioLicenseExpirationNotificationHarness,
  GioMenuSearchService,
  GioMenuSelectorHarness,
  GioMenuService,
  LICENSE_CONFIGURATION_TESTING,
} from '@gravitee/ui-particles-angular';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';

import { GioSideNavComponent, PORTAL_SETTINGS_PERMISSIONS, SIDE_NAV_GROUP_ID } from './gio-side-nav.component';
import { GioSideNavHarness } from './gio-side-nav.component.harness';
import { GioSideNavModule } from './gio-side-nav.module';

import { License } from '../../entities/license/License';
import { GioPermissionService } from '../../shared/components/gio-permission/gio-permission.service';
import { CONSTANTS_TESTING, GioTestingModule } from '../../shared/testing';
import { Constants } from '../../entities/Constants';
import { EnvironmentSettingsService } from '../../services-ngx/environment-settings.service';
import { Environment } from '../../entities/environment/environment';
import { LanguageService } from '../../shared/i18n/language.service';

const PORTAL_SETTINGS_PERMISSIONS_SET = new Set(PORTAL_SETTINGS_PERMISSIONS);

describe('GioSideNavComponent', () => {
  let fixture: ComponentFixture<GioSideNavComponent>;
  let httpTestingController: HttpTestingController;
  let loader: HarnessLoader;
  const menuSearchService = new GioMenuSearchService();

  const expirationDateInOneYear = new Date();
  expirationDateInOneYear.setFullYear(expirationDateInOneYear.getFullYear() + 1);

  beforeEach(() => {
    localStorage.removeItem('gio-console-lang');
    localStorage.removeItem('gio-reduce-state');
  });

  const init = async (
    licenseNotificationEnabled = true,
    hasLicenseMgmtPermission = true,
    scoringEnabled = true,
    hasApiProductPermission = true,
    hasPortalSettingsPermission = true,
    portalNextEnabled = true,
  ) => {
    await TestBed.configureTestingModule({
      declarations: [GioSideNavComponent],
      imports: [NoopAnimationsModule, GioTestingModule, GioSideNavModule, MatIconTestingModule],
      providers: [
        {
          provide: GioPermissionService,
          useValue: {
            hasAnyMatching: (permissions: string[]) => {
              const isMatchingLicenseNotificationPermission =
                permissions.length === 1 && permissions[0] === 'organization-license_management-r';
              if (isMatchingLicenseNotificationPermission && !hasLicenseMgmtPermission) {
                return false;
              }
              const isMatchingApiProductPermission = permissions.length === 1 && permissions[0] === 'environment-api_product-r';
              if (isMatchingApiProductPermission && !hasApiProductPermission) {
                return false;
              }
              const isMatchingPortalSettingsPermissions =
                permissions.length === PORTAL_SETTINGS_PERMISSIONS_SET.size &&
                permissions.every(p => PORTAL_SETTINGS_PERMISSIONS_SET.has(p));
              if (isMatchingPortalSettingsPermissions && !hasPortalSettingsPermission) {
                return false;
              }
              // Return default true for all the rest of 'hasMatching' permission checks
              return true;
            },
          },
        },
        {
          provide: Constants,
          useFactory: () => {
            const constants = CONSTANTS_TESTING;
            constants.org.settings = {
              ...constants.org.settings,
              licenseExpirationNotification: { enabled: licenseNotificationEnabled },
            };
            constants.org.environments = [
              {
                id: 'DEFAULT',
                name: 'default',
                hrids: [],
                organizationId: 'organizationId',
              },
            ];

            return constants;
          },
        },
        {
          provide: EnvironmentSettingsService,
          useValue: {
            get: () => {
              return of({ apiScore: { enabled: scoringEnabled }, portalNext: { access: { enabled: portalNextEnabled } } });
            },
          },
        },
        { provide: 'LicenseConfiguration', useValue: LICENSE_CONFIGURATION_TESTING },
        { provide: ActivatedRoute, useValue: { params: of({ envHrid: 'DEFAULT' }) } },
        { provide: GioMenuSearchService, useValue: menuSearchService },
      ],
    })
      .overrideProvider(InteractivityChecker, {
        useValue: {
          isFocusable: () => true, // This traps focus checks and so avoid warnings when dealing with
          isTabbable: () => true, // This traps focus checks and so avoid warnings when dealing with
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(GioSideNavComponent);
    httpTestingController = TestBed.inject(HttpTestingController);
    loader = TestbedHarnessEnvironment.loader(fixture);

    fixture.detectChanges();
  };

  afterEach(() => {
    httpTestingController.verify();
    localStorage.removeItem('gio-reduce-state');
  });

  describe('License expiration notification', () => {
    describe('when configuration is enabled', () => {
      beforeEach(async () => {
        await init();
      });
      it('should load the component with expired license', async () => {
        expectLicense({ tier: '', features: [], packs: [], expiresAt: new Date() });

        const expirationNotification = await loader.getHarness(GioLicenseExpirationNotificationHarness);
        expect(expirationNotification).toBeDefined();

        expect(await expirationNotification.getTitleText()).toEqual('Your license has expired');
      });

      it.each([expirationDateInOneYear, undefined])('should not show notification', async (date: Date) => {
        expectLicense({ tier: '', features: [], packs: [], expiresAt: date });

        const expirationNotification = await loader.getHarness(GioLicenseExpirationNotificationHarness);
        await expirationNotification
          .getTitleText()
          .then(_ => fail('Should not be able to find title'))
          .catch(err => expect(err).toBeDefined());
      });
    });

    describe('when configuration is disabled', () => {
      beforeEach(async () => {
        await init(false);
      });
      it('should not load the component with expired license', async () => {
        expectLicense({ tier: '', features: [], packs: [], expiresAt: new Date() });

        const expirationNotification = await loader.getHarnessOrNull(GioLicenseExpirationNotificationHarness);
        expect(expirationNotification).toBeNull();
      });
    });

    describe('when permission is not present', () => {
      beforeEach(async () => {
        await init(true, false);
      });
      it('should not load the component with expired license', async () => {
        expectLicense({ tier: '', features: [], packs: [], expiresAt: new Date() });

        const expirationNotification = await loader.getHarnessOrNull(GioLicenseExpirationNotificationHarness);
        expect(expirationNotification).toBeNull();
      });
    });
  });

  describe('Side nav search test', () => {
    it('should remove previous search entries and then add new ones', async () => {
      const removeSearchItemByGroupIds = jest.spyOn(menuSearchService, 'removeMenuSearchItems');
      const addSearchItemByGroupIds = jest.spyOn(menuSearchService, 'addMenuSearchItems');

      await init();
      expectLicense({ tier: '', features: [], packs: [], expiresAt: new Date() });

      expect(removeSearchItemByGroupIds).toHaveBeenCalledTimes(1);
      expect(removeSearchItemByGroupIds).toHaveBeenCalledWith([SIDE_NAV_GROUP_ID]);
      expect(addSearchItemByGroupIds).toHaveBeenCalledTimes(1);
      const searchItems: { name: string; routerLink?: string }[] = addSearchItemByGroupIds.mock.calls[0][0];
      const searchItemNames = searchItems.map(i => i.name);

      expect(searchItemNames).toEqual(
        expect.arrayContaining([
          'Dashboard',
          'APIs',
          'API Products',
          'Applications',
          'Gateways',
          'Kafka',
          'Audit',
          'Settings',
        ]),
      );
      expect(searchItemNames).not.toContain('Integrations');
      expect(searchItems.some(item => item.routerLink?.includes('/integrations'))).toBe(false);
    });

    const filterSearchNames = (query: string): string[] => {
      if (!query) {
        return [];
      }
      const filterValue = query.toLowerCase().replace(/\s/g, '');
      return menuSearchService.menuSearchItems
        .filter(item => item.name.toLowerCase().replace(/\s/g, '').includes(filterValue))
        .map(item => item.name);
    };

    it('should return Kafka and API Products for exact or partial search queries', async () => {
      await init();
      expectLicense({ tier: '', features: [], packs: [], expiresAt: new Date() });

      expect(filterSearchNames('Kafka')).toEqual(expect.arrayContaining(['Kafka']));
      expect(filterSearchNames('kaf')).toEqual(expect.arrayContaining(['Kafka']));
      expect(filterSearchNames('API Product')).toEqual(expect.arrayContaining(['API Products']));
      expect(filterSearchNames('product')).toEqual(expect.arrayContaining(['API Products']));
      expect(filterSearchNames('Integration')).not.toContain('Integrations');
      expect(filterSearchNames('integ')).not.toContain('Integrations');
    });

    it('should still return allowed items for search and keep empty search empty', async () => {
      await init();
      expectLicense({ tier: '', features: [], packs: [], expiresAt: new Date() });

      expect(filterSearchNames('')).toEqual([]);
      expect(filterSearchNames('Dashboard')).toEqual(expect.arrayContaining(['Dashboard']));
      expect(filterSearchNames('zzzz-no-such-item')).toEqual([]);
    });

    it('should rebuild Kafka and API Products search entries when language changes without Integrations', async () => {
      await init();
      expectLicense({ tier: '', features: [], packs: [], expiresAt: new Date() });

      const languageService = TestBed.inject(LanguageService);
      languageService.setLanguage('ru');
      fixture.detectChanges();
      httpTestingController.match(`${LICENSE_CONFIGURATION_TESTING.resourceURL}`).forEach(request => {
        request.flush({ tier: '', features: [], packs: [], expiresAt: new Date() });
      });

      expect(filterSearchNames('API-продукт')).toEqual(expect.arrayContaining(['API-продукты']));
      expect(filterSearchNames('Интегр')).not.toContain('Интеграции');
      expect(filterSearchNames('Kafka')).toEqual(expect.arrayContaining(['Kafka']));
      expect(filterSearchNames('Автоном')).toEqual(expect.arrayContaining(['Автономный']));
      expect(menuSearchService.menuSearchItems.some(item => item.routerLink?.includes('/integrations'))).toBe(false);

      languageService.setLanguage('en');
      fixture.detectChanges();
      httpTestingController.match(`${LICENSE_CONFIGURATION_TESTING.resourceURL}`).forEach(request => {
        request.flush({ tier: '', features: [], packs: [], expiresAt: new Date() });
      });

      expect(filterSearchNames('API Product')).toEqual(expect.arrayContaining(['API Products']));
      expect(filterSearchNames('Integration')).not.toContain('Integrations');
      expect(filterSearchNames('Kafka')).toEqual(expect.arrayContaining(['Kafka']));
    });
  });

  describe('language switching', () => {
    afterEach(() => {
      localStorage.removeItem('gio-console-lang');
    });

    it('should rebuild menu labels when language changes without reload', async () => {
      await init();
      expectLicense({ tier: '', features: [], packs: [], expiresAt: new Date() });

      expect(fixture.componentInstance.mainMenuItems.find(item => item.routerLink === './home')?.displayName).toBe('Dashboard');
      expect(fixture.componentInstance.mainMenuItems.find(item => item.routerLink === './applications')?.displayName).toBe('Applications');
      expect(fixture.componentInstance.footerMenuItems.find(item => item.routerLink === '/_organization')?.displayName).toBe(
        'Organization',
      );

      const languageService = TestBed.inject(LanguageService);
      languageService.setLanguage('ru');
      fixture.detectChanges();
      httpTestingController.match(`${LICENSE_CONFIGURATION_TESTING.resourceURL}`).forEach(request => {
        request.flush({ tier: '', features: [], packs: [], expiresAt: new Date() });
      });

      expect(fixture.componentInstance.mainMenuItems.find(item => item.routerLink === './home')?.displayName).toBe('Дашборд');
      expect(fixture.componentInstance.mainMenuItems.find(item => item.routerLink === './applications')?.displayName).toBe('Приложения');
      expect(fixture.componentInstance.mainMenuItems.find(item => item.routerLink === './settings')?.displayName).toBe('Настройки');
      expect(fixture.componentInstance.footerMenuItems.find(item => item.routerLink === '/_organization')?.displayName).toBe('Организация');

      expect(fixture.componentInstance.mainMenuItems.find(item => item.routerLink === './api-products')?.displayName).toBe('API-продукты');
      expect(fixture.componentInstance.mainMenuItems.find(item => item.routerLink === './integrations')).toBeUndefined();
      const kafkaRu = fixture.componentInstance.mainMenuItems.find(item =>
        item.items?.some(child => child.routerLink === './clusters/kafka-standalone'),
      );
      expect(kafkaRu?.displayName).toBe('Kafka');
      expect(kafkaRu?.items?.[0]?.displayName).toBe('Автономный');

      languageService.setLanguage('en');
      fixture.detectChanges();
      httpTestingController.match(`${LICENSE_CONFIGURATION_TESTING.resourceURL}`).forEach(request => {
        request.flush({ tier: '', features: [], packs: [], expiresAt: new Date() });
      });

      expect(fixture.componentInstance.mainMenuItems.find(item => item.routerLink === './api-products')?.displayName).toBe('API Products');
      expect(fixture.componentInstance.mainMenuItems.find(item => item.routerLink === './integrations')).toBeUndefined();
      expect(
        fixture.componentInstance.mainMenuItems.find(item =>
          item.items?.some(child => child.routerLink === './clusters/kafka-standalone'),
        )?.displayName,
      ).toBe('Kafka');
    });

    it('should switch the search placeholder between EN and RU without reload', async () => {
      await init();
      expectLicense({ tier: '', features: [], packs: [], expiresAt: new Date() });

      const searchInput = (): HTMLInputElement => fixture.nativeElement.querySelector('.gio-menu-search__input');
      const searchAriaLabel = (): string | null =>
        fixture.nativeElement.querySelector('gio-menu-search')?.getAttribute('aria-label') ?? null;

      expect(searchInput().placeholder).toBe('Search');
      expect(searchAriaLabel()).toBe('Search');

      const languageService = TestBed.inject(LanguageService);
      languageService.setLanguage('ru');
      fixture.detectChanges();
      httpTestingController.match(`${LICENSE_CONFIGURATION_TESTING.resourceURL}`).forEach(request => {
        request.flush({ tier: '', features: [], packs: [], expiresAt: new Date() });
      });

      expect(searchInput().placeholder).toBe('Поиск');
      expect(searchAriaLabel()).toBe('Поиск');

      languageService.setLanguage('en');
      fixture.detectChanges();
      httpTestingController.match(`${LICENSE_CONFIGURATION_TESTING.resourceURL}`).forEach(request => {
        request.flush({ tier: '', features: [], packs: [], expiresAt: new Date() });
      });

      expect(searchInput().placeholder).toBe('Search');
      expect(searchAriaLabel()).toBe('Search');
    });

    it('should translate collapse and expand labels without reload', async () => {
      await init();
      expectLicense({ tier: '', features: [], packs: [], expiresAt: new Date() });

      const collapseButton = (): HTMLElement => fixture.nativeElement.querySelector('.gio-menu-footer__collapse');
      const collapseTitle = (): string => collapseButton()?.querySelector('.gio-menu-item__title')?.textContent?.trim() ?? '';
      const flushLicenseRequests = () => {
        httpTestingController.match(`${LICENSE_CONFIGURATION_TESTING.resourceURL}`).forEach(request => {
          request.flush({ tier: '', features: [], packs: [], expiresAt: new Date() });
        });
      };

      expect(collapseTitle()).toBe('Collapse menu');
      expect(collapseButton().getAttribute('aria-label')).toBe('Collapse menu');
      expect(collapseButton().getAttribute('title')).toBe('Collapse menu');

      const languageService = TestBed.inject(LanguageService);
      languageService.setLanguage('ru');
      fixture.detectChanges();
      flushLicenseRequests();

      expect(collapseTitle()).toBe('Свернуть меню');
      expect(collapseButton().getAttribute('aria-label')).toBe('Свернуть меню');
      expect(collapseButton().getAttribute('title')).toBe('Свернуть меню');

      const menuService = TestBed.inject(GioMenuService);
      menuService.reduce(true);
      fixture.detectChanges();
      flushLicenseRequests();

      expect(collapseTitle()).toBe('Развернуть меню');
      expect(collapseButton().getAttribute('aria-label')).toBe('Развернуть меню');
      expect(collapseButton().getAttribute('title')).toBe('Развернуть меню');

      languageService.setLanguage('en');
      fixture.detectChanges();
      flushLicenseRequests();

      expect(collapseTitle()).toBe('Expand menu');
      expect(collapseButton().getAttribute('aria-label')).toBe('Expand menu');
      expect(collapseButton().getAttribute('title')).toBe('Expand menu');

      menuService.reduce(false);
      fixture.detectChanges();
      flushLicenseRequests();

      expect(collapseTitle()).toBe('Collapse menu');
      expect(collapseButton().getAttribute('aria-label')).toBe('Collapse menu');
      expect(collapseButton().getAttribute('title')).toBe('Collapse menu');
    });
  });

  describe('settings check', () => {
    it('should hide scoring elements when feature is disabled', async () => {
      await init(true, true, false);
      expectLicense({ tier: '', features: [], packs: [], expiresAt: new Date() });

      expect(fixture.componentInstance.mainMenuItems.find(item => item.displayName === 'API Score')).toBeUndefined();
    });

    it('should show scoring elements when feature is enabled', async () => {
      await init(true, true, true);
      expectLicense({ tier: '', features: [], packs: [], expiresAt: new Date() });

      expect(fixture.componentInstance.mainMenuItems.find(item => item.displayName === 'API Score')).toEqual({
        category: 'API Score',
        displayName: 'API Score',
        icon: 'gio:shield-check',
        permissions: ['environment-integration-r'],
        routerLink: './api-score',
      });
    });

    it('should show Kafka and API Products when permission checks pass and hide Integrations', async () => {
      await init();
      expectLicense({ tier: '', features: [], packs: [], expiresAt: new Date() });

      const routerLinks = fixture.componentInstance.mainMenuItems.map(item => item.routerLink);
      const routerBasePaths = fixture.componentInstance.mainMenuItems.map(item => item.routerBasePath);

      expect(routerLinks).toContain('./api-products');
      expect(routerLinks).not.toContain('./integrations');
      expect(routerBasePaths.some(path => path?.endsWith('/clusters'))).toBe(true);
      expect(fixture.componentInstance.mainMenuItems.find(item => item.displayName === 'Kafka')).toBeDefined();
      expect(fixture.componentInstance.mainMenuItems.find(item => item.displayName === 'API Products')?.routerLink).toBe('./api-products');
      expect(fixture.componentInstance.mainMenuItems.find(item => item.routerLink === './integrations')).toBeUndefined();
      expect(
        fixture.componentInstance.mainMenuItems.find(item => item.displayName === 'Kafka')?.items?.some(
          child => child.routerLink === './clusters/kafka-standalone',
        ),
      ).toBe(true);

      expect(routerLinks).toEqual(expect.arrayContaining(['./home', './apis', './applications', './gateways', './audit', './settings']));
    });

    it('should hide API Products when the user lacks environment-api_product-r', async () => {
      await init(true, true, true, false);
      expectLicense({ tier: '', features: [], packs: [], expiresAt: new Date() });

      expect(fixture.componentInstance.mainMenuItems.find(item => item.routerLink === './api-products')).toBeUndefined();
      expect(fixture.componentInstance.mainMenuItems.find(item => item.routerLink === './integrations')).toBeUndefined();
    });

    it('should hide the Environment selector while keeping the current environment context', async () => {
      await init();
      expectLicense({ tier: '', features: [], packs: [], expiresAt: new Date() });

      expect(await loader.getHarnessOrNull(GioMenuSelectorHarness)).toBeNull();
      expect(fixture.nativeElement.querySelector('gio-menu-selector')).toBeNull();
      expect(fixture.componentInstance.currentEnv).toEqual(
        expect.objectContaining({
          id: 'DEFAULT',
        }),
      );
      expect(fixture.componentInstance.environments).toEqual([{ value: 'DEFAULT', displayValue: 'default' }]);
    });

    it('should show Portal Settings menu item when user has required portal permissions', async () => {
      await init(true, true, false, true, true);
      expectLicense({ tier: '', features: [], packs: [], expiresAt: new Date() });

      const portalSettingsItem = fixture.componentInstance.mainMenuItems.find(item => item.displayName === 'Portal Settings');
      expect(portalSettingsItem).toBeDefined();
      expect(portalSettingsItem?.routerLink).toBe('./_portal');
      expect(portalSettingsItem?.icon).toBe('gio:monitor');
      expect(portalSettingsItem?.externalLink).toBe(true);
    });

    it('should hide Portal Settings menu item when user lacks all portal permissions', async () => {
      await init(true, true, false, true, false);
      expectLicense({ tier: '', features: [], packs: [], expiresAt: new Date() });

      const portalSettingsItem = fixture.componentInstance.mainMenuItems.find(item => item.displayName === 'Portal Settings');
      expect(portalSettingsItem).toBeUndefined();
    });

    it('should hide Portal Settings menu item when portal next is disabled', async () => {
      await init(true, true, true, true, true, false);
      expectLicense({ tier: '', features: [], packs: [], expiresAt: new Date() });

      const portalSettingsItem = fixture.componentInstance.mainMenuItems.find(item => item.displayName === 'Portal Settings');
      expect(portalSettingsItem).toBeUndefined();
    });
  });

  describe('navigation race condition regression (APIM-14285)', () => {
    it('should set currentEnv before environmentSettingsService.get resolves so menu paths use correct env hrid', async () => {
      const envSettingsSubject = new Subject<{ apiScore: { enabled: boolean } }>();
      const envHrid = 'my-env';

      await TestBed.configureTestingModule({
        declarations: [GioSideNavComponent],
        imports: [NoopAnimationsModule, GioTestingModule, GioSideNavModule, MatIconTestingModule],
        providers: [
          {
            provide: GioPermissionService,
            useValue: { hasAnyMatching: () => true },
          },
          {
            provide: Constants,
            useFactory: () => {
              const constants = CONSTANTS_TESTING;
              constants.org.settings = {
                ...constants.org.settings,
                licenseExpirationNotification: { enabled: true },
              };
              constants.org.currentEnv = { id: 'DEFAULT', name: 'default', hrids: [envHrid], organizationId: 'org' } as any;
              constants.org.environments = [{ id: 'DEFAULT', name: 'default', hrids: [envHrid], organizationId: 'org' }];
              return constants;
            },
          },
          {
            provide: EnvironmentSettingsService,
            useValue: { get: () => envSettingsSubject.asObservable() },
          },
          { provide: 'LicenseConfiguration', useValue: LICENSE_CONFIGURATION_TESTING },
          { provide: ActivatedRoute, useValue: { params: of({ envHrid }) } },
          { provide: GioMenuSearchService, useValue: menuSearchService },
        ],
      })
        .overrideProvider(InteractivityChecker, {
          useValue: { isFocusable: () => true, isTabbable: () => true },
        })
        .compileComponents();

      const fix = TestBed.createComponent(GioSideNavComponent);
      const ctrl = TestBed.inject(HttpTestingController);

      fix.detectChanges();
      ctrl.expectOne(`${LICENSE_CONFIGURATION_TESTING.resourceURL}`).flush({ tier: '', features: [], packs: [], expiresAt: new Date() });

      // Settings haven't resolved yet — menu built without envSettings
      const observabilityBefore = fix.componentInstance.mainMenuItems.find(i => i.displayName === 'Observability');
      expect(observabilityBefore?.routerBasePath).toContain(envHrid);

      // Now resolve env settings
      envSettingsSubject.next({ apiScore: { enabled: true } });
      fix.detectChanges();

      // After settings resolve, menu is rebuilt — paths must still use correct env hrid
      const observability = fix.componentInstance.mainMenuItems.find(i => i.displayName === 'Observability');
      const analytics = fix.componentInstance.mainMenuItems.find(i => i.displayName === 'Analytics');
      const kafka = fix.componentInstance.mainMenuItems.find(i => i.routerBasePath?.endsWith('/clusters'));

      expect(observability?.routerBasePath).toBe(`/${envHrid}/observability`);
      expect(analytics?.routerBasePath).toBe(`/${envHrid}/analytics`);
      expect(kafka?.routerBasePath).toBe(`/${envHrid}/clusters`);

      ctrl.verify();
    });
  });

  describe('environment segment in menu paths (APIM-14748)', () => {
    const buildMenuForEnvironment = async (environment: Environment, envHrid: string) => {
      await TestBed.configureTestingModule({
        declarations: [GioSideNavComponent],
        imports: [NoopAnimationsModule, GioTestingModule, GioSideNavModule, MatIconTestingModule],
        providers: [
          { provide: GioPermissionService, useValue: { hasAnyMatching: () => true } },
          {
            provide: Constants,
            useFactory: () => ({
              ...CONSTANTS_TESTING,
              org: {
                ...CONSTANTS_TESTING.org,
                settings: { ...CONSTANTS_TESTING.org.settings, licenseExpirationNotification: { enabled: true } },
                currentEnv: environment,
                environments: [environment],
              },
            }),
          },
          {
            provide: EnvironmentSettingsService,
            useValue: { get: () => of({ apiScore: { enabled: true }, portalNext: { access: { enabled: true } } }) },
          },
          { provide: 'LicenseConfiguration', useValue: LICENSE_CONFIGURATION_TESTING },
          { provide: ActivatedRoute, useValue: { params: of({ envHrid }) } },
          { provide: GioMenuSearchService, useValue: menuSearchService },
        ],
      })
        .overrideProvider(InteractivityChecker, {
          useValue: { isFocusable: () => true, isTabbable: () => true },
        })
        .compileComponents();

      const fix = TestBed.createComponent(GioSideNavComponent);
      httpTestingController = TestBed.inject(HttpTestingController);

      fix.detectChanges();
      httpTestingController
        .expectOne(`${LICENSE_CONFIGURATION_TESTING.resourceURL}`)
        .flush({ tier: '', features: [], packs: [], expiresAt: new Date() });
      fix.detectChanges();

      return fix;
    };

    // The guard resolves the segment to either an hrid or the environment id, so the menu must mirror
    // whichever one the URL carries rather than re-deriving one from the environment.
    it.each([
      ['no hrids', undefined, 'DEFAULT'],
      ['empty hrids', [], 'DEFAULT'],
      ['a single hrid', ['my-env'], 'my-env'],
    ])('should build group base paths from the URL segment when the environment has %s', async (_label, hrids, envHrid) => {
      const fix = await buildMenuForEnvironment({ id: 'DEFAULT', name: 'default', hrids, organizationId: 'org' }, envHrid);

      const basePathOf = (displayName: string) =>
        fix.componentInstance.mainMenuItems.find(i => i.displayName === displayName)?.routerBasePath;

      expect(basePathOf('Observability')).toBe(`/${envHrid}/observability`);
      expect(basePathOf('Analytics')).toBe(`/${envHrid}/analytics`);
      expect(basePathOf('Kafka')).toBe(`/${envHrid}/clusters`);
    });

    it('should build menu search router links from the URL segment', async () => {
      const addMenuSearchItems = jest.spyOn(menuSearchService, 'addMenuSearchItems');
      addMenuSearchItems.mockClear();

      await buildMenuForEnvironment({ id: 'DEFAULT', name: 'default', hrids: undefined, organizationId: 'org' }, 'DEFAULT');

      const searchItems: { name: string; routerLink: string }[] = addMenuSearchItems.mock.calls[0][0];
      expect(searchItems.find(i => i.name === 'Dashboard')?.routerLink).toBe('/DEFAULT/home');

      addMenuSearchItems.mockRestore();
    });
  });

  describe('target attribute on menu item anchors', () => {
    let sideNavHarness: GioSideNavHarness;

    beforeEach(async () => {
      await init();
      // Use a non-expiring license to prevent GioLicenseExpirationNotificationComponent from
      // rendering its own <a target="_blank"> "Contact Gravitee" link (shown when daysRemaining <= 30).
      expectLicense({ tier: '', features: [], packs: [], expiresAt: expirationDateInOneYear });
      sideNavHarness = await TestbedHarnessEnvironment.harnessForFixture(fixture, GioSideNavHarness);
      fixture.detectChanges();
    });

    it('should not add target or rel attribute to anchor elements when menu items have no target', async () => {
      fixture.componentInstance.mainMenuItems = [{ icon: 'gio:home', routerLink: './test', displayName: 'Test', category: 'test' }];
      fixture.componentInstance.footerMenuItems = [];
      fixture.detectChanges();

      expect(await sideNavHarness.countAnchorsWithAnyTarget()).toBe(0);
      expect(await sideNavHarness.countAnchorsWithAnyRel()).toBe(0);
    });

    it('should set target="_blank" and rel="noopener noreferrer" on anchor when main menu item has target set', async () => {
      fixture.componentInstance.mainMenuItems = [
        { icon: 'gio:home', routerLink: './test', displayName: 'Test', category: 'test', target: '_blank' },
      ];
      fixture.detectChanges();

      const anchors = await sideNavHarness.getAnchorsWithTarget('_blank');
      expect(anchors.length).toBe(1);
      expect(await anchors[0].getAttribute('rel')).toBe('noopener noreferrer');
    });

    it('should not set target or rel on anchor when main menu item target is absent', async () => {
      fixture.componentInstance.mainMenuItems = [{ icon: 'gio:home', routerLink: './test', displayName: 'Test', category: 'test' }];
      fixture.detectChanges();

      expect(await sideNavHarness.countAnchorsWithAnyTarget()).toBe(0);
      expect(await sideNavHarness.countAnchorsWithAnyRel()).toBe(0);
    });

    it('should set target="_blank" and rel="noopener noreferrer" on anchor when submenu child item has target set', async () => {
      fixture.componentInstance.mainMenuItems = [
        {
          displayName: 'Group',
          category: 'test',
          routerBasePath: '/test/group',
          items: [{ displayName: 'Child', routerLink: './child', category: 'test', target: '_blank' }],
        },
      ];
      fixture.detectChanges();

      const anchors = await sideNavHarness.getAnchorsWithTarget('_blank');
      expect(anchors.length).toBe(1);
      expect(await anchors[0].getAttribute('rel')).toBe('noopener noreferrer');
    });

    it('should set target="_blank" and rel="noopener noreferrer" on anchor when footer menu item has target set', async () => {
      fixture.componentInstance.mainMenuItems = [];
      fixture.componentInstance.footerMenuItems = [
        { icon: 'gio:building', routerLink: './test-footer', displayName: 'Test Footer', category: 'test', target: '_blank' },
      ];
      fixture.detectChanges();

      const anchors = await sideNavHarness.getAnchorsWithTarget('_blank');
      expect(anchors.length).toBe(1);
      expect(await anchors[0].getAttribute('rel')).toBe('noopener noreferrer');
    });

    it('should not set rel on footer anchor when target is absent', async () => {
      fixture.componentInstance.mainMenuItems = [];
      fixture.componentInstance.footerMenuItems = [
        { icon: 'gio:building', routerLink: './test-footer', displayName: 'Test Footer', category: 'test' },
      ];
      fixture.detectChanges();

      expect(await sideNavHarness.countAnchorsWithAnyRel()).toBe(0);
    });
  });

  function expectLicense(license: License) {
    httpTestingController.expectOne(`${LICENSE_CONFIGURATION_TESTING.resourceURL}`).flush(license);
  }
});
