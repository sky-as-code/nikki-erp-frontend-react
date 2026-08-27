import { useDebouncedValue } from '@mantine/hooks';
import * as dyn from '@nikkierp/common/dynamicModel';
import React from 'react';
import { useWatch } from 'react-hook-form';

import { useCrudFormRuntime, useFormField } from './formContext';
import { useCommand } from '../../hookhoc/useCommand';


/**
 * How long to let the user keep typing before asking the server to recompute. Matches
 * `RelationSelectField`'s search debounce: the same "settle, then ask" feel, and the same reason —
 * one request per pause rather than one per keystroke.
 */
const RECOMPUTE_DEBOUNCE_MS = 300;

export type ComputedFieldValue = {
	/** The freshest computed value, or undefined before the first recompute returns. */
	value: unknown,
	/** True while a recompute is in flight, for a caller that wants to show it. */
	isPending: boolean,
	/** True when this field is function-computed and declares a dependency to watch. */
	isLive: boolean,
};

/**
 * Keeps a function-computed field's displayed value in step with the field it depends on, without
 * saving anything.
 *
 * A computed field's value normally arrives with the record, computed from what is stored. That is
 * stale the moment the user edits the field it derives from — and the correct answer lives in Go
 * on the server, not in the form. So when the watched field settles, the unsaved model is posted
 * to `meta/compute/{field}` and the answer replaces what was loaded.
 *
 * Returns `isLive: false` for every other field, including non-function computed kinds: those are
 * computed from data the server already has, so no unsaved edit can change them.
 */
export function useComputedField(fieldName: string): ComputedFieldValue {
	const { crudSchema, control } = useFormField();
	const modelSchema = crudSchema?.modelSchema;
	const schemaName = crudSchema?.schemaName;

	const dependsOn = React.useMemo(
		() => dyn.findComputedDependency(modelSchema, fieldName),
		[modelSchema, fieldName],
	);

	// The trigger is the declared dependency alone, so an unrelated keystroke never fires a
	// request. Watched unconditionally with a possibly-empty list, since hooks cannot be skipped.
	const watchNames = React.useMemo<string[]>(() => (dependsOn ? [dependsOn] : []), [dependsOn]);
	const trigger = useWatch({ control, name: watchNames }) as unknown[];
	const [debouncedTrigger] = useDebouncedValue(trigger?.[0], RECOMPUTE_DEBOUNCE_MS);

	// The whole form goes in the request body, because the function may read any field of the
	// model, not only the one that triggered it. Read through the runtime rather than watched, so
	// it contributes no extra renders.
	const runtime = useCrudFormRuntime();

	const command = schemaName && dependsOn ? dyn.resourceCommands(schemaName).COMPUTE_FIELD : '';
	const compute = useCommand<dyn.RestComputeFieldResponse>(command);
	const publish = compute.publish;
	const [value, setValue] = React.useState<unknown>(undefined);

	React.useEffect(() => {
		if (!command || !dependsOn) {
			return;
		}
		void publish({
			field: fieldName,
			model: runtime?.form.getValues() ?? { [dependsOn]: debouncedTrigger },
		}).then(response => {
			const data = response.result?.data;
			if (data) {
				setValue(data.value);
			}
		});
		// `useCommand` stamps each call and ignores the answer to any but the latest, so a burst
		// of edits settles on the last value rather than on whichever request returns last.
	}, [publish, command, fieldName, dependsOn, debouncedTrigger, runtime]);

	return {
		// A failed recompute leaves the previous value standing: a stale number reads better than
		// a field that blanks itself whenever the network hiccups.
		value,
		isPending: compute.isPending,
		isLive: Boolean(command && dependsOn),
	};
}
