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
import { Component, DestroyRef, Injector, Input, OnChanges, SimpleChanges } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { MatCard, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { GioLoaderModule } from '@gravitee/ui-particles-angular';
import { skip } from 'rxjs/operators';

import { GioChartPieModule } from '../gio-chart-pie/gio-chart-pie.module';
import { GioChartPieInput } from '../gio-chart-pie/gio-chart-pie.component';
import { LanguageService } from '../../i18n/language.service';
import { TranslatePipe } from '../../i18n/translate.pipe';

export type ApiAnalyticsResponseStatusRanges = {
  isLoading: boolean;
  data?: { label: string; value: number }[];
};

/**
 * Reserved bucket key the analytics API uses for the requests its status ranges cannot classify —
 * see the `ranges` property of ApiAnalyticsResponseStatusRangesResponse. Almost always a request
 * whose response status was never committed, hence the "No status" label.
 *
 * Kept in sync by hand with SearchResponseStatusRangesAdapter.UNKNOWN_RANGE: renaming it there
 * without changing it here falls back to rendering the raw key.
 */
const UNKNOWN_RANGE = 'unknown';

@Component({
  selector: 'api-analytics-response-status-ranges',
  imports: [MatCard, GioChartPieModule, GioLoaderModule, MatCardTitle, MatCardHeader, TranslatePipe],
  templateUrl: './api-analytics-response-status-ranges.component.html',
  styleUrl: './api-analytics-response-status-ranges.component.scss',
})
export class ApiAnalyticsResponseStatusRangesComponent implements OnChanges {
  @Input()
  title: string;

  @Input()
  responseStatusRanges: ApiAnalyticsResponseStatusRanges;

  input: GioChartPieInput[];

  constructor(
    private readonly languageService: LanguageService,
    private readonly injector: Injector,
    private readonly destroyRef: DestroyRef,
  ) {
    toObservable(this.languageService.currentLanguage, { injector: this.injector })
      .pipe(skip(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.buildInput());
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.responseStatusRanges && !this.responseStatusRanges?.isLoading) {
      this.buildInput();
    }
  }

  private buildInput() {
    if (!this.responseStatusRanges || this.responseStatusRanges.isLoading) {
      return;
    }

    this.input = this.responseStatusRanges?.data
      ?.filter(data => data.value > 0)
      .map(data => ({
        label: this.getLabel(data.label),
        value: data.value,
        color: getColor(data.label),
      }));
  }

  private getLabel(label: string): string {
    if (label === UNKNOWN_RANGE) {
      return this.languageService.translate('common.noStatus');
    } else if (label.startsWith('1')) {
      return '1xx';
    } else if (label.startsWith('2')) {
      return '2xx';
    } else if (label.startsWith('3')) {
      return '3xx';
    } else if (label.startsWith('4')) {
      return '4xx';
    } else if (label.startsWith('5')) {
      return '5xx';
    } else {
      return label;
    }
  }
}

const getColor = (label: string): string => {
  if (label.startsWith('2')) {
    return '#30ab61';
  } else if (label.startsWith('3')) {
    return '#365bd3';
  } else if (label.startsWith('4')) {
    return '#ff9f40';
  } else if (label.startsWith('5')) {
    return '#cf3942';
  } else {
    return '#bbb';
  }
};
