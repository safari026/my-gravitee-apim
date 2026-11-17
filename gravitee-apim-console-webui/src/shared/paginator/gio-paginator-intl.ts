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
import { effect, inject, Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

import { LanguageService } from '../i18n/language.service';

@Injectable()
export class GioPaginatorIntl extends MatPaginatorIntl {
  private readonly languageService = inject(LanguageService);

  constructor() {
    super();
    effect(() => {
      this.languageService.currentLanguage();
      this.itemsPerPageLabel = this.languageService.translate('common.paginator.itemsPerPage');
      this.nextPageLabel = this.languageService.translate('common.paginator.nextPage');
      this.previousPageLabel = this.languageService.translate('common.paginator.previousPage');
      this.firstPageLabel = this.languageService.translate('common.paginator.firstPage');
      this.lastPageLabel = this.languageService.translate('common.paginator.lastPage');
      this.changes.next();
    });
  }

  override getRangeLabel = (page: number, pageSize: number, length: number): string => {
    const isUnknownTotal = length < 0 || length === Number.MAX_SAFE_INTEGER;
    const totalLabel = isUnknownTotal
      ? this.languageService.translate('common.paginator.notAvailable')
      : `${length}`;
    if (length === 0 || pageSize === 0) {
      return this.languageService.translate('common.paginator.emptyRange', { total: totalLabel });
    }
    const startIndex = page * pageSize;
    const endIndex = isUnknownTotal
      ? startIndex + pageSize
      : startIndex < length
        ? Math.min(startIndex + pageSize, length)
        : startIndex + pageSize;
    return this.languageService.translate('common.paginator.range', {
      start: startIndex + 1,
      end: endIndex,
      total: totalLabel,
    });
  };
}
