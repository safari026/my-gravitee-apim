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

import { Observable } from 'rxjs';

import NotificationService from '../../../../services/notification.service';
import ApplicationService from '../../../../services/application.service';
import { ApiKeyMode } from '../../../../entities/application/Application';
import { LanguageService } from '../../../../shared/i18n/language.service';

class ApiKeysController {
  private subscription: any;
  private keys: any[];
  private application: any;
  private listEvent: Observable<void>;

  constructor(
    private $mdDialog: angular.material.IDialogService,
    private NotificationService: NotificationService,
    private ApplicationService: ApplicationService,
    private ngLanguageService: LanguageService,
  ) {}

  translate(key: string, params?: Record<string, string | number>): string {
    return this.ngLanguageService.translate(key, params);
  }

  $onInit() {
    this.listApiKeys();
    if (this.listEvent) {
      this.listEvent.subscribe(() => this.listApiKeys());
    }
  }

  listApiKeys(): void {
    this.ApplicationService.listApiKeys(this.application, this.subscription).then(response => {
      this.keys = response.data;
    });
  }

  renewApiKey(): void {
    this.$mdDialog
      .show({
        controller: 'DialogConfirmController',
        controllerAs: 'ctrl',
        template: require('html-loader!../../../../components/dialog/confirmWarning.dialog.html').default, // eslint-disable-line @typescript-eslint/no-var-requires
        clickOutsideToClose: true,
        locals: {
          title: this.translate('applications.apiKeys.renewTitle'),
          msg: this.translate('applications.apiKeys.renewWarning'),
          confirmButton: this.translate('common.renew'),
        },
      })
      .then(response => {
        if (response) {
          this.ApplicationService.renewApiKey(this.application, this.subscription).then(() => {
            this.NotificationService.show(this.translate('applications.apiKeys.generated'));
            this.listApiKeys();
          });
        }
      });
  }

  isValid(key): boolean {
    return !key.revoked && !key.expired;
  }

  areKeysEditable(): boolean {
    // shared API Keys are editable if this is not a subscription related screen
    if (this.isSharedApiKey()) {
      return !this.subscription;
    }
    // other keys are editable if subscription is accepted
    return this.subscription && this.subscription.status === 'ACCEPTED';
  }

  isSharedApiKey(): boolean {
    return this.application.api_key_mode === ApiKeyMode.SHARED;
  }

  revokeApiKey(apiKey): void {
    this.$mdDialog
      .show({
        controller: 'DialogConfirmController',
        controllerAs: 'ctrl',
        template: require('html-loader!../../../../components/dialog/confirmWarning.dialog.html').default, // eslint-disable-line @typescript-eslint/no-var-requires
        clickOutsideToClose: true,
        locals: {
          title: this.translate('applications.apiKeys.revokeContent', { key: apiKey.key }),
          confirmButton: this.translate('common.revoke'),
        },
      })
      .then(response => {
        if (response) {
          this.ApplicationService.revokeApiKey(this.application, this.subscription, apiKey.id).then(() => {
            this.NotificationService.show(this.translate('applications.apiKeys.revoked'));
            this.listApiKeys();
          });
        }
      });
  }

  onCopyApiKeySuccess(e): void {
    this.NotificationService.show(this.translate('applications.apiKeys.copied'));
    e.clearSelection();
  }

  getTitle(): string {
    return this.isSharedApiKey()
      ? this.translate('applications.navigation.sharedApiKeys')
      : this.translate('applications.apiKeys.title');
  }
}
ApiKeysController.$inject = ['$mdDialog', 'NotificationService', 'ApplicationService', 'ngLanguageService'];

export default ApiKeysController;
