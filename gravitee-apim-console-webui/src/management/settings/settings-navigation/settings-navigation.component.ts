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
import { ChangeDetectorRef, Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { skip, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { GioMenuService, GioMenuSearchService } from '@gravitee/ui-particles-angular';
import { ActivatedRoute, Router } from '@angular/router';

import { GroupItem, MenuItem, SettingsNavigationService } from './settings-navigation.service';

import { LanguageService } from '../../../shared/i18n/language.service';

@Component({
  selector: 'settings-navigation',
  templateUrl: './settings-navigation.component.html',
  styleUrls: ['./settings-navigation.component.scss'],
  standalone: false,
})
export class SettingsNavigationComponent implements OnInit, OnDestroy {
  public groupItems: GroupItem[] = [];
  public hasBreadcrumb = false;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly gioMenuService: GioMenuService,
    private readonly settingsNavigationService: SettingsNavigationService,
    private readonly languageService: LanguageService,
    private readonly injector: Injector,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly gioMenuSearchService: GioMenuSearchService,
  ) {}

  ngOnInit() {
    this.gioMenuService.reduced$.pipe(takeUntil(this.unsubscribe$)).subscribe(reduced => {
      this.hasBreadcrumb = reduced;
    });

    this.groupItems = this.settingsNavigationService.getSettingsNavigationRoutes();

    toObservable(this.languageService.currentLanguage, { injector: this.injector })
      .pipe(skip(1), takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.groupItems = this.settingsNavigationService.getSettingsNavigationRoutes();
        this.refreshSearchItems();
        this.changeDetectorRef.markForCheck();
      });
  }

  private refreshSearchItems(): void {
    const envHrid = this.activatedRoute.pathFromRoot.map(route => route.snapshot.params.envHrid).find(Boolean);
    if (!envHrid) {
      return;
    }
    this.gioMenuSearchService.removeMenuSearchItems([envHrid]);
    this.gioMenuSearchService.addMenuSearchItems(this.settingsNavigationService.getSettingsNavigationSearchItems(envHrid));
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  isActive(item: MenuItem): boolean {
    return this.router.isActive(this.router.createUrlTree([item.routerLink], { relativeTo: this.activatedRoute }), {
      paths: 'subset',
      queryParams: 'subset',
      fragment: 'ignored',
      matrixParams: 'ignored',
    });
  }

  public computeBreadcrumbItems(): string[] {
    const breadcrumbItems: string[] = [];

    this.groupItems.forEach(groupItem => {
      groupItem.items.forEach(item => {
        if (this.isActive(item)) {
          breadcrumbItems.push(groupItem.title);
          breadcrumbItems.push(item.displayName);
        }
      });
    });

    return breadcrumbItems;
  }
}
