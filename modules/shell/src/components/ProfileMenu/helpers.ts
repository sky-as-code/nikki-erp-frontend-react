import { routingService } from '@nikkierp/shell/routing';
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
 *
 * A hard navigation, not a route change: it drops every in-memory slice of the signed-out user,
 * and `PrivateLayout` never redirects on its own once a session was restored.
 */
export const handleLogout = (signOut: () => unknown, onClose?: () => void) => {
	if (onClose) {
		onClose();
	}
	void Promise.resolve(signOut()).finally(() => routingService.navigateTo({ to: '/signin', hardNavigate: true }));
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
	signOut: () => unknown,
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

