import { TranslateFn } from '@nikkierp/ui/i18n';
import React from 'react';


export type RibbonContextValue = {
	currentPath: string,
	pathPrefix: string,
	t: TranslateFn,
	/** Called when an entry navigates, so a floating panel closes even on a link to the current page. */
	onNavigate: () => void,
};

export const RibbonContext = React.createContext<RibbonContextValue | null>(null);

export function useRibbonContext(): RibbonContextValue {
	const value = React.useContext(RibbonContext);
	if (!value) {
		throw new Error('Ribbon entries render only inside RibbonMenuBar.');
	}
	return value;
}
