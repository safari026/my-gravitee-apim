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

import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { forEach } from 'lodash';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { ApiQualityMetrics } from '../../../../entities/api';
import { ApiService } from '../../../../services-ngx/api.service';
import { QualityRuleService } from '../../../../services-ngx/quality-rule.service';
import { LanguageService } from '../../../../shared/i18n/language.service';

@Component({
  selector: 'api-general-info-quality',
  templateUrl: './api-general-info-quality.component.html',
  styleUrls: ['./api-general-info-quality.component.scss'],
  standalone: false,
})
export class ApiGeneralInfoQualityComponent implements OnChanges, OnDestroy {
  private unsubscribe$: Subject<boolean> = new Subject<boolean>();

  @Input()
  public apiId: string;

  public isQualityEnabled = false;
  public qualityMetricsDescription: Record<string, string> = {};
  public qualityMetrics: ApiQualityMetrics;
  private customRuleDescriptions: Record<string, string> = {};

  constructor(
    private readonly apiService: ApiService,
    private readonly qualityRuleService: QualityRuleService,
    private readonly languageService: LanguageService,
  ) {
    toObservable(this.languageService.currentLanguage)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => this.applyQualityDescriptions());
  }

  private t(key: string): string {
    return this.languageService.translate(`apis.general.${key}`);
  }

  private builtInQualityDescriptions(): Record<string, string> {
    return {
      'api.quality.metrics.functional.documentation.weight': this.t('quality.functionalDoc'),
      'api.quality.metrics.technical.documentation.weight': this.t('quality.technicalDoc'),
      'api.quality.metrics.healthcheck.weight': this.t('quality.healthcheck'),
      'api.quality.metrics.description.weight': this.t('quality.description'),
      'api.quality.metrics.logo.weight': this.t('quality.logo'),
      'api.quality.metrics.categories.weight': this.t('quality.categories'),
      'api.quality.metrics.labels.weight': this.t('quality.labels'),
    };
  }

  private applyQualityDescriptions(): void {
    this.qualityMetricsDescription = {
      ...this.builtInQualityDescriptions(),
      ...this.customRuleDescriptions,
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.apiId) {
      combineLatest([this.qualityRuleService.list(), this.apiService.getQualityMetrics(this.apiId)])
        .pipe(
          tap(([qualityRules, qualityMetrics]) => {
            this.customRuleDescriptions = {};
            forEach(qualityRules, qualityRule => {
              this.customRuleDescriptions[qualityRule.id] = qualityRule.description;
            });
            this.applyQualityDescriptions();
            this.qualityMetrics = qualityMetrics;
          }),
          takeUntil(this.unsubscribe$),
        )
        .subscribe();
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next(true);
    this.unsubscribe$.unsubscribe();
  }
}
