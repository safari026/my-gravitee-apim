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
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { InteractivityChecker } from '@angular/cdk/a11y';
import { MatMenuHarness } from '@angular/material/menu/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { GioUserMenuComponent } from './gio-user-menu.component';
import { GioUserMenuModule } from './gio-user-menu.module';

import { AuthService } from '../../auth/auth.service';
import { Constants } from '../../entities/Constants';
import { fakeUser } from '../../entities/user/user.fixture';
import { CurrentUserService } from '../../services-ngx/current-user.service';
import { LanguageService } from '../../shared/i18n/language.service';
import { CONSTANTS_TESTING, GioTestingModule } from '../../shared/testing';

describe('GioUserMenuComponent', () => {
  let fixture: ComponentFixture<GioUserMenuComponent>;
  let loader: HarnessLoader;
  let router: Router;
  const logout = jest.fn(() => of(undefined));
  const user = fakeUser({
    firstname: 'Bruce',
    lastname: 'Wayne',
    displayName: 'Bruce Wayne',
    email: 'me@batman.com',
  });

  const init = async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, GioTestingModule, GioUserMenuModule],
      providers: [
        {
          provide: Constants,
          useFactory: () => ({
            ...CONSTANTS_TESTING,
            org: {
              ...CONSTANTS_TESTING.org,
              settings: {
                ...CONSTANTS_TESTING.org.settings,
                management: { support: { enabled: true } },
                newsletter: { enabled: true },
              },
            },
          }),
        },
        {
          provide: CurrentUserService,
          useValue: {
            current: () => of(user),
            getUserPictureUrl: () => 'avatar-url',
          },
        },
        {
          provide: AuthService,
          useValue: { logout },
        },
        { provide: ActivatedRoute, useValue: {} },
      ],
    })
      .overrideProvider(InteractivityChecker, {
        useValue: {
          isFocusable: () => true,
          isTabbable: () => true,
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(GioUserMenuComponent);
    fixture.componentInstance.hasAlert = true;
    fixture.componentInstance.userTaskCount = 3;
    loader = TestbedHarnessEnvironment.loader(fixture);
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
  };

  beforeEach(() => {
    localStorage.removeItem('gio-console-lang');
    logout.mockClear();
  });

  afterEach(() => {
    localStorage.removeItem('gio-console-lang');
  });

  const openMenu = async () => {
    const menu = await loader.getHarness(MatMenuHarness);
    await menu.open();
    return menu;
  };

  const getMenuTexts = async (menu: MatMenuHarness): Promise<string[]> => {
    const items = await menu.getItems();
    return Promise.all(items.map(item => item.getText()));
  };

  it('should show English labels by default and keep user data untranslated', async () => {
    await init();

    const menu = await openMenu();
    const texts = await getMenuTexts(menu);
    const joined = texts.join(' ');

    expect(joined).toContain('My Account');
    expect(joined).toContain('Tasks');
    expect(joined).toContain('Support');
    expect(joined).toContain('Sign Out');
    expect(joined).toContain('3');
    expect(joined).toContain('Bruce W.');
    expect(joined).toContain('me@batman.com');
  });

  it('should switch static labels to Russian without recreating the component', async () => {
    await init();

    const menu = await openMenu();
    const languageService = TestBed.inject(LanguageService);
    languageService.setLanguage('ru');
    fixture.detectChanges();

    const texts = await getMenuTexts(menu);
    const joined = texts.join(' ');

    expect(joined).toContain('Мой аккаунт');
    expect(joined).toContain('Задачи');
    expect(joined).toContain('Поддержка');
    expect(joined).toContain('Выйти');
    expect(joined).not.toContain('My Account');
    expect(joined).not.toContain('Sign Out');
    expect(joined).toContain('Bruce W.');
    expect(joined).toContain('me@batman.com');
    expect(joined).toContain('3');
  });

  it('should keep existing menu actions', async () => {
    await init();

    let menu = await openMenu();
    await menu.clickItem({ text: /My Account/ });
    expect(router.navigate).toHaveBeenCalledWith(['my-account'], { relativeTo: TestBed.inject(ActivatedRoute) });

    menu = await openMenu();
    await menu.clickItem({ text: /Tasks/ });
    expect(router.navigate).toHaveBeenCalledWith(['tasks'], { relativeTo: TestBed.inject(ActivatedRoute) });

    menu = await openMenu();
    await menu.clickItem({ text: /Support/ });
    expect(router.navigate).toHaveBeenCalledWith(['support', 'tickets'], { relativeTo: TestBed.inject(ActivatedRoute) });

    menu = await openMenu();
    await menu.clickItem({ text: /Sign Out/ });
    expect(logout).toHaveBeenCalled();
  });
});
