import * as ts from 'typescript';

import * as fs from 'fs';
import * as path from 'path';

import { LanguageService } from './language.service';
import { translations } from './translations';

type TranslationNode = string | { [key: string]: TranslationNode };

function collectLeaves(node: TranslationNode, prefix = ''): Array<{ path: string; value: string }> {
  if (typeof node === 'string') {
    return [{ path: prefix, value: node }];
  }

  return Object.entries(node).flatMap(([key, child]) => collectLeaves(child, prefix ? `${prefix}.${key}` : key));
}

function placeholders(value: string): string[] {
  return [...value.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort();
}

function prefixConflicts(paths: string[]): string[] {
  const sorted = [...paths].sort();
  const conflicts: string[] = [];

  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      if (sorted[j].startsWith(`${sorted[i]}.`)) {
        conflicts.push(sorted[i]);
      }
    }
  }

  return conflicts;
}

function translationSourceFiles(): string[] {
  const translationsDir = path.join(__dirname, 'translations');
  return ['en', 'ru'].flatMap(locale => {
    const localeDir = path.join(translationsDir, locale);
    return fs
      .readdirSync(localeDir)
      .filter(file => file.endsWith('.ts'))
      .map(file => path.join(localeDir, file));
  });
}

function propertyKey(name: ts.PropertyName): string | undefined {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
    return name.text;
  }
  return undefined;
}

