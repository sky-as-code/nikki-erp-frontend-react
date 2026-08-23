import * as dyn from '@nikkierp/common/dynamicModel';
import { RequestMaker } from '@nikkierp/common/request';
import i18next, { i18n, InitOptions } from 'i18next';
import LanguageDetector, { DetectorOptions } from 'i18next-browser-languagedetector';
import HttpBackend, { HttpBackendOptions } from 'i18next-http-backend';
import * as React from 'react';
import { initReactI18next, useTranslation } from 'react-i18next';


export default i18next;

/**
 * Re-running `i18next.init()` on the live singleton resets its resource store and restarts
 * namespace loading asynchronously. Any component rendering in that window resolves nothing and,
 * with no `fallbackLng` and `appendNamespaceToMissingKey`, renders the raw `common:some.key`.
 * Callers may fire more than once (React effects), so initialization is one-shot here.
 */
export function initI18n(
	debug: boolean,
	lng?: string | null,
	supportedLngs?: string[] | null,
): void {
	if (i18next.isInitialized || i18next.isInitializing) {
		void applyLanguage(lng);
		return;
	}

	const options: InitOptions & HttpBackendOptions = {
		debug,
		// No fallback language, so the missing translation will be surfaced
		// and easily detected to fix.
		// fallbackLng: 'en-US',
		supportedLngs: supportedLngs ?? ['en-US', 'vi-VN'],
		ns: ['common'],
		fallbackNS: ['common'],
		maxRetries: 0,
		appendNamespaceToMissingKey: true,
		backend: buildBackendOptions(),
		interpolation: {
			escapeValue: false,
		},
	};

	i18next
		.use(HttpBackend)
		.use(initReactI18next);

	if (lng) {
		i18next
			.init<InitOptions & HttpBackendOptions>({
				...options,
				lng: lng!,
			});
	}
	else {
		i18next
			.use(LanguageDetector)
			.init<InitOptions & HttpBackendOptions>({
				...options,
				detection: buildDetectionOptions(),
			});
	}
}

/**
 * Switch language on an already-initialized instance. `changeLanguage` loads the missing
 * namespaces before it resolves, so it never empties the resource store the way `init` does.
 */
async function applyLanguage(lng?: string | null): Promise<void> {
	if (!lng || i18next.language === lng) return;
	await i18next.changeLanguage(lng);
}

function buildBackendOptions(): HttpBackendOptions {
	return {
		loadPath(lngs, namespaces) {
			return `v1/essential/languages/json?language_code=${lngs[0]}&module_name=${namespaces[0]}`;
		},
		async request(options, url, payload, callback) {
			try {
				// `data` only: the request layer returns a `{data, clientErrors}` envelope,
				// and i18next expects the bare translation map.
				const { data } = await RequestMaker.default().get(url);
				callback(null, {
					status: 200,
					data: JSON.stringify(data),
				});
			}
			catch (error) {
				callback(null, {
					status: 500,
					data: String(error),
				});
			}
		},
	};
}

function buildDetectionOptions(): DetectorOptions {
	return {
		order: [
			'navigator', // browser language
		],
	} as DetectorOptions;
}

/**
 * Deep-merge micro-app translation bundles into the shared shell `i18n` instance.
 * Use this from a micro-app `init()` instead of wrapping with another `I18nextProvider`.
 * Under default namespace `common`, shell already exposes `nikki.*`; micro-apps can add a
 * sibling tree (e.g. `coremart.*`) without replacing `nikki`.
 *
 * @example
 * registerMicroAppI18nResources({
 * 	vi: { common: { extra_app: { KeyName: { myKey: '…' } } } } },
 * 	en: { common: { extra_app: { KeyName: { myKey: '…' } } } } },
 * });
 * @deprecated Use HttpBackend instead
 */
export function registerMicroAppI18nResources(
	patch: Record<string, Record<string, unknown>>,
): void {
	for (const [lng, byNs] of Object.entries(patch)) {
		if (byNs === null || typeof byNs !== 'object') continue;
		for (const [ns, bundle] of Object.entries(byNs)) {
			if (bundle === null || typeof bundle !== 'object') continue;
			i18next.addResourceBundle(lng, ns, bundle, true, false);
			ensureNamespaceRegistered(ns);
		}
	}
}

function ensureNamespaceRegistered(ns: string): void {
	const opts = i18next.options;
	const raw = opts.ns;
	if (typeof raw === 'string') {
		if (raw === ns) return;
		opts.ns = [raw, ns];
		return;
	}
	if (Array.isArray(raw)) {
		if (raw.includes(ns)) return;
		opts.ns = [...raw, ns];
		return;
	}
	opts.ns = [ns];
}

export function useI18n(): i18n {
	const trans = useTranslation();
	return trans.i18n;
}

export type TranslateFn = ReturnType<typeof useTranslation>['t'];
export type LocalizeFn = (
	langJson: dyn.ModelSchemaLangJson | string | null | undefined,
	translateOpts?: { count: number },
) => string;

export function useTranslate(moduleName?: string | string[]): TranslateFn {
	const trans = useTranslation(moduleName);
	return trans.t as any;
}

export function useLocalize(moduleName?: string): LocalizeFn {
	const trans = useTranslation(moduleName);
	return (langJson, translateOpts): string => {
		if (!langJson) return '';
		if (typeof langJson === 'string') {
			return trans.t(langJson, translateOpts);
		}
		const transKey = langJson[dyn.LangJsonRefKey];
		if (!transKey) {
			return langJson[trans.i18n.language] ?? '$missing.translation';
		}
		return trans.t(transKey, translateOpts);
	};
}

/**
 * Compares two already-translated strings the way the active locale orders them.
 *
 * Lists are sorted by what the reader sees, which is the translated label rather than the field
 * name or slug behind it -- those diverge in every locale, and in some of them the alphabet does
 * too. `localeCompare` with no locale would sort by the browser's, not the one the app is showing.
 *
 * The collator is rebuilt only when the language changes; constructing one per comparison is the
 * expensive part of an `Intl` sort.
 */
export function useLocaleCollator(): (a: string, b: string) => number {
	const { i18n } = useTranslation();
	const language = i18n.language;
	return React.useMemo(() => {
		const collator = new Intl.Collator(language, { sensitivity: 'base', numeric: true });
		return (a: string, b: string) => collator.compare(a, b);
	}, [language]);
}

export { JsonLangText } from './JsonLangText';
