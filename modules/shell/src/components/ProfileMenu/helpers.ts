import { signOutAction } from '@nikkierp/shell/auth';
import React from 'react';


export interface ThemeModeModalRef {
	open: () => void;
	close: () => void;
}

/**
 * Handle logout action
 */
export const handleLogout = (dispatch: any, onClose?: () => void) => {
	dispatch(signOutAction());
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
 * Handle menu item click based on action type
 */
export const handleMenuItemClick = (
	action: string | undefined,
	dispatch: any,
	themeModeModalRef: React.RefObject<ThemeModeModalRef>,
	onClose?: () => void,
) => {
	switch (action) {
		case 'signOut':
			handleLogout(dispatch, onClose);
			break;
		case 'themeMode':
			handleThemeMode(themeModeModalRef, onClose);
			break;
		default:
			// No action needed
			break;
	}
};

