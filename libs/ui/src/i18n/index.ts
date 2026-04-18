import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';


import en from './locales/en';
import vi from './locales/vi';


const resources = {
	vi: { common: vi },
	en: { common: en },
};

i18n
	// .use(i18nextHttpBackend)
	.use(initReactI18next)
	.init({
		resources,
		lng: 'vi',
		fallbackLng: 'en',
		debug: false,
		defaultNS: 'common',
		ns: ['common'],

		//* load from server
		// backend: {
		// loadPath: 'https://api.example.com/translations?lang={{lng}}&ns={{ns}}',
		// customHeaders: {
		// 	Authorization: 'Bearer YOUR_TOKEN',
		// },
		// },

		interpolation: {
			escapeValue: false,
		},
	});


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
 */
export function registerMicroAppI18nResources(
	patch: Record<string, Record<string, unknown>>,
): void {
	for (const [lng, byNs] of Object.entries(patch)) {
		if (byNs === null || typeof byNs !== 'object') continue;
		for (const [ns, bundle] of Object.entries(byNs)) {
			if (bundle === null || typeof bundle !== 'object') continue;
			i18n.addResourceBundle(lng, ns, bundle, true, false);
			ensureNamespaceRegistered(ns);
		}
	}
}

function ensureNamespaceRegistered(ns: string): void {
	const opts = i18n.options;
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


export default i18n;
