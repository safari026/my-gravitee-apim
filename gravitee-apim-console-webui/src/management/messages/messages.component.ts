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
import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { sortBy } from 'lodash';
import { Subject } from 'rxjs';
import { skip, takeUntil } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

import { RoleService } from '../../services-ngx/role.service';
import { HttpMessagePayload, MessageScope, TextMessagePayload } from '../../entities/message/messagePayload';
import { MessageService } from '../../services-ngx/message.service';
import { SnackBarService } from '../../services-ngx/snack-bar.service';
import { LanguageService } from '../../shared/i18n/language.service';
import { Role } from '../../entities/role/role';

@Component({
  selector: 'messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss'],
  standalone: false,
})
export class MessagesComponent implements OnInit, OnDestroy {
  channels: { id: string; name: string }[] = [];

  form: UntypedFormGroup;
  recipients: { name: string; displayName: string }[];
  scope: MessageScope;
  sending = false;
  private apiId: string;
  private roles: Role[] = [];
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly roleService: RoleService,
    private readonly messageService: MessageService,
    private readonly snackBarService: SnackBarService,
    private readonly languageService: LanguageService,
    private readonly injector: Injector,
  ) {}

  ngOnInit(): void {
    this.apiId = this.activatedRoute.snapshot.params.apiId;
    this.scope = this.apiId ? 'APPLICATION' : 'ENVIRONMENT';
    this.buildChannels();
    this.roleService
      .list(this.scope)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(roles => {
        this.roles = sortBy(roles, ['name']);
        this.buildRecipients();
        this.form = new UntypedFormGroup({
          channel: new UntypedFormControl('PORTAL', [Validators.required]),
          recipients: new UntypedFormControl([], [Validators.required]),
          title: new UntypedFormControl('', [Validators.required]),
          url: new UntypedFormControl('', [Validators.required]),
          text: new UntypedFormControl('', [Validators.required]),
          useSystemProxy: new UntypedFormControl(false),
          headers: new UntypedFormControl([]),
        });
        // Disable URL field as initial value for channel is PORTAL.
        this.form.controls['url'].disable();

        // eslint-disable-next-line rxjs/no-nested-subscribe
        this.form.controls['channel'].valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe(values => {
          if (values === 'HTTP') {
            this.form.controls['title'].disable();
            this.form.controls['url'].enable();
          } else {
            this.form.controls['title'].enable();
            this.form.controls['url'].disable();
          }
        });
      });

    toObservable(this.languageService.currentLanguage, { injector: this.injector })
      .pipe(skip(1), takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.buildChannels();
        if (this.roles.length) {
          this.buildRecipients();
        }
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  sendMessage() {
    this.sending = true;
    const val = this.form.getRawValue();
    const payload = val.channel === 'HTTP' ? this.getHttpPayload() : this.getTextMessagePayload();
    const obs = this.apiId ? this.messageService.sendFromApi(this.apiId, payload) : this.messageService.sendFromPortal(payload);

    obs.subscribe({
      next: res => {
        this.sending = false;
        this.snackBarService.success(
          this.languageService.translate(res > 1 ? 'messages.success.many' : 'messages.success.one', { count: res }),
        );
      },
      error: error => {
        this.sending = false;
        let message = this.languageService.translate('messages.error');
        if (error?.error?.message) {
          message = this.languageService.translate('messages.errorBecause', { reason: error.error.message });
        }
        this.snackBarService.error(message);
      },
    });
  }

  requiredPermission() {
    return this.scope === 'APPLICATION' ? { anyOf: ['api-message-c'] } : { anyOf: ['environment-message-c'] };
  }

  private buildChannels() {
    this.channels = [
      { id: 'PORTAL', name: this.languageService.translate('messages.channels.portal') },
      { id: 'MAIL', name: this.languageService.translate('messages.channels.email') },
      { id: 'HTTP', name: this.languageService.translate('messages.channels.http') },
    ];
  }

  private buildRecipients() {
    this.recipients = this.roles.map(role => ({
      name: role.name,
      displayName: this.languageService.translate(
        this.scope === 'APPLICATION' ? 'messages.recipient.applicationRole' : 'messages.recipient.environmentRole',
        { role: role.name },
      ),
    }));
    if (this.apiId) {
      this.recipients.unshift({
        name: 'API_SUBSCRIBERS',
        displayName: this.languageService.translate('messages.recipient.apiSubscribers'),
      });
    }
  }

  private getHttpPayload(): HttpMessagePayload {
    const val = this.form.getRawValue();
    const params = val.headers.reduce((params, header) => {
      params[header.key] = header.value;
      return params;
    }, {});

    return {
      channel: 'HTTP',
      text: val.text,
      recipient: {
        url: val.url,
      },
      params,
      useSystemProxy: val.useSystemProxy,
    };
  }

  private getTextMessagePayload(): TextMessagePayload {
    const val = this.form.getRawValue();
    return {
      channel: val.channel,
      title: val.title,
      text: val.text,
      recipient: {
        role_scope: this.scope,
        role_value: val.recipients,
      },
    };
  }
}
