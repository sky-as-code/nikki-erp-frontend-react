import React from 'react';

import { FORM_INPUT_SIZE, INLINE_INPUT_SIZE } from './inputDensity';

import type { FormInputSize } from './inputDensity';


/**
 * Whether the controls below sit in an inline-controls scope (`INLINE_CONTROLS_ATTRS`). The CSS
 * scope cannot reach a portalled dropdown, so the React tree carries the same fact to the controls
 * that size their dropdown from the Mantine `size` prop.
 */
const InlineControlsContext = React.createContext(false);

/** Marks its subtree as an inline-controls scope; pair it with `INLINE_CONTROLS_ATTRS` on the row. */
export function InlineControlsScope({ children }: { children: React.ReactNode }): React.ReactElement {
	return <InlineControlsContext.Provider value={true}>{children}</InlineControlsContext.Provider>;
}

export function useInlineControls(): boolean {
	return React.useContext(InlineControlsContext);
}

/**
 * The Mantine `size` a form field passes, for its text and its dropdown's options alike:
 * {@link FORM_INPUT_SIZE}, or {@link INLINE_INPUT_SIZE} in an inline-controls scope, where the row
 * shows small text and its dropdown must match it.
 */
export function useFormInputSize(): FormInputSize {
	return useInlineControls() ? INLINE_INPUT_SIZE : FORM_INPUT_SIZE;
}
