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
import { ActivatedRoute, Router } from '@angular/router';

import DictionaryService from '../../../services/dictionary.service';
import { LanguageService } from '../../../shared/i18n/language.service';

class DictionariesController {
  private dictionaries: any;
  private activatedRoute: ActivatedRoute;
  constructor(
    private DictionaryService: DictionaryService,
    private $rootScope: IScope,
    private ngRouter: Router,
    private ngLanguageService: LanguageService,
    private $scope: IScope,
  ) {
    this.$rootScope = $rootScope;
  }

  $onInit() {
    this.DictionaryService.list().then(response => (this.dictionaries = response.data));
  }

  $onChanges() {
    this.$scope.$applyAsync();
  }

  translate(key: string, params?: Record<string, string | number>): string {
    return this.ngLanguageService.translate(key, params);
  }

  displayType(type: string): string {
    if (type === 'MANUAL' || type === 'DYNAMIC') {
      return this.translate('settings.dictionaries.types.' + type);
    }
    return type;
  }

  displayState(state: string): string {
    return state === 'STARTED' ? this.translate('settings.dictionaries.started') : this.translate('settings.dictionaries.stopped');
  }

  goTo(dictionaryId: string) {
    this.ngRouter.navigate([dictionaryId], { relativeTo: this.activatedRoute });
  }
  newDictionary() {
    this.ngRouter.navigate(['new'], { relativeTo: this.activatedRoute });
  }
}
DictionariesController.$inject = ['DictionaryService', '$rootScope', 'ngRouter', 'ngLanguageService', '$scope'];
export default DictionariesController;
