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
import { IController } from 'angular';

import { DocumentationService } from '../../../services/documentation.service';
import NotificationService from '../../../services/notification.service';
import { LanguageService } from '../../../shared/i18n/language.service';

class EditPageAttachedResourcesComponentController implements IController {
  apiId: string;
  attachedResources: any[];
  page: any;
  onSave: () => void;

  constructor(
    private readonly $mdDialog: angular.material.IDialogService,
    private readonly DocumentationService: DocumentationService,
    private readonly NotificationService: NotificationService,
    private readonly ngLanguageService: LanguageService,
  ) {}

  translate = (key: string, params?: Record<string, string | number>) => this.ngLanguageService.translate(key, params);

  addAttachedResource() {
    this.$mdDialog
      .show({
        controller: 'FileChooserDialogController',
        controllerAs: 'ctrl',
        template: require('html-loader!../../dialog/fileChooser.dialog.html').default, // eslint-disable-line @typescript-eslint/no-var-requires
        clickOutsideToClose: true,
        locals: {
          title: this.translate('settings.documentation.selectFileToAttach'),
          confirmButton: this.translate('common.add'),
        },
      })
      .then((response: any) => {
        if (response.file) {
          // upload new media to portal or api
          const fd = new FormData();
          let fileName = response.file.name;
          if (response.filename) {
            fileName = response.filename;
          }
          fd.append('file', response.file);
          fd.append('fileName', fileName);

          this.DocumentationService.addMedia(fd, this.page.id, this.apiId)
            .then(() => this.onSave())
            .then(() => this.NotificationService.show(this.translate('settings.documentation.attached', { name: fileName })))
            .catch(error => {
              this.NotificationService.showError(error.data?.message || this.translate('settings.documentation.attachError'));
            });
        }
      });
  }

  removeAttachedResource = (resource: any) => {
    this.$mdDialog
      .show({
        controller: 'DialogConfirmController',
        controllerAs: 'ctrl',
        template: require('html-loader!../../dialog/confirmWarning.dialog.html').default, // eslint-disable-line @typescript-eslint/no-var-requires
        clickOutsideToClose: true,
        locals: {
          title: this.translate('settings.documentation.removeTitle', { name: resource.fileName }),
          confirmButton: this.translate('common.remove'),
        },
      })
      .then(response => {
        if (response) {
          this.page.attached_media = this.page.attached_media.filter(
            media =>
              !(media.mediaHash === resource.hash && media.mediaName === resource.fileName && media.attachedAt === resource.createAt),
          );
          this.DocumentationService.update(this.page, this.apiId)
            .then(() => this.onSave())
            .then(() => this.NotificationService.show(this.translate('settings.documentation.detached', { name: resource.fileName })));
        }
      });
  };
}
EditPageAttachedResourcesComponentController.$inject = ['$mdDialog', 'DocumentationService', 'NotificationService', 'ngLanguageService'];

export const EditPageAttachedResourcesComponent: ng.IComponentOptions = {
  bindings: {
    apiId: '<',
    attachedResources: '<',
    page: '=',
    onSave: '&',
  },
  template: require('html-loader!./edit-page-attached-resources.html').default, // eslint-disable-line @typescript-eslint/no-var-requires
  controller: EditPageAttachedResourcesComponentController,
};
