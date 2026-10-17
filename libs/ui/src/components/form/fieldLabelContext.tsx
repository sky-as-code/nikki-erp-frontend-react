import React from 'react';


export type FieldLabelOptions = {
	/**
	 * Keeps the label for assistive technology only, e.g. a field inside a table cell whose column
	 * header already names it. Description is dropped; the validation error still shows.
	 */
	labelHidden: boolean,
};

const defaultOptions: FieldLabelOptions = { labelHidden: false };

/**
 * A context rather than a prop so every field component wrapped in `BaseFieldWrapper` honours it,
 * including the nested ones (`LangJsonField`), without each of them forwarding a prop.
 */
export const FieldLabelContext = React.createContext<FieldLabelOptions>(defaultOptions);

export type FieldLabelProviderProps = FieldLabelOptions & {
	children: React.ReactNode,
};

export function FieldLabelProvider({ labelHidden, children }: FieldLabelProviderProps): React.ReactNode {
	const value = React.useMemo(() => ({ labelHidden }), [labelHidden]);
	return <FieldLabelContext.Provider value={value}>{children}</FieldLabelContext.Provider>;
}

export function useFieldLabelHidden(): boolean {
	return React.useContext(FieldLabelContext).labelHidden;
}
