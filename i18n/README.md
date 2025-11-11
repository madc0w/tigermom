# Internationalization (i18n)

This directory contains translation files for the application.

## How it works

The application automatically detects the user's browser language and loads the appropriate translation file. If no translation file exists for the detected language, it falls back to English (`en`).

## Adding a new language

To add support for a new language:

1. **Create a new translation file** (e.g., `fr.ts` for French):

```typescript
import type { Translations } from './en';

export const fr: Translations = {
	app: {
		title: 'TutorLux',
		logoAlt: 'Logo TutorLux',
		tagline: 'Restez organisé. Gardez le contrôle de vos tâches.',
	},
	auth: {
		signIn: 'Se connecter',
		signUp: "S'inscrire",
		// ... (translate all other keys)
	},
	// ... (continue translating all sections)
};
```

2. **Register the language in `useI18n.ts`**:

```typescript
import { en } from '../i18n/en';
import { fr } from '../i18n/fr';

const translations: Record<string, Translations> = {
	en,
	fr, // Add your new language here
};
```

## Available languages

- **English** (`en`) - Default language
- Add more languages following the steps above

## Browser language detection

The `useI18n` composable automatically:
1. Detects the browser's language setting
2. Extracts the primary language code (e.g., `en` from `en-US`)
3. Returns the matching translation or defaults to English

## Usage in components

```vue
<script setup>
import { useI18n } from '../composables/useI18n';

const { t } = useI18n();
</script>

<template>
	<h1>{{ t.value.app.title }}</h1>
</template>
```

Note: Always use `t.value` to access translations since `t` is a computed ref.
