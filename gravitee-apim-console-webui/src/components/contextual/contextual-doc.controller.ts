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
import { marked } from 'marked';

import { contextualDocumentationUrl } from './contextual-doc-url';

class ContextualDocController {
  public contextualDocumentationPage;
  public language;
  public documentationTitle;
  public onClose;
  public requestId = 0;

  public page: any = {};

  constructor(private $http) {}

  $onChanges(changes) {
    if (changes.contextualDocumentationPage || changes.language) {
      this.changeDocumentationPage(this.contextualDocumentationPage);
    }
  }

  close() {
    this.onClose();
  }

  changeDocumentationPage(page?: string) {
    if (!page) {
      this.page.content = '';
      return;
    }

    const requestId = (this.requestId += 1);
    const primary = contextualDocumentationUrl(page, this.language);
    const fallback = contextualDocumentationUrl(page, 'en');
    const apply = (response: { data: string }) => {
      if (requestId !== this.requestId) {
        return;
      }
      this.page.content = marked.parse(response.data);
    };

    this.$http.get(primary).then(apply, () => {
      if (primary === fallback || requestId !== this.requestId) {
        return;
      }
      this.$http.get(fallback).then(apply);
    });
  }
}
ContextualDocController.$inject = ['$http'];

export default ContextualDocController;
