import { testAttrs } from '@nikkierp/common/utils';
import React from 'react';

import type { TestIdAttributes } from '@nikkierp/common/utils';


/**
 * The `{module}.{component}` prefix for the `data-testid` of every field inside a form.
 *
 * It is a context of its own rather than a field on the form providers because there are four of
 * those (`CrudFormProvider`, `AdhocFormProvider`, the deprecated `FormFieldProvider`, and plain
 * `FormStyleProvider` layouts) and a prefix is orthogonal to all of them: a caller wraps whichever
 * provider it already uses, and every `AutoField` below picks the prefix up.
 */
const FormTestIdContext = React.createContext<string | undefined>(undefined);

export type FormTestIdProviderProps = React.PropsWithChildren & {
	/** `{module}.{component}`, e.g. `identity.userDetail`. */
	testId: string | undefined,
};

export function FormTestIdProvider(props: FormTestIdProviderProps): React.ReactNode {
	return (
		<FormTestIdContext.Provider value={props.testId}>
			{props.children}
		</FormTestIdContext.Provider>
	);
}

export function useFormTestIdPrefix(): string | undefined {
	return React.useContext(FormTestIdContext);
}

/**
 * `data-testid` for a form field, keyed by its schema field name. Emits nothing when there is no
 * field name to key off, so an unnamed input carries no attribute rather than a colliding one.
 */
export function useFieldTestAttrs(fieldName: string | undefined): TestIdAttributes {
	const prefix = useFormTestIdPrefix();
	return React.useMemo(
		() => (fieldName ? testAttrs(prefix ?? 'form', 'field', fieldName) : {}),
		[prefix, fieldName],
	);
}

/** `data-testid` for a control that belongs to a field but is not the input itself. */
export function useFieldPartTestAttrs(fieldName: string | undefined, part: string): TestIdAttributes {
	const prefix = useFormTestIdPrefix();
	return React.useMemo(
		() => (fieldName ? testAttrs(prefix ?? 'form', 'field', fieldName, part) : {}),
		[prefix, fieldName, part],
	);
}

/** `data-testid` for a form-level control such as submit or cancel. */
export function useFormActionTestAttrs(): (action: string) => TestIdAttributes {
	const prefix = useFormTestIdPrefix();
	return React.useCallback(
		(action: string) => testAttrs(prefix ?? 'form', action),
		[prefix],
	);
}
