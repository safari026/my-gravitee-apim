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

import angular, { IController, IScope } from 'angular';
import { ActivatedRoute, Router } from '@angular/router';
import { forEach, isNil } from 'lodash';

import { DocumentationService } from '../../services/documentation.service';
import NotificationService from '../../services/notification.service';
import { LanguageService } from '../../shared/i18n/language.service';

interface IPageScope extends IScope {
  fetcherJsonSchema: string;
}

class ImportPagesComponentController implements IController {
  resolvedFetchers: any[];
  resolvedRootPage: any;
  activatedRoute: ActivatedRoute;

  apiId: string;
  page: any;
  fetchers: any[];
  importInProgress: boolean;
  constructor(
    private readonly NotificationService: NotificationService,
    private readonly DocumentationService: DocumentationService,
    private $scope: IPageScope,
    private ngRouter: Router,
    private readonly ngLanguageService: LanguageService,
  ) {}

  translate = (key: string, params?: Record<string, string | number>) => this.ngLanguageService.translate(key, params);

  $onInit() {
    this.apiId = this.activatedRoute.snapshot.params.apiId;
    this.page = this.resolvedRootPage || {
      name: 'root',
      type: 'ROOT',
    };

    this.fetchers = this.resolvedFetchers;

    if (!(isNil(this.page.source) || isNil(this.page.source.type))) {
      forEach(this.fetchers, fetcher => {
        if (fetcher.id === this.page.source.type) {
          this.$scope.fetcherJsonSchema = angular.fromJson(fetcher.schema);
        }
      });
    }
  }

  import() {
    this.importInProgress = true;
    this.page.name = 'import';
    this.DocumentationService.import(this.page, this.apiId)
      .then((response: any) => {
        if (this.page.id) {
          if (response.data.messages && response.data.messages.length > 0) {
            this.NotificationService.showError(
              this.translate('settings.documentation.importUpdatedErrors', { count: response.data.length }),
            );
          } else {
            this.NotificationService.show(this.translate('settings.documentation.importUpdated', { count: response.data.length }));
          }
        } else {
          if (response.data.messages && response.data.messages.length > 0) {
            this.NotificationService.showError(
              this.translate('settings.documentation.importCreatedErrors', { count: response.data.length }),
            );
          } else {
            this.NotificationService.show(this.translate('settings.documentation.importCreated', { count: response.data.length }));
          }
        }
        this.ngRouter.navigate(['..'], { relativeTo: this.activatedRoute });
      })
      .finally(() => {
        this.importInProgress = false;
      });
  }

  cancel() {
    this.ngRouter.navigate(['..'], { relativeTo: this.activatedRoute });
  }
}
ImportPagesComponentController.$inject = ['NotificationService', 'DocumentationService', '$scope', 'ngRouter', 'ngLanguageService'];

export const DocumentationImportPagesComponentAjs: ng.IComponentOptions = {
  bindings: {
    resolvedFetchers: '<',
    resolvedRootPage: '<',
    activatedRoute: '<',
    language: '<',
  },
  template: require('html-loader!./import-pages.html').default, // eslint-disable-line @typescript-eslint/no-var-requires
  controller: ImportPagesComponentController,
};
