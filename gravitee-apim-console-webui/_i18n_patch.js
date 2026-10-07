const fs = require('fs');

function replaceAll(file, pairs) {
  let s = fs.readFileSync(file, 'utf8');
  const orig = s;
  for (const [from, to] of pairs) {
    if (!s.includes(from)) {
      console.log('MISSING in ' + file.replace(/.*settings\//, 'settings/') + ': ' + JSON.stringify(from).slice(0, 90));
    } else {
      s = s.split(from).join(to);
    }
  }
  if (s !== orig) {
    fs.writeFileSync(file, s);
    console.log('UPDATED ' + file.replace(/.*src\//, 'src/'));
  }
}

const R = 'c:/dev/gravitee-api-management/gravitee-apim-console-webui/src/';

replaceAll(R + 'management/settings/categories/categories.component.html', [
  ['<h1>Categories</h1>', "<h1>{{ 'settings.categories.title' | translate }}</h1>"],
  ['<gio-form-label>Enable Category Mode</gio-form-label>', "<gio-form-label>{{ 'settings.categories.enableMode' | translate }}</gio-form-label>"],
  ['Replace the API gallery by a Category gallery in the Developer Portal', "{{ 'settings.categories.enableModeHint' | translate }}"],
  ['aria-label="Enable category mode"', `[attr.aria-label]="'settings.categories.enableModeAria' | translate"`],
  ['<mat-icon>add</mat-icon> Add Category', `<mat-icon>add</mat-icon> {{ 'settings.categories.add' | translate }}`],
  ['aria-label="Categories table"', `[attr.aria-label]="'settings.categories.tableAria' | translate"`],
  ['<th mat-header-cell *matHeaderCellDef id="name">Name</th>', `<th mat-header-cell *matHeaderCellDef id="name">{{ 'settings.categories.name' | translate }}</th>`],
  ['matTooltip="Hidden"', `[matTooltip]="'settings.categories.hidden' | translate"`],
  ['<th mat-header-cell *matHeaderCellDef id="description">Description</th>', `<th mat-header-cell *matHeaderCellDef id="description">{{ 'settings.categories.description' | translate }}</th>`],
  ['<th mat-header-cell *matHeaderCellDef id="api-count">API Count</th>', `<th mat-header-cell *matHeaderCellDef id="api-count">{{ 'settings.categories.apiCount' | translate }}</th>`],
  ['matTooltip="Show Category"', `[matTooltip]="'settings.categories.show' | translate"`],
  ['matTooltip="Hide Category"', `[matTooltip]="'settings.categories.hide' | translate"`],
  ['matTooltip="Move Up"', `[matTooltip]="'settings.categories.moveUp' | translate"`],
  ['matTooltip="Move Down"', `[matTooltip]="'settings.categories.moveDown' | translate"`],
  ['matTooltip="Edit"', `[matTooltip]="'common.edit' | translate"`],
  ['matTooltip="Delete"', `[matTooltip]="'common.delete' | translate"`],
  ["{{ 'There are no categories for this environment.' }}", "{{ 'settings.categories.empty' | translate }}"],
]);

replaceAll(R + 'management/settings/categories/category/category.component.html', [
  ["<h1>{{ mode === 'new' ? 'Create category' : 'Category details' }}</h1>", `<h1>{{ mode === 'new' ? ('settings.categories.createTitle' | translate) : ('settings.categories.detailsTitle' | translate) }}</h1>`],
  ['<h2>General</h2>', `<h2>{{ 'settings.categories.general' | translate }}</h2>`],
  ['&nbsp;Applies to both portals', `&nbsp;{{ 'settings.portal.appliesToBoth' | translate }}`],
  ['<mat-label>Name</mat-label>', `<mat-label>{{ 'settings.categories.name' | translate }}</mat-label>`],
  ['<mat-label>Description</mat-label>', `<mat-label>{{ 'settings.categories.description' | translate }}</mat-label>`],
  ['<mat-label>Documentation page</mat-label>', `<mat-label>{{ 'settings.categories.documentationPage' | translate }}</mat-label>`],
  ['>-- Select documentation page --</mat-option>', `>{{ 'settings.categories.selectDocumentationPage' | translate }}</mat-option>`],
  ['<mat-hint>Choose a Markdown page for your category</mat-hint>', `<mat-hint>{{ 'settings.categories.pageHint' | translate }}</mat-hint>`],
  ['Hide Category\n              <mat-slide-toggle gioFormSlideToggle formControlName="hidden" aria-label="Hide category"></mat-slide-toggle>', `{{ 'settings.categories.hideCategory' | translate }}\n              <mat-slide-toggle gioFormSlideToggle formControlName="hidden" [attr.aria-label]="'settings.categories.hideCategory' | translate"></mat-slide-toggle>`],
  ['<gio-form-file-picker-label>Picture</gio-form-file-picker-label>', `<gio-form-file-picker-label>{{ 'settings.categories.picture' | translate }}</gio-form-file-picker-label>`],
  ['<span class="general__right__image-upload__picture__text"> Click here or drag an image <br />Max 500KB</span>', `<span class="general__right__image-upload__picture__text"> {{ 'settings.categories.uploadHint' | translate }} <br />{{ 'settings.categories.uploadMax' | translate }}</span>`],
  ['<gio-form-file-picker-label>Background</gio-form-file-picker-label>', `<gio-form-file-picker-label>{{ 'settings.categories.background' | translate }}</gio-form-file-picker-label>`],
  ['<span class="general__right__image-upload__background__text"> Click here or drag an image <br />Max 500KB</span>', `<span class="general__right__image-upload__background__text"> {{ 'settings.categories.uploadHint' | translate }} <br />{{ 'settings.categories.uploadMax' | translate }}</span>`],
  ['<gio-form-file-picker-empty><span>No background defined</span></gio-form-file-picker-empty>', `<gio-form-file-picker-empty><span>{{ 'settings.categories.noBackground' | translate }}</span></gio-form-file-picker-empty>`],
  ['<h2>APIs</h2>', `<h2>{{ 'settings.categories.apis' | translate }}</h2>`],
  ['<mat-icon>add</mat-icon> Add API to Category', `<mat-icon>add</mat-icon> {{ 'settings.categories.addApiToCategory' | translate }}`],
  ['<th mat-header-cell *matHeaderCellDef id="name">Name</th>', `<th mat-header-cell *matHeaderCellDef id="name">{{ 'settings.categories.name' | translate }}</th>`],
  ['matTooltip="Highlighted Api"', `[matTooltip]="'settings.categories.highlightedApi' | translate"`],
  ['<th mat-header-cell *matHeaderCellDef id="version">Version</th>', `<th mat-header-cell *matHeaderCellDef id="version">{{ 'settings.categories.version' | translate }}</th>`],
  ['<th mat-header-cell *matHeaderCellDef id="context-path">Context path</th>', `<th mat-header-cell *matHeaderCellDef id="context-path">{{ 'settings.categories.contextPath' | translate }}</th>`],
  ['matTooltip="Remove Highlighted API"', `[matTooltip]="'settings.categories.removeHighlighted' | translate"`],
  ['matTooltip="Highlight API"', `[matTooltip]="'settings.categories.highlightApiAction' | translate"`],
  ['matTooltip="Move Up"', `[matTooltip]="'settings.categories.moveUp' | translate"`],
  ['matTooltip="Move Down"', `[matTooltip]="'settings.categories.moveDown' | translate"`],
  ['matTooltip="Remove API"', `[matTooltip]="'settings.categories.removeApi' | translate"`],
  ["{{ 'There are no APIs for this category.' }}", "{{ 'settings.categories.emptyApis' | translate }}"],
]);

replaceAll(R + 'management/settings/top-apis/top-apis.component.html', [
  ['<h2>Featured APIs</h2>', `<h2>{{ 'settings.topApis.title' | translate }}</h2>`],
  ['<p>Showcase your APIs on the Developer Portal homepage</p>', `<p>{{ 'settings.topApis.subtitle' | translate }}</p>`],
  ['<mat-icon>add</mat-icon>\n          Add API', `<mat-icon>add</mat-icon>\n          {{ 'settings.topApis.add' | translate }}`],
  ['Table with Top Apis list.', `{{ 'settings.topApis.tableCaption' | translate }}`],
  ['<th mat-header-cell *matHeaderCellDef>Name</th>', `<th mat-header-cell *matHeaderCellDef>{{ 'settings.topApis.name' | translate }}</th>`],
  ['<th mat-header-cell *matHeaderCellDef>Version</th>', `<th mat-header-cell *matHeaderCellDef>{{ 'settings.topApis.version' | translate }}</th>`],
  ['<th mat-header-cell *matHeaderCellDef>Description</th>', `<th mat-header-cell *matHeaderCellDef>{{ 'settings.topApis.description' | translate }}</th>`],
  ['aria-label="Move Top API up"', `[attr.aria-label]="'settings.topApis.moveUpAria' | translate"`],
  ['aria-label="Move Top API down"', `[attr.aria-label]="'settings.topApis.moveDownAria' | translate"`],
  ['aria-label="Delete this Top API"', `[attr.aria-label]="'settings.topApis.deleteAria' | translate"`],
  ['No Top APIs to display.', `{{ 'settings.topApis.empty' | translate }}`],
]);

replaceAll(R + 'management/settings/custom-user-fields/custom-user-fields.component.html', [
  ['<mat-card-title>User Fields</mat-card-title>', `<mat-card-title>{{ 'settings.userFields.title' | translate }}</mat-card-title>`],
  ['<mat-icon>add</mat-icon>\n        Add custom field', `<mat-icon>add</mat-icon>\n        {{ 'settings.userFields.add' | translate }}`],
  ['aria-label="Custom user fields table"', `[attr.aria-label]="'settings.userFields.tableAria' | translate"`],
  ['Table with custom user fields.', `{{ 'settings.userFields.tableCaption' | translate }}`],
  ['<th mat-header-cell *matHeaderCellDef id="key" mat-sort-header>Key</th>', `<th mat-header-cell *matHeaderCellDef id="key" mat-sort-header>{{ 'settings.userFields.key' | translate }}</th>`],
  ['<span class="gio-badge-neutral">Required</span>', `<span class="gio-badge-neutral">{{ 'settings.userFields.required' | translate }}</span>`],
  ['<th mat-header-cell *matHeaderCellDef id="label" mat-sort-header>Label</th>', `<th mat-header-cell *matHeaderCellDef id="label" mat-sort-header>{{ 'settings.userFields.label' | translate }}</th>`],
  ['<th mat-header-cell *matHeaderCellDef id="values">Values</th>', `<th mat-header-cell *matHeaderCellDef id="values">{{ 'settings.userFields.values' | translate }}</th>`],
  ['aria-label="Edit custom field button"', `[attr.aria-label]="'settings.userFields.editAria' | translate"`],
  ['matTooltip="Edit custom field"', `[matTooltip]="'settings.userFields.editTooltip' | translate"`],
  ['aria-label="Delete custom field button"', `[attr.aria-label]="'settings.userFields.deleteAria' | translate"`],
  ['matTooltip="Delete custom field"', `[matTooltip]="'settings.userFields.deleteTooltip' | translate"`],
  ['<div class="mat-body">Loading...</div>', `<div class="mat-body">{{ 'common.loading' | translate }}</div>`],
  ['<div class="mat-body">There are no custom user fields</div>', `<div class="mat-body">{{ 'settings.userFields.empty' | translate }}</div>`],
]);

replaceAll(R + 'management/settings/custom-user-fields/dialog/custom-user-fields-dialog.component.html', [
  ['<span mat-dialog-title>{{ customUserFieldsDialogData.action }} user field</span>', `<span mat-dialog-title>{{ isUpdate ? ('settings.userFields.updateTitle' | translate) : ('settings.userFields.createTitle' | translate) }}</span>`],
  ['<mat-label>Key</mat-label>', `<mat-label>{{ 'settings.userFields.key' | translate }}</mat-label>`],
  ['<mat-error *ngIf="form.get(\'key\').hasError(\'pattern\')">Only a-zA-Z0-9_- characters allowed</mat-error>', `<mat-error *ngIf="form.get('key').hasError('pattern')">{{ 'settings.userFields.keyPattern' | translate }}</mat-error>`],
  ['<mat-error *ngIf="form.get(\'key\').hasError(\'required\')">Key is required.</mat-error>', `<mat-error *ngIf="form.get('key').hasError('required')">{{ 'settings.userFields.keyRequired' | translate }}</mat-error>`],
  ['<mat-error *ngIf="form.get(\'key\').hasError(\'maxlength\')">Key can not exceed 50 characters.</mat-error>', `<mat-error *ngIf="form.get('key').hasError('maxlength')">{{ 'settings.userFields.keyMax' | translate }}</mat-error>`],
  ['<mat-error *ngIf="form.get(\'key\').hasError(\'minlength\')">Key has to be at least 1 characters long. </mat-error>', `<mat-error *ngIf="form.get('key').hasError('minlength')">{{ 'settings.userFields.keyMin' | translate }}</mat-error>`],
  ['<mat-label>Label</mat-label>', `<mat-label>{{ 'settings.userFields.label' | translate }}</mat-label>`],
  ['<mat-error *ngIf="form.get(\'label\').hasError(\'required\')">Label is required.</mat-error>', `<mat-error *ngIf="form.get('label').hasError('required')">{{ 'settings.userFields.labelRequired' | translate }}</mat-error>`],
  ['<mat-error *ngIf="form.get(\'label\').hasError(\'maxlength\')">Label length can not exceed 50 characters.</mat-error>', `<mat-error *ngIf="form.get('label').hasError('maxlength')">{{ 'settings.userFields.labelMax' | translate }}</mat-error>`],
  ['<mat-error *ngIf="form.get(\'label\').hasError(\'minlength\')">Label has to be at least 1 characters long. </mat-error>', `<mat-error *ngIf="form.get('label').hasError('minlength')">{{ 'settings.userFields.labelMin' | translate }}</mat-error>`],
  ['<gio-form-label>Required</gio-form-label>', `<gio-form-label>{{ 'settings.userFields.required' | translate }}</gio-form-label>`],
  ['aria-label="Required"', `[attr.aria-label]="'settings.userFields.required' | translate"`],
  ['<mat-label>Values</mat-label>', `<mat-label>{{ 'settings.userFields.values' | translate }}</mat-label>`],
  ['placeholder="Type value and confirm with enter."', `[placeholder]="'settings.userFields.valuesPlaceholder' | translate"`],
  [`[attr.aria-label]="'Cancel'"`, `[attr.aria-label]="'common.cancel' | translate"`],
  ['data-testid="dialog-cancel">Cancel</button>', `data-testid="dialog-cancel">{{ 'common.cancel' | translate }}</button>`],
  ['data-testid="dialog-save">\n      Save\n    </button>', `data-testid="dialog-save">\n      {{ 'common.save' | translate }}\n    </button>`],
]);

replaceAll(R + 'management/settings/notification/environment-notification.component.html', [
  ['<h3 class="notifications__title__main">Notifications</h3>', `<h3 class="notifications__title__main">{{ 'settings.notifications.title' | translate }}</h3>`],
  ['Configure your own Developer Portal notifications using Portal, Email or Webhook notifier', `{{ 'settings.notifications.subtitle' | translate }}`],
  [`[attr.aria-label]="'Add notification'"`, `[attr.aria-label]="'settings.notifications.addAria' | translate"`],
  ['<mat-icon svgIcon="gio:plus"></mat-icon>Add notification', `<mat-icon svgIcon="gio:plus"></mat-icon>{{ 'settings.notifications.add' | translate }}`],
]);
