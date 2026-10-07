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
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, Injector } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { MatTabsModule } from '@angular/material/tabs';
import { MatAnchor } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { skip } from 'rxjs/operators';

import { LanguageService } from '../../../../shared/i18n/language.service';
import { TranslatePipe } from '../../../../shared/i18n/translate.pipe';

@Component({
  selector: 'shared-policy-group',
  imports: [MatTabsModule, MatAnchor, MatIcon, RouterModule, TranslatePipe],
  templateUrl: './shared-policy-group.component.html',
  styleUrl: './shared-policy-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SharedPolicyGroupComponent {
  private readonly languageService = inject(LanguageService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  constructor() {
    toObservable(this.languageService.currentLanguage, { injector: this.injector })
      .pipe(skip(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.changeDetectorRef.markForCheck());
  }
}
