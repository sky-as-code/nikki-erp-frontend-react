import React from 'react';

import { getShortcutRegistry } from './registry';


/**
 * Confines every shortcut to the element behind `ref` while the component is mounted and `active`:
 * badges outside it are hidden and their keys do nothing. The innermost / last scope in document
 * order wins, so a modal opened from a modal takes over, and closing it hands the keys back.
 */
export function useShortcutScope(ref: React.RefObject<Element | null>, active = true): void {
	React.useEffect(() => {
		const root = ref.current;
		if (!active || !root) {
			return undefined;
		}
		return getShortcutRegistry().pushScope(root);
	}, [ref, active]);
}
