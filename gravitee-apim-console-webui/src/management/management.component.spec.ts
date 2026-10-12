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
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, of } from 'rxjs';

import { ManagementComponent } from './management.component';

describe('ManagementComponent contextual documentation', () => {
  let fixture: ComponentFixture<ManagementComponent>;
  const visibilityKey = 'gv-contextual-doc-visibility';

  const docs = (): HTMLElement[] => Array.from(fixture.nativeElement.querySelectorAll('gio-contextual-doc'));

  beforeEach(async () => {
    localStorage.removeItem(visibilityKey);

    await TestBed.configureTestingModule({
      declarations: [ManagementComponent],
      imports: [NoopAnimationsModule],
      providers: [
        { provide: Router, useValue: { events: new Subject() } },
        { provide: ActivatedRoute, useValue: { params: of({ envHrid: 'DEFAULT' }), snapshot: { firstChild: null, data: {} } } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ManagementComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.removeItem(visibilityKey);
    fixture.destroy();
  });

  it('opens a single documentation panel', () => {
    expect(docs()).toHaveLength(0);

    fixture.componentInstance.openContextualDocumentationPage(true);
    fixture.detectChanges();

    expect(docs()).toHaveLength(1);
  });

  it('does not create a second panel after section changes while open', () => {
    fixture.componentInstance.openContextualDocumentationPage(true);
    fixture.detectChanges();
    expect(docs()).toHaveLength(1);

    fixture.componentInstance.contextualDocumentationPage = 'management-configuration-apis';
    fixture.detectChanges();
    fixture.componentInstance.contextualDocumentationPage = 'management-dashboard';
    fixture.detectChanges();
    fixture.componentInstance.contextualDocumentationPage = 'management-applications';
    fixture.detectChanges();

    expect(docs()).toHaveLength(1);
  });

  it('does not duplicate the panel when opened again after navigation', () => {
    fixture.componentInstance.openContextualDocumentationPage(true);
    fixture.detectChanges();

    fixture.componentInstance.contextualDocumentationPage = 'management-configuration-apis';
    fixture.detectChanges();
    fixture.componentInstance.openContextualDocumentationPage(true);
    fixture.detectChanges();

    expect(docs()).toHaveLength(1);
  });

  it('closes the panel and can open it again as a single instance', () => {
    fixture.componentInstance.openContextualDocumentationPage(true);
    fixture.detectChanges();
    expect(docs()).toHaveLength(1);

    fixture.componentInstance.openContextualDocumentationPage(false);
    fixture.detectChanges();
    expect(docs()).toHaveLength(0);

    fixture.componentInstance.openContextualDocumentationPage(true);
    fixture.detectChanges();
    expect(docs()).toHaveLength(1);
  });
});
