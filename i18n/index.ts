import type { Translations } from './en';
import { en } from './en';
import { fr } from './fr';

const translations: Record<string, any> = {
	en,
	fr,
};

export function getTranslations(locale: string): Translations {
	return (translations[locale] || translations.en) as Translations;
}

export { en, fr };
export type { Translations };
