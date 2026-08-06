import React from 'react';


export interface ThemeModeModalRef {
	open: () => void;
	close: () => void;
}

export interface LangSwitchModalRef {
	open: () => void;
	close: () => void;
}

/**
 * Handle logout action.
 *
 * `signOut` is supplied by the caller — it comes from `useServiceLayer`, which can only
 * be called inside a component.
 */
export const handleLogout = (signOut: () => void, onClose?: () => void) => {
	signOut();
	if (onClose) {
		onClose();
	}
};

/**
 * Handle theme mode modal open
 */
export const handleThemeMode = (themeModeModalRef: React.RefObject<ThemeModeModalRef>, onClose?: () => void) => {
	themeModeModalRef?.current?.open();
	if (onClose) {
		onClose();
	}
};

/**
 * Handle language switch modal open
 */
export const handleLanguageSwitch =
	(langSwitchModalRef: React.RefObject<LangSwitchModalRef>, onClose?: () => void) => {
		langSwitchModalRef?.current?.open();
		if (onClose) {
			onClose();
		}
	};

/**
 * Handle menu item click based on action type
 */
export const handleMenuItemClick = (
	action: string | undefined,
	signOut: () => void,
	themeModeModalRef: React.RefObject<ThemeModeModalRef>,
	langSwitchModalRef: React.RefObject<LangSwitchModalRef>,
	onClose?: () => void,
) => {
	switch (action) {
		case 'signOut':
			handleLogout(signOut, onClose);
			break;
		case 'themeMode':
			handleThemeMode(themeModeModalRef, onClose);
			break;
		case 'language':
			handleLanguageSwitch(langSwitchModalRef, onClose);
			break;
		default:
			// No action needed
			break;
	}
};

