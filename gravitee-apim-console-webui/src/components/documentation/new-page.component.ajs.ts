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

import { IController, IPromise, IScope } from 'angular';
import { ActivatedRoute, Router } from '@angular/router';
import { Dictionary, keyBy } from 'lodash';

import { DocumentationQuery, DocumentationService, PageType } from '../../services/documentation.service';
import NotificationService from '../../services/notification.service';
import { LanguageService } from '../../shared/i18n/language.service';

interface IPageScope extends IScope {
  getContentMode: string;
  fetcherJsonSchema: string;
}
class NewPageComponentController implements IController {
  resolvedFetchers: any[];
  folders: any[];
  systemFolders: any[];
  pageResources: any[];
  categoryResources: any[];
  pagesToLink: any[];
  activatedRoute: ActivatedRoute;

  apiId: string;
  error: any;
  page: any;
  foldersById: Dictionary<any>;
  systemFoldersById: Dictionary<any>;
  pageList: any[];
  templates: any[];
  selectedTemplate: any;

  constructor(
    private readonly NotificationService: NotificationService,
    private readonly DocumentationService: DocumentationService,
    private readonly Constants,
    private $scope: IPageScope,
    private readonly ngRouter: Router,
    private readonly ngLanguageService: LanguageService,
  ) {
    this.error = null;
    this.$scope.getContentMode = 'inline';
  }

  translate = (key: string, params?: Record<string, string | number>) => this.ngLanguageService.translate(key, params);

  $onInit() {
    this.apiId = this.activatedRoute.snapshot.params.apiId;
    this.page = {
      name: '',
      type: this.activatedRoute.snapshot.queryParams.type,
      parentId: this.activatedRoute.snapshot.queryParams.parent,
      visibility: 'PUBLIC',
    };

    this.foldersById = keyBy(this.folders, 'id');
    this.systemFoldersById = keyBy(this.systemFolders, 'id');
    const folderSituation = this.DocumentationService.getFolderSituation(this.systemFoldersById, this.foldersById, this.page.parentId);
    this.pageList = this.DocumentationService.buildPageList(this.pageResources, true, folderSituation);
    this.pagesToLink = this.DocumentationService.buildPageList(this.pagesToLink, false, folderSituation);

    if (this.DocumentationService.supportedTypes(folderSituation).indexOf(this.page.type) < 0) {
      this.cancel();
    }

    const q = new DocumentationQuery();
    q.type = PageType.MARKDOWN_TEMPLATE;
    q.published = true;
    q.translated = true;
    this.DocumentationService.search(q, null).then(response => {
      this.templates = response.data;
    });

    const settings = this.Constants.env.settings;
    if (this.page.type === 'SWAGGER' && settings && settings.openAPIDocViewer) {
      this.page.configuration = {
        viewer: settings.openAPIDocViewer.openAPIDocType.defaultType,
      };
    }
  }

  getPageName(): string {
    const keyByType: Record<string, string> = {
      [PageType.ASCIIDOC]: 'settings.documentation.newTitles.ASCIIDOC',
      [PageType.ASYNCAPI]: 'settings.documentation.newTitles.ASYNCAPI',
      [PageType.FOLDER]: 'settings.documentation.newTitles.FOLDER',
      [PageType.LINK]: 'settings.documentation.newTitles.LINK',
      [PageType.MARKDOWN_TEMPLATE]: 'settings.documentation.newTitles.MARKDOWN_TEMPLATE',
      [PageType.MARKDOWN]: 'settings.documentation.newTitles.MARKDOWN',
      [PageType.SWAGGER]: 'settings.documentation.newTitles.SWAGGER',
    };
    return this.translate(keyByType[this.page.type] ?? 'settings.documentation.newTitles.default');
  }

  isFolder(): boolean {
    return PageType.FOLDER === this.page.type;
  }
  isLink(): boolean {
    return PageType.LINK === this.page.type;
  }
  isSwagger(): boolean {
    return PageType.SWAGGER === this.page.type;
  }
  isMarkdown(): boolean {
    return PageType.MARKDOWN === this.page.type;
  }
  isMarkdownTemplate(): boolean {
    return PageType.MARKDOWN_TEMPLATE === this.page.type;
  }

  onChangeMarkdownTemplate() {
    if (this.selectedTemplate.type) {
      this.page = { ...this.page, content: this.selectedTemplate.content };
    }
  }

  save(gotoParent: boolean): IPromise<void> {
    this.error = null;
    return this.DocumentationService.create(this.page, this.apiId)
      .then((response: any) => {
        const page = response.data;
        if (page.messages && page.messages.length > 0) {
          this.NotificationService.showError(this.translate('settings.documentation.createdWithErrors', { name: page.name }));
        } else {
          this.NotificationService.show(this.translate('settings.documentation.created', { name: page.name }));
        }
        if (gotoParent) {
          this.gotoParent();
        } else {
          this.gotoEdit(page);
        }
      })
      .catch(err => {
        this.error = { ...err.data, title: this.translate('settings.documentation.unableToCreate') };
      });
  }

  changeContentMode(newMode) {
    if ('fetcher' === newMode) {
      this.page.source = {
        configuration: {},
      };
    } else {
      delete this.page.source;
    }
    this.error = null;
  }

  cancel() {
    this.gotoParent();
  }

  gotoParent() {
    this.ngRouter.navigate(['..'], {
      queryParams: { parent: this.activatedRoute.snapshot.queryParams.parent },
      relativeTo: this.activatedRoute,
    });
  }

  gotoEdit(page: any) {
    this.ngRouter.navigate(['../', page.id], { queryParams: { type: page.type }, relativeTo: this.activatedRoute });
  }
}
NewPageComponentController.$inject = ['NotificationService', 'DocumentationService', 'Constants', '$scope', 'ngRouter', 'ngLanguageService'];

export const DocumentationNewPageComponentAjs: ng.IComponentOptions = {
  bindings: {
    resolvedFetchers: '<',
    folders: '<',
    systemFolders: '<',
    pageResources: '<',
    categoryResources: '<',
    pagesToLink: '<',
    params: '<',
    activatedRoute: '<',
    language: '<',
  },
  template: require('html-loader!./new-page.html').default, // eslint-disable-line @typescript-eslint/no-var-requires
  controller: NewPageComponentController,
};
