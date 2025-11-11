import { reactive } from 'vue';
import { en } from '../i18n/en';
import { fr } from '../i18n/fr';

// Map of available translations
const translationMap: Record<string, any> = {
	en,
	fr,
};

// Detect browser language immediately on client side
function getInitialLanguage() {
	if (typeof window === 'undefined') return 'en';

	const browserLang = navigator.language || (navigator as any).userLanguage;
	const langCode = browserLang.split('-')[0].toLowerCase();

	return translationMap[langCode] ? langCode : 'en';
}

const initialLang = getInitialLanguage();

// Export the translations as a reactive object with the correct initial language
export const translations = reactive({ ...translationMap[initialLang] });

export const currentLang = reactive({ value: initialLang });

// Save language preference
if (typeof window !== 'undefined') {
	document.cookie = `preferred-lang=${initialLang}; path=/; max-age=31536000`;
}

// Get list of available languages with their display names
export function getAvailableLanguages() {
	// Use the current language's translations to get the language names
	return Object.keys(translationMap).map((langCode) => ({
		code: langCode,
		name: translations.languages[langCode] || langCode,
	}));
}

// Switch to a different language
export function switchLanguage(langCode: string) {
	if (translationMap[langCode]) {
		Object.assign(translations, translationMap[langCode]);
		currentLang.value = langCode;
		if (typeof window !== 'undefined') {
			document.cookie = `preferred-lang=${langCode}; path=/; max-age=31536000`;
		}
	}
}

export function useI18n() {
	return {
		t: translations,
		currentLang,
		switchLanguage,
		getAvailableLanguages,
	};
}
