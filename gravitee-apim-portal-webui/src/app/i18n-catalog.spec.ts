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
import { readFileSync } from 'fs';
import { join } from 'path';

function leaves(value: unknown, prefix: string, out: Record<string, string>): void {
  if (value && typeof value === 'object') {
    Object.keys(value as Record<string, unknown>).forEach(key => {
      leaves((value as Record<string, unknown>)[key], prefix ? `${prefix}.${key}` : key, out);
    });
    return;
  }
  out[prefix] = String(value);
}

function placeholders(value: string): string[] {
  const names = [...value.matchAll(/\{([a-zA-Z_][a-zA-Z0-9_]*)\s*,/g)].map(match => match[1]);
  const withoutBranches = value.replace(/\{[^{},]*\}/g, '');
  names.push(...[...withoutBranches.matchAll(/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g)].map(match => match[1]));
  return names.sort();
}

describe('portal i18n catalogs', () => {
  const en = JSON.parse(readFileSync(join(__dirname, '../assets/i18n/en.json'), 'utf8'));
  const ru = JSON.parse(readFileSync(join(__dirname, '../assets/i18n/ru.json'), 'utf8'));

  it('keeps the same keys and placeholders in English and Russian', () => {
    const enLeaves: Record<string, string> = {};
    const ruLeaves: Record<string, string> = {};
    leaves(en, '', enLeaves);
    leaves(ru, '', ruLeaves);

    expect(Object.keys(ruLeaves).sort()).toEqual(Object.keys(enLeaves).sort());
    Object.keys(enLeaves).forEach(key => {
      expect(placeholders(ruLeaves[key])).toEqual(placeholders(enLeaves[key]));
    });
  });
});
