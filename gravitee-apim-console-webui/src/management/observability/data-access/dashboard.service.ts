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
import { Dashboard } from '@gravitee/gravitee-dashboard';

import { computed, Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EMPTY, Observable } from 'rxjs';
import { switchMap, tap, catchError, filter } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { GioConfirmDialogComponent, GioConfirmDialogData } from '@gravitee/ui-particles-angular';

import { DashboardTemplate, HTTP_PROXY_TEMPLATE } from './templates';

import { Constants } from '../../../entities/Constants';
import { PagedResult } from '../../../entities/management-api-v2';
import { SnackBarService } from '../../../services-ngx/snack-bar.service';
import { LanguageService } from '../../../shared/i18n/language.service';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(
    private readonly http: HttpClient,
    @Inject(Constants) private readonly constants: Constants,
    private readonly dialog: MatDialog,
    private readonly snackBarService: SnackBarService,
    private readonly languageService: LanguageService,
  ) {}

  readonly overviewDashboard = computed(() => {
    return this.createInitialOverview();
  });

  public list(page: number, perPage: number): Observable<PagedResult<Dashboard>> {
    return this.http.get<PagedResult<Dashboard>>(`${this.constants.env.v2BaseURL}/analytics/dashboards`, {
      params: {
        page: page.toString(),
        perPage: perPage.toString(),
      },
    });
  }

  public create(dashboard: Partial<Dashboard>): Observable<Dashboard> {
    return this.http.post<Dashboard>(`${this.constants.env.v2BaseURL}/analytics/dashboards`, dashboard);
  }

  public getById(id: string): Observable<Dashboard> {
    return this.http.get<Dashboard>(`${this.constants.env.v2BaseURL}/analytics/dashboards/${id}`);
  }

  public update(dashboard: Dashboard): Observable<Dashboard> {
    return this.http.put<Dashboard>(`${this.constants.env.v2BaseURL}/analytics/dashboards/${dashboard.id}`, dashboard);
  }

  public delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.constants.env.v2BaseURL}/analytics/dashboards/${id}`);
  }

  /**
   * Opens a confirmation dialog, calls DELETE on the API, shows success/error snackbars.
   * Returns an Observable<void> that emits once on success, or completes silently on cancellation/error.
   * Each consumer can chain its own post-delete behaviour (e.g. refresh list, navigate back).
   */
  public confirmAndDelete(dashboard: Dashboard): Observable<void> {
    return this.dialog
      .open<GioConfirmDialogComponent, GioConfirmDialogData, boolean>(GioConfirmDialogComponent, {
        data: {
          title: this.languageService.translate('observability.dashboards.deleteTitle'),
          content: this.languageService.translate('observability.dashboards.deleteContent', {
            name: this.escapeHtml(dashboard.name),
          }),
          confirmButton: this.languageService.translate('common.delete'),
        },
        role: 'alertdialog',
        id: 'deleteDashboardConfirmDialog',
      })
      .afterClosed()
      .pipe(
        filter(confirmed => confirmed === true),
        switchMap(() => this.delete(dashboard.id)),
        tap(() =>
          this.snackBarService.success(
            this.languageService.translate('observability.dashboards.deleteSuccess', { name: dashboard.name }),
          ),
        ),
        catchError(({ error }) => {
          this.snackBarService.error(error?.message ?? this.languageService.translate('observability.dashboards.deleteError'));
          return EMPTY;
        }),
      );
  }

  /** Escapes HTML special characters to prevent XSS when interpolating user-controlled strings into HTML content. */
  private escapeHtml(text: string): string {
    return text
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#x27;');
  }

  public toCreateDashboard(template: DashboardTemplate): Partial<Dashboard> {
    const now = new Date().toISOString();
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const defaultTimeRange = { from: fiveMinutesAgo, to: now };
    const defaultInterval = Math.floor((5 * 60 * 1000) / 30); // 5 min / 30 buckets = 10000ms

    const widgets = (template.initialConfig.widgets ?? []).map(widget => {
      const localized = this.localizeWidget(widget);
      const id = crypto.randomUUID();
      if (!localized.request) return { ...localized, id };

      const request = { ...localized.request, timeRange: localized.request.timeRange ?? defaultTimeRange };

      if (request.type === 'time-series') {
        return { ...localized, id, request: { ...request, interval: (request as any).interval ?? defaultInterval } };
      }

      return { ...localized, id, request };
    });

    return {
      name: `${this.templateDisplayName(template)} - ${new Date().toLocaleString()}`,
      labels: template.initialConfig.labels ?? {},
      widgets,
    };
  }

  public localizeDashboard(dashboard: Dashboard): Dashboard {
    return {
      ...dashboard,
      name: this.translateOrFallback(`observability.templates.http-proxy.name`, dashboard.name),
      widgets: (dashboard.widgets ?? []).map(widget => this.localizeWidget(widget)),
    };
  }

  private templateDisplayName(template: DashboardTemplate): string {
    return this.translateOrFallback(`observability.templates.${template.id}.name`, template.name);
  }

  private localizeWidget<T extends { id?: string; title?: string; description?: string }>(widget: T): T {
    if (!widget.id) {
      return widget;
    }
    return {
      ...widget,
      title: this.translateOrFallback(`observability.widgets.${widget.id}.title`, widget.title ?? ''),
      description: this.translateOrFallback(`observability.widgets.${widget.id}.description`, widget.description ?? ''),
    };
  }

  private translateOrFallback(key: string, fallback: string): string {
    const translated = this.languageService.translate(key);
    return translated === key ? fallback : translated;
  }

  private createInitialOverview(): Dashboard {
    const template = HTTP_PROXY_TEMPLATE;
    return {
      ...template.initialConfig,
      id: 'default-overview',
      name: template.name,
      createdBy: 'System',
      createdAt: new Date().toDateString(),
      lastModified: new Date().toDateString(),
      labels: template.initialConfig.labels ?? {},
      widgets: template.initialConfig.widgets ?? [],
    } satisfies Dashboard;
  }
}
