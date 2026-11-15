import * as fs from 'fs';
import * as path from 'path';

import { contextualDocumentationUrl } from './contextual-doc-url';

describe('contextual documentation', () => {
  const docsDir = path.join(__dirname, '../../docs');

  it('keeps the english file url and uses a russian file for ru', () => {
    expect(contextualDocumentationUrl('management-api', 'en')).toBe('./docs/management-api.md');
    expect(contextualDocumentationUrl('management-api')).toBe('./docs/management-api.md');
    expect(contextualDocumentationUrl('management-api', 'ru')).toBe('./docs/ru/management-api.md');
  });

  it('has a russian page for every english contextual page and keeps code and expressions', () => {
    const englishPages = fs
      .readdirSync(docsDir)
      .filter(file => file.endsWith('.md'))
      .sort();
    const russianPages = fs
      .readdirSync(path.join(docsDir, 'ru'))
      .filter(file => file.endsWith('.md'))
      .sort();

    expect(russianPages).toEqual(englishPages);

    const fencedBlocks = (value: string) => [...value.matchAll(/```[\s\S]*?```/g)].map(match => match[0]);
    const expressions = (value: string) => [...value.matchAll(/\$\{[^}]+\}|\{#[^}]+\}/g)].map(match => match[0]);
    const links = (value: string) => [...value.matchAll(/\[[^\]]*\]\(([^)]+)\)|<a href="([^"]+)"/g)].map(match => match[1] ?? match[2]);

    englishPages.forEach(file => {
      const english = fs.readFileSync(path.join(docsDir, file), 'utf8');
      const russian = fs.readFileSync(path.join(docsDir, 'ru', file), 'utf8');

      expect(fencedBlocks(russian)).toEqual(fencedBlocks(english));
      expect(expressions(russian)).toEqual(expressions(english));
      expect(links(russian)).toEqual(links(english));
    });
  });
});
