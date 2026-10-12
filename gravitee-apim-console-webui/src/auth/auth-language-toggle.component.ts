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
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { GioIconsModule } from '@gravitee/ui-particles-angular';

import { LanguageService } from '../shared/i18n/language.service';
import { TranslatePipe } from '../shared/i18n/translate.pipe';

@Component({
  selector: 'auth-language-toggle',
  templateUrl: './auth-language-toggle.component.html',
  styleUrls: ['./auth-language-toggle.component.scss'],
  imports: [MatButtonModule, MatIconModule, GioIconsModule, TranslatePipe],
})
export class AuthLanguageToggleComponent {
  private readonly languageService = inject(LanguageService);

  toggleLanguage(): void {
    const currentLanguage = this.languageService.currentLanguage();
    this.languageService.setLanguage(currentLanguage === 'en' ? 'ru' : 'en');
  }
}
