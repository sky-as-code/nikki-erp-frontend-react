import i18n from 'i18next';

const SUPPORTED_LANGS = ['vi', 'en'] as const;

export function JsonToString(value: unknown): string {
	if (typeof value === 'string') return value;
	if (value && typeof value === 'object') {
		const loc = value as Record<string, string>;

		const currentLang = i18n.language;
		if (loc[currentLang]) return loc[currentLang];

		for (const lang of SUPPORTED_LANGS) {
			if (loc[lang]) return loc[lang];
		}
		

		return Object.values(loc)[0] ?? '';
	}
	return '';
}

export function StringToJson(value: string | Record<string, string>): Record<string, string> {
	if (typeof value === 'string') {
		return SUPPORTED_LANGS.reduce(
			(acc, lang) => {
				acc[lang] = value;
				return acc;
			},
			{} as Record<string, string>
		);
	}
	return {
		...SUPPORTED_LANGS.reduce(
			(acc, lang) => {
				acc[lang] = '';
				return acc;
			},
			{} as Record<string, string>
		),
		...value,
	};
}