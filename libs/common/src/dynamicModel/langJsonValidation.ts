import { z } from 'zod';

import { ErrorKeys } from './validationErrorKeys';


const REF_KEY = '$ref';

type DataTypeOptions = Record<string, unknown> | undefined;

/**
 * A LangJSON field: the string rules of its data type (`length`, `pattern`) apply to every
 * translation, and any one failing marks the whole field invalid with that rule's message. A blank
 * translation is skipped, since the server fills it from a neighbouring language before validating,
 * and so is `$ref`, which is a translation key rather than a text.
 */
export function createLangJsonSchema(options: DataTypeOptions): z.ZodTypeAny {
	const translationSchema = createTranslationSchema(options);
	return z.record(z.string(), z.string({ error: ErrorKeys.invalidDataType }), { error: ErrorKeys.invalidDataType })
		.superRefine((langJson, ctx) => {
			for (const [key, text] of Object.entries(langJson)) {
				if (key === REF_KEY || !text.trim()) {
					continue;
				}
				const checked = translationSchema.safeParse(text);
				if (!checked.success) {
					ctx.addIssue({ code: 'custom', message: checked.error.issues[0]?.message, input: langJson });
					return;
				}
			}
		});
}

/** Whether a LangJSON value carries no text: required means at least one translation, or a `$ref`. */
export function isLangJsonEmpty(value: unknown): boolean {
	if (value == null) {
		return true;
	}
	if (typeof value !== 'object' || Array.isArray(value)) {
		return false;
	}
	const entries = Object.entries(value as Record<string, unknown>);
	if (entries.some(([key, text]) => key === REF_KEY && Boolean(text))) {
		return false;
	}
	return entries.every(([, text]) => typeof text !== 'string' || !text.trim());
}

function createTranslationSchema(options: DataTypeOptions): z.ZodString {
	let schema = z.string();
	const length = options?.length;
	if (Array.isArray(length)) {
		const [minValue, maxValue] = length;
		if (typeof minValue === 'number') {
			schema = schema.min(minValue, ErrorKeys.invalidStringLength);
		}
		if (typeof maxValue === 'number') {
			schema = schema.max(maxValue, ErrorKeys.invalidStringLength);
		}
	}
	const pattern = compilePattern(options?.pattern);
	return pattern ? schema.regex(pattern, ErrorKeys.invalidStringPattern) : schema;
}

/**
 * The server sends a Go regular expression as its source text. RE2 syntax JavaScript cannot
 * compile is left to the server to enforce rather than failing every save on the client.
 */
function compilePattern(raw: unknown): RegExp | undefined {
	if (typeof raw !== 'string' || !raw) {
		return undefined;
	}
	try {
		return new RegExp(raw);
	}
	catch {
		return undefined;
	}
}
