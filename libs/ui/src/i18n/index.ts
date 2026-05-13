import * as dyn from '@nikkierp/common/dynamic_model';
import { RequestMaker } from '@nikkierp/common/request';
import i18next, { i18n, InitOptions } from 'i18next';
import LanguageDetector, { DetectorOptions } from 'i18next-browser-languagedetector';
import HttpBackend, { HttpBackendOptions } from 'i18next-http-backend';
import { initReactI18next, useTranslation } from 'react-i18next';


export default i18next;

export function initI18n(
	debug: boolean,
	lng?: string | null,
	supportedLngs?: string[] | null,
): void {
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

function buildBackendOptions(): HttpBackendOptions {
	return {
		loadPath(lngs, namespaces) {
			return `v1/essential/languages/json?language_code=${lngs[0]}&module_name=${namespaces[0]}`;
		},
		async request(options, url, payload, callback) {
			try {
				const response = await RequestMaker.default().get(url);
				callback(null, {
					status: 200,
					data: JSON.stringify(response),
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
	langJson: dyn.ModelSchemaLangJson | null | undefined,
	translateOpts?: { count: number },
) => string;

export function useTranslate(moduleName: string | string[]): TranslateFn {
	const trans = useTranslation(moduleName);
	return trans.t as any;
}

export function useLocalize(moduleName: string): LocalizeFn {
	const trans = useTranslation(moduleName);
	return (langJson, translateOpts): string => {
		if (!langJson) return '';
		const transKey = langJson[dyn.LangJsonRefKey];
		if (!transKey) {
			return langJson[trans.i18n.language] ?? '$missing.translation';
		}
		return trans.t(transKey, translateOpts);
	};
}
