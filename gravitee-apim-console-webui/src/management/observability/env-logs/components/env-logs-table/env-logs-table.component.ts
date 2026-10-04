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

import { Component, computed, inject, input, output, TemplateRef, viewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  LogsListBaseComponent,
  LogsListColumnDef,
} from '../../../../api/api-traffic-v4/components/logs-list-base/logs-list-base.component';
import { GioTableWrapperPagination } from '../../../../../shared/components/gio-table-wrapper/gio-table-wrapper.component';
import { Pagination } from '../../../../../entities/management-api-v2';
import { EnvLog } from '../../models/env-log.model';
import { LanguageService } from '../../../../../shared/i18n/language.service';
import { TranslatePipe } from '../../../../../shared/i18n/translate.pipe';

@Component({
  selector: 'env-logs-table',
  templateUrl: './env-logs-table.component.html',
  styleUrl: './env-logs-table.component.scss',
  standalone: true,
  imports: [LogsListBaseComponent, RouterModule, MatIcon, MatButtonModule, MatTooltipModule, TranslatePipe],
})
export class EnvLogsTableComponent {
  private readonly languageService = inject(LanguageService);
  logs = input.required<EnvLog[]>();
  pagination = input.required<Pagination>();
  showAssetTypeColumn = input<boolean>(false);
  isLoading = input<boolean>(false);

  paginationUpdated = output<GioTableWrapperPagination>();

  readonly timestampTemplate = viewChild.required<TemplateRef<EnvLog>>('timestampTemplate');
  readonly assetTypeTemplate = viewChild.required<TemplateRef<EnvLog>>('assetTypeTemplate');
  readonly methodTemplate = viewChild.required<TemplateRef<EnvLog>>('methodTemplate');
  readonly statusTemplate = viewChild.required<TemplateRef<EnvLog>>('statusTemplate');
  readonly apiTemplate = viewChild.required<TemplateRef<EnvLog>>('apiTemplate');
  readonly pathTemplate = viewChild.required<TemplateRef<EnvLog>>('pathTemplate');
  readonly applicationTemplate = viewChild.required<TemplateRef<EnvLog>>('applicationTemplate');
  readonly planTemplate = viewChild.required<TemplateRef<EnvLog>>('planTemplate');
  readonly gatewayTemplate = viewChild.required<TemplateRef<EnvLog>>('gatewayTemplate');
  readonly responseTimeTemplate = viewChild.required<TemplateRef<EnvLog>>('responseTimeTemplate');
  readonly endpointTemplate = viewChild.required<TemplateRef<EnvLog>>('endpointTemplate');
  readonly issuesTemplate = viewChild.required<TemplateRef<EnvLog>>('issuesTemplate');
  readonly previewTemplate = viewChild.required<TemplateRef<EnvLog>>('previewTemplate');

  readonly columns = computed<LogsListColumnDef[]>(() => {
    this.languageService.currentLanguage();
    const t = (key: string) => this.languageService.translate(key);
    return [
      { id: 'timestamp', label: t('observability.logs.columns.timestamp'), template: this.timestampTemplate() },
      ...(this.showAssetTypeColumn() ? [{ id: 'assetType', label: t('observability.logs.columns.assetType'), template: this.assetTypeTemplate() }] : []),
      { id: 'method', label: t('observability.logs.columns.method'), template: this.methodTemplate() },
      { id: 'status', label: t('observability.logs.columns.status'), template: this.statusTemplate() },
      { id: 'api', label: t('observability.logs.columns.api'), template: this.apiTemplate() },
      { id: 'path', label: t('observability.logs.columns.path'), template: this.pathTemplate() },
      { id: 'application', label: t('observability.logs.columns.application'), template: this.applicationTemplate() },
      { id: 'plan', label: t('observability.logs.columns.plan'), template: this.planTemplate() },
      { id: 'gateway', label: t('observability.logs.columns.gateway'), template: this.gatewayTemplate() },
      { id: 'responseTime', label: t('observability.logs.columns.responseTime'), template: this.responseTimeTemplate() },
      { id: 'endpoint', label: t('observability.logs.columns.endpointReached'), template: this.endpointTemplate() },
      { id: 'issues', label: t('observability.logs.columns.issues'), template: this.issuesTemplate() },
      { id: 'preview', label: '', template: this.previewTemplate() },
    ];
  });
}
