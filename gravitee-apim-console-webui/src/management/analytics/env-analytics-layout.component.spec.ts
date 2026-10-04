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
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTabNavBarHarness } from '@angular/material/tabs/testing';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { EnvAnalyticsLayoutComponent } from './env-analytics-layout.component';

import { GioTestingModule } from '../../shared/testing';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';
import { LanguageService } from '../../shared/i18n/language.service';

describe('EnvAnalyticsLayoutComponent', () => {
  let fixture: ComponentFixture<EnvAnalyticsLayoutComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    localStorage.removeItem('gio-console-lang');
    await TestBed.configureTestingModule({
      declarations: [EnvAnalyticsLayoutComponent],
      imports: [NoopAnimationsModule, GioTestingModule, RouterModule, MatTabsModule, MatIconModule, TranslatePipe],
    }).compileComponents();

    fixture = TestBed.createComponent(EnvAnalyticsLayoutComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.removeItem('gio-console-lang');
  });

  it('should display Analytics tabs', async () => {
    const tabs = await loader.getHarness(MatTabNavBarHarness);
    const links = await tabs.getLinks();

    expect(await links[0].getLabel()).toEqual('V2 Dashboard');
    expect(await links[1].getLabel()).toEqual('V2 Logs');
  });

  it('should switch tab labels EN → RU → EN without recreating the component', async () => {
    const tabs = await loader.getHarness(MatTabNavBarHarness);
    const links = await tabs.getLinks();
    const languageService = TestBed.inject(LanguageService);

    expect(await links[0].getLabel()).toEqual('V2 Dashboard');
    expect(await links[1].getLabel()).toEqual('V2 Logs');

    languageService.setLanguage('ru');
    fixture.detectChanges();

    expect(await links[0].getLabel()).toEqual('Дашборд V2');
    expect(await links[1].getLabel()).toEqual('Логи V2');

    languageService.setLanguage('en');
    fixture.detectChanges();

    expect(await links[0].getLabel()).toEqual('V2 Dashboard');
    expect(await links[1].getLabel()).toEqual('V2 Logs');
  });
});
