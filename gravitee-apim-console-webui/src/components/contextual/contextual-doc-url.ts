export function contextualDocumentationUrl(page: string, language?: string): string {
  if (language === 'ru') {
    return `./docs/ru/${page}.md`;
  }

  return `./docs/${page}.md`;
}
