export type LocalizedText = string | Record<string, string> | null | undefined;

function normalizeLocalizedRecord(
	value: Record<string, unknown>,
): Record<string, string> | undefined {
	const entries = Object.entries(value)
		.filter(([, item]) => typeof item === 'string')
		.map(([locale, text]) => [locale, (text as string).trim()] as const)
		.filter(([, text]) => text.length > 0);

	if (entries.length === 0) {
		return undefined;
	}

	return Object.fromEntries(entries);
}

export function toLocalizedText(
	value: LocalizedText,
	defaultLocale = 'en',
): string | Record<string, string> | undefined {
	if (typeof value === 'string') {
		const text = value.trim();
		if (!text) {
			return undefined;
		}
		return { [defaultLocale]: text };
	}

	if (value && typeof value === 'object') {
		return normalizeLocalizedRecord(value);
	}

	return undefined;
}