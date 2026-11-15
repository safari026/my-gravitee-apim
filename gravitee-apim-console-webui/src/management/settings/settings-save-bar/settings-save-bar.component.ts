import { Component, EventEmitter, HostBinding, inject, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { GioSaveBarComponent, GioSaveBarModule } from '@gravitee/ui-particles-angular';

import { LanguageService } from '../../../shared/i18n/language.service';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';

@Component({
  selector: 'settings-save-bar',
  standalone: true,
  imports: [GioSaveBarModule, MatButtonModule, TranslatePipe],
  templateUrl: './settings-save-bar.component.html',
  styleUrls: ['./settings-save-bar.component.scss'],
})
export class SettingsSaveBarComponent {
  private readonly languageService = inject(LanguageService);

  @Input() opened = false;
  @Input() invalidState = false;
  @Input() creationMode = false;
  @Input() form?: FormGroup;
  @Input() formInitialValues?: unknown;

  @Output() submitted = new EventEmitter<void>();
  @Output() resetClicked = new EventEmitter<void>();
  @Output() submittedInvalidState = new EventEmitter<void>();

  @HostBinding('style.--settings-save-bar-label')
  get unsavedChangesLabel(): string {
    if (this.creationMode) {
      return '""';
    }
    return `"${this.languageService.translate('common.unsavedChanges').replace(/"/g, '')}"`;
  }
}
