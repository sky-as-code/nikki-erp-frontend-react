import React from 'react';

import { useCrudFormRuntime } from './formContext';


/**
 * The current values of `names` in the enclosing `CrudFormProvider`, re-read whenever one of them
 * changes; `null` outside a form or when `names` is empty.
 *
 * Subscribes through the runtime's `form.watch` rather than `useWatch`, which throws when no form
 * is above it: callers render in read mode too, where they read the record instead.
 */
export function useWatchedFormValues(names: readonly string[]): Record<string, unknown> | null {
	const form = useCrudFormRuntime()?.form;
	const namesKey = names.join('\u0000');
	const read = React.useCallback(
		(): Record<string, unknown> | null => (form && namesKey ? pickValues(form.getValues(), namesKey) : null),
		[form, namesKey],
	);
	const [values, setValues] = React.useState(read);

	React.useEffect(() => {
		setValues(read());
		if (!form || !namesKey) {
			return undefined;
		}
		const watched = namesKey.split('\u0000');
		const subscription = form.watch((_all, { name }) => {
			if (!name || watched.some(field => name === field || name.startsWith(`${field}.`))) {
				setValues(read());
			}
		});
		return () => subscription.unsubscribe();
	}, [form, namesKey, read]);

	return values;
}

function pickValues(all: Record<string, unknown> | undefined, namesKey: string): Record<string, unknown> {
	return Object.fromEntries(namesKey.split('\u0000').map(name => [name, all?.[name]]));
}
