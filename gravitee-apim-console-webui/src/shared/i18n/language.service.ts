import { Injectable, signal } from '@angular/core';

import { Language, translations } from './translations';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly storageKey = 'gio-console-lang';

  readonly currentLanguage = signal<Language>(this.getInitialLanguage());

  setLanguage(language: Language): void {
    this.currentLanguage.set(language);
    localStorage.setItem(this.storageKey, language);
  }
  translate(key: string, params?: Record<string, string | number>): string {
    const language = this.currentLanguage();

    const translation = this.getTranslation(translations[language], key) ?? this.getTranslation(translations.en, key) ?? key;

    return this.interpolate(translation, params);
  }
  private interpolate(translation: string, params?: Record<string, string | number>): string {
    if (!params) {
      return translation;
    }

    return translation.replace(/\{(\w+)\}/g, (match, key: string) => {
      const value = params[key];

      return value !== undefined ? String(value) : match;
    });
  }

  private getTranslation(source: unknown, key: string): string | undefined {
    const value = key.split('.').reduce<unknown>((current, part) => {
      if (typeof current !== 'object' || current === null || !(part in current)) {
        return undefined;
      }

      return (current as Record<string, unknown>)[part];
    }, source);

    return typeof value === 'string' ? value : undefined;
  }

  private getInitialLanguage(): Language {
    const language = localStorage.getItem(this.storageKey);

    return language === 'ru' ? 'ru' : 'en';
  }
}
