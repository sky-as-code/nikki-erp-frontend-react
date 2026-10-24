import React from 'react';

import { getShortcutRegistry } from './registry';

import type { ShortcutSpec } from './parseShortcut';
import type { ShortcutHandle, ShortcutOptions } from './registry';


/**
 * Registers the element behind `ref` for `Alt+{spec}` while the component is mounted. An
 * `undefined` spec registers nothing, so a wrapper can call this unconditionally.
 */
export function useShortcut(
	ref: React.RefObject<HTMLElement | null>,
	spec: ShortcutSpec | undefined,
	options: ShortcutOptions = {},
): void {
	const { mode = 'click', disabled = false } = options;
	const handleRef = React.useRef<ShortcutHandle | null>(null);
	const disabledRef = React.useRef(disabled);

	// Declared first so that a re-registration below reads the current value. Toggling `disabled`
	// updates the entry in place: re-registering would make it the newest, and so silently change
	// which control wins a conflict.
	React.useEffect(() => {
		disabledRef.current = disabled;
		handleRef.current?.update({ disabled });
	}, [disabled]);

	React.useEffect(() => {
		const element = ref.current;
		if (!spec || !element) {
			return undefined;
		}
		const handle = getShortcutRegistry().register(element, spec, { mode, disabled: disabledRef.current });
		handleRef.current = handle;
		return () => {
			handle?.unregister();
			handleRef.current = null;
		};
	}, [ref, spec, mode]);
}
