import React from 'react';

import { fetchValueFormatDefaults } from './valueRendererSettings';
import { useI18n } from '../../i18n';
import { useFormatDefaults } from '../Localized/formatDefaults';

import type { FormatDefaults } from '../Localized/formatDefaults';


export type ResolvedFormatDefaults = FormatDefaults & { locale: string };

/**
 * The Shell's `FormatDefaults` context when it reaches this copy of the library, else the user
 * settings fetched over the command bus: a micro-app bundles its own `@nikkierp/ui`, so its context
 * object is not the one the Shell provides.
 */
export function useValueFormatDefaults(): ResolvedFormatDefaults {
	const fromContext = useFormatDefaults();
	const hasContext = Boolean(fromContext.locale);
	const [fetched, setFetched] = React.useState<FormatDefaults>({});
	const i18n = useI18n();

	React.useEffect(() => {
		if (hasContext) {
			return undefined;
		}
		let active = true;
		fetchValueFormatDefaults()
			.then((defaults) => {
				if (active) setFetched(defaults);
			})
			.catch(() => undefined);
		return () => {
			active = false;
		};
	}, [hasContext]);

	const defaults = hasContext ? fromContext : fetched;
	return { ...defaults, locale: defaults.locale ?? i18n.language };
}