function collectDuplicateObjectProperties(filePath: string): Array<{ file: string; key: string; lines: number[] }> {
  const sourceText = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true);
  const duplicates: Array<{ file: string; key: string; lines: number[] }> = [];

  const visit = (node: ts.Node): void => {
    if (ts.isObjectLiteralExpression(node)) {
      const seen = new Map<string, number[]>();

      for (const property of node.properties) {
        if (!ts.isPropertyAssignment(property) && !ts.isShorthandPropertyAssignment(property)) {
          continue;
        }

        const key = propertyKey(property.name);
        if (key === undefined) {
          continue;
        }

        const line = sourceFile.getLineAndCharacterOfPosition(property.name.getStart(sourceFile)).line + 1;
        const lines = seen.get(key) ?? [];
        lines.push(line);
        seen.set(key, lines);
      }

      for (const [key, lines] of seen) {
        if (lines.length > 1) {
          duplicates.push({ file: path.relative(path.join(__dirname, '../..'), filePath).replace(/\\/g, '/'), key, lines });
        }
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return duplicates;
}

function collectNodeKinds(node: TranslationNode, prefix = ''): Array<{ path: string; kind: 'string' | 'object' }> {
  if (typeof node === 'string') {
    return [{ path: prefix, kind: 'string' }];
  }

  return [
    { path: prefix, kind: 'object' },
    ...Object.entries(node).flatMap(([key, child]) => collectNodeKinds(child, prefix ? `${prefix}.${key}` : key)),
  ];
}

describe('i18n translations', () => {
  const enLeaves = collectLeaves(translations.en);
  const ruLeaves = collectLeaves(translations.ru);
  const enPaths = enLeaves.map(leaf => leaf.path);
  const ruPaths = ruLeaves.map(leaf => leaf.path);

  afterEach(() => {
    localStorage.removeItem('gio-console-lang');
  });

  it('EN and RU have identical translation paths', () => {
    expect(enPaths.sort()).toEqual([...ruPaths].sort());
  });

  it('has no string/object path conflicts', () => {
    expect(prefixConflicts(enPaths)).toEqual([]);
    expect(prefixConflicts(ruPaths)).toEqual([]);
  });

  it('has no duplicate property names in a single object literal', () => {
    const duplicates = translationSourceFiles().flatMap(filePath => collectDuplicateObjectProperties(filePath));

    expect(duplicates).toEqual([]);
  });

  it('EN and RU use the same node types at every path', () => {
    const enKinds = Object.fromEntries(collectNodeKinds(translations.en).map(node => [node.path, node.kind]));
    const ruKinds = Object.fromEntries(collectNodeKinds(translations.ru).map(node => [node.path, node.kind]));

    expect(Object.keys(enKinds).sort()).toEqual(Object.keys(ruKinds).sort());
    expect(enKinds).toEqual(ruKinds);
  });

  it('leaf translations are strings', () => {
    expect(enLeaves.every(leaf => typeof leaf.value === 'string')).toBe(true);
    expect(ruLeaves.every(leaf => typeof leaf.value === 'string')).toBe(true);
  });

  it('uses the same placeholders for matching EN and RU keys', () => {
    const ruByPath = new Map(ruLeaves.map(leaf => [leaf.path, leaf.value]));

    const mismatches = enLeaves.flatMap(leaf => {
      const ruValue = ruByPath.get(leaf.path);
      if (ruValue === undefined) {
        return [];
      }

      const enPlaceholders = placeholders(leaf.value).join(',');
      const ruPlaceholders = placeholders(ruValue).join(',');
      return enPlaceholders === ruPlaceholders ? [] : [{ path: leaf.path, en: enPlaceholders, ru: ruPlaceholders }];
    });

    expect(mismatches).toEqual([]);
  });

  it('resolves keys from every namespace and switches EN → RU → EN', () => {
    localStorage.removeItem('gio-console-lang');
    const languageService = new LanguageService();

    expect(languageService.translate('common.cancel')).toBe('Cancel');
    expect(languageService.translate('auth.login.submit')).toBe('Sign in');
    expect(languageService.translate('navigation.apis')).toBe('APIs');
    expect(languageService.translate('navigation.collapseMenu')).toBe('Collapse menu');
    expect(languageService.translate('navigation.expandMenu')).toBe('Expand menu');
    expect(languageService.translate('userMenu.signOut')).toBe('Sign Out');
    expect(languageService.translate('dashboard.tabs.overview')).toBe('Overview');
    expect(languageService.translate('tasks.details')).toBe('Details');
    expect(languageService.translate('messages.title')).toBe('Send a Broadcast Message');
    expect(languageService.translate('apis.list.add')).toBe('Add API');
    expect(languageService.translate('apis.creation.v2.actions.next')).toBe('NEXT');
    expect(languageService.translate('apis.creation.importV2.import')).toBe('Import');
    expect(languageService.translate('apis.creation.v4.card.create')).toBe('Create V4 API');
    expect(languageService.translate('apis.creation.importV4.title')).toBe('Import API');
    expect(languageService.translate('apis.navigation.items.configuration')).toBe('Configuration');
    expect(languageService.translate('apis.navigation.deploy.deploy')).toBe('Deploy');
    expect(languageService.translate('apis.general.form.name')).toBe('Name');
    expect(languageService.translate('apis.general.danger.title')).toBe('Danger Zone');
    expect(languageService.translate('applications.creation.title')).toBe('Application creation');
    expect(languageService.translate('applications.navigation.globalSettings')).toBe('Global settings');
    expect(languageService.translate('applications.list.title')).toBe('Applications');
    expect(languageService.translate('applications.members.add')).toBe('Add members');
    expect(languageService.translate('applications.subscriptions.title')).toBe('Subscriptions');
    expect(languageService.translate('applications.analytics.filters')).toBe('Filters');
    expect(languageService.translate('applications.metadata.dialog.createTitle')).toBe('Create Application metadata');
    expect(languageService.translate('gateways.list.title')).toBe('Gateways');
    expect(languageService.translate('gateways.status.started')).toBe('Started');
    expect(languageService.translate('observability.overview.title')).toBe('Overview');
    expect(languageService.translate('observability.logs.title')).toBe('Logs');
    expect(languageService.translate('analytics.dashboard.overview')).toBe('Platform Overview');
    expect(languageService.translate('analytics.logs.title')).toBe('Platform Logs');
    expect(languageService.translate('settings.navigation.root')).toBe('Settings');
    expect(languageService.translate('settings.analytics.title')).toBe('Analytics');
    expect(languageService.translate('alerts.list.title')).toBe('Alerts');
    expect(languageService.translate('alerts.tabs.activity')).toBe('Activity');
    expect(languageService.translate('audit.title')).toBe('Audit');
    expect(languageService.translate('audit.columns.event')).toBe('Event');
    expect(languageService.translate('apiProducts.list.title')).toBe('API Products');
    expect(languageService.translate('apiProducts.create.title')).toBe('Create API Product');
    expect(languageService.translate('kafka.list.title')).toBe('Kafka Standalones');
    expect(languageService.translate('kafka.add.title')).toBe('Create a new cluster');

    languageService.setLanguage('ru');
    expect(languageService.translate('common.cancel')).toBe('Отмена');
    expect(languageService.translate('auth.login.submit')).toBe('Войти');
    expect(languageService.translate('navigation.apis')).toBe('API');
    expect(languageService.translate('navigation.collapseMenu')).toBe('Свернуть меню');
    expect(languageService.translate('navigation.expandMenu')).toBe('Развернуть меню');
    expect(languageService.translate('userMenu.signOut')).toBe('Выйти');
    expect(languageService.translate('dashboard.tabs.overview')).toBe('Обзор');
    expect(languageService.translate('tasks.details')).toBe('Подробнее');
    expect(languageService.translate('messages.title')).toBe('Отправить рассылку');
    expect(languageService.translate('apis.list.add')).toBe('Добавить API');
    expect(languageService.translate('apis.creation.v2.actions.next')).toBe('ДАЛЕЕ');
    expect(languageService.translate('apis.creation.importV2.import')).toBe('Импортировать');
    expect(languageService.translate('apis.navigation.items.configuration')).toBe('Конфигурация');
    expect(languageService.translate('apis.navigation.deploy.deploy')).toBe('Развернуть');
    expect(languageService.translate('apis.general.form.name')).toBe('Название');
    expect(languageService.translate('apis.general.danger.title')).toBe('Опасная зона');
    expect(languageService.translate('applications.creation.title')).toBe('Создание приложения');
    expect(languageService.translate('applications.list.title')).toBe('Приложения');
    expect(languageService.translate('applications.members.add')).toBe('Добавить участников');
    expect(languageService.translate('applications.subscriptions.title')).toBe('Подписки');
    expect(languageService.translate('applications.analytics.filters')).toBe('Фильтры');
    expect(languageService.translate('applications.metadata.dialog.createTitle')).toBe('Создать метаданные приложения');
    expect(languageService.translate('applications.navigation.globalSettings')).toBe('Общие настройки');
    expect(languageService.translate('gateways.list.title')).toBe('Шлюзы');
    expect(languageService.translate('gateways.status.started')).toBe('Запущен');
    expect(languageService.translate('observability.overview.title')).toBe('Обзор');
    expect(languageService.translate('observability.logs.title')).toBe('Логи');
    expect(languageService.translate('analytics.dashboard.overview')).toBe('Обзор платформы');
    expect(languageService.translate('analytics.logs.title')).toBe('Логи платформы');
    expect(languageService.translate('settings.navigation.root')).toBe('Настройки');
    expect(languageService.translate('settings.analytics.title')).toBe('Аналитика');
    expect(languageService.translate('alerts.list.title')).toBe('Оповещения');
    expect(languageService.translate('alerts.tabs.activity')).toBe('Активность');
    expect(languageService.translate('audit.title')).toBe('Аудит');
    expect(languageService.translate('audit.columns.event')).toBe('Событие');
    expect(languageService.translate('apiProducts.list.title')).toBe('API-продукты');
    expect(languageService.translate('apiProducts.create.title')).toBe('Создать API-продукт');
    expect(languageService.translate('kafka.list.title')).toBe('Автономные Kafka');
    expect(languageService.translate('kafka.add.title')).toBe('Создать новый кластер');

    languageService.setLanguage('en');
    expect(languageService.translate('common.cancel')).toBe('Cancel');
    expect(languageService.translate('navigation.collapseMenu')).toBe('Collapse menu');
    expect(languageService.translate('navigation.expandMenu')).toBe('Expand menu');
    expect(languageService.translate('apis.creation.v2.actions.next')).toBe('NEXT');
    expect(languageService.translate('applications.creation.title')).toBe('Application creation');
    expect(languageService.translate('applications.navigation.globalSettings')).toBe('Global settings');
    expect(languageService.translate('gateways.list.title')).toBe('Gateways');
    expect(languageService.translate('observability.overview.title')).toBe('Overview');
    expect(languageService.translate('analytics.dashboard.overview')).toBe('Platform Overview');
    expect(languageService.translate('settings.navigation.root')).toBe('Settings');
    expect(languageService.translate('alerts.list.title')).toBe('Alerts');
    expect(languageService.translate('audit.title')).toBe('Audit');
    expect(languageService.translate('apiProducts.list.title')).toBe('API Products');
    expect(languageService.translate('kafka.list.title')).toBe('Kafka Standalones');
  });
});
