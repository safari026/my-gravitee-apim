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
import { IScope } from 'angular';

import { LanguageService } from '../../../shared/i18n/language.service';

interface ISelectPageToLinkScope extends IScope {
  pages: any[];
  title: string;
  selectedPage: any;
}
function SelectPageDialogController(
  $scope: ISelectPageToLinkScope,
  $mdDialog: angular.material.IDialogService,
  locals: any,
  ngLanguageService: LanguageService,
) {
  $scope.pages = locals.pages;
  $scope.title = locals.title;

  this.translate = (key: string, params?: Record<string, string | number>) => ngLanguageService.translate(key, params);

  this.cancel = () => {
    $mdDialog.hide();
  };

  this.select = () => {
    $mdDialog.hide($scope.selectedPage);
  };
}
SelectPageDialogController.$inject = ['$scope', '$mdDialog', 'locals', 'ngLanguageService'];

export default SelectPageDialogController;
