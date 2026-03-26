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


export default i18n;
