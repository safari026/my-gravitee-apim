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
import { Component, ElementRef, Injector, Input, OnDestroy, SimpleChange } from '@angular/core';
import { UpgradeComponent } from '@angular/upgrade/static';
import { combineLatest, Subject } from 'rxjs';
import { skip, takeUntil } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';

import { GroupService } from '../../../../services-ngx/group.service';
import { TenantService } from '../../../../services-ngx/tenant.service';
import { TagService } from '../../../../services-ngx/tag.service';
import { LanguageService } from '../../../../shared/i18n/language.service';
import { Language } from '../../../../shared/i18n/translations';

@Component({
  template: '',
  selector: 'notifications-component',
  standalone: false,
  host: {
    class: 'bootstrap gv-sub-content',
  },
})
export class ApiCreationV2Component extends UpgradeComponent implements OnDestroy {
  @Input() groups;
  @Input() tenants;
  @Input() tags;
  @Input() language: Language;
  private page = 1;
  private pageSize = 50;

  private unsubscribe$ = new Subject<void>();

  constructor(
    elementRef: ElementRef,
    private readonly injector: Injector,
    private readonly groupService: GroupService,
    private readonly tenantService: TenantService,
    private readonly tagService: TagService,
    public readonly activatedRoute: ActivatedRoute,
    private readonly languageService: LanguageService,
  ) {
    super('apiCreationV2ComponentAjs', elementRef, injector);
  }

  override ngOnInit() {
    this.language = this.languageService.currentLanguage();

    toObservable(this.languageService.currentLanguage, { injector: this.injector })
      .pipe(skip(1), takeUntil(this.unsubscribe$))
      .subscribe(language => {
        this.language = language;
        this.ngOnChanges({
          language: new SimpleChange(null, language, false),
        });
      });

    combineLatest([this.groupService.listPaginated(this.page, this.pageSize), this.tenantService.list(), this.tagService.list()])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(([groups, tenants, tags]) => {
        this.groups = groups.data;
        this.tenants = tenants;
        this.tags = tags;

        // Hack to Force the binding between Angular and AngularJS
        this.ngOnChanges({
          groups: new SimpleChange(null, this.groups, true),
          tenants: new SimpleChange(null, this.tenants, true),
          tags: new SimpleChange(null, this.tags, true),
          activatedRoute: new SimpleChange(null, this.activatedRoute, true),
          language: new SimpleChange(null, this.language, true),
        });

        super.ngOnInit();
      });
  }

  override ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();

    super.ngOnDestroy();
  }
}
