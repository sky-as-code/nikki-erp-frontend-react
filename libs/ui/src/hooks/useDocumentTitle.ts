import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Hook to set document title based on translation key
 * @param translationKey - The translation key to use for the title
 * @param defaultValue - Optional default value if translation is not found
 */
export function useDocumentTitle(translationKey: string, defaultValue?: string): void {
	const { t: translate } = useTranslation();

	useEffect(() => {
		document.title = translate(translationKey, { defaultValue });
	}, [translate, translationKey, defaultValue]);
}
