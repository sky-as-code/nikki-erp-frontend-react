import React from 'react';

import type { ComboboxProps, PopoverWidth } from '@mantine/core';


export type SelectDefaults = {
	/**
	 * Lets the dropdown grow to its longest option instead of matching the control: a select in a
	 * narrow table cell would otherwise clip long labels such as a user's display name.
	 */
	contentWidthDropdown?: boolean,
};

/** Defaults for every `SearchableSelect` and `Select` below it; an explicit width still wins. */
export const SelectDefaultsContext = React.createContext<SelectDefaults>({});

/** No wider than this, nor than the room beside the control. */
const MAX_DROPDOWN_WIDTH = '32rem';

/**
 * A content-sized dropdown that is never narrower than its control and never runs off screen. The
 * size middleware measures both, which plain CSS on the dropdown cannot.
 */
export const contentWidthComboboxProps: Pick<ComboboxProps, 'width' | 'middlewares'> = {
	width: 'max-content',
	middlewares: {
		flip: true,
		shift: true,
		size: {
			apply({ rects, availableWidth, elements }) {
				Object.assign(elements.floating.style, {
					minWidth: `${rects.reference.width}px`,
					maxWidth: `min(${MAX_DROPDOWN_WIDTH}, ${availableWidth}px)`,
				});
			},
		},
	},
};

/** The dropdown width a select uses: its own `width` when given, else the content width if enabled. */
export function useDropdownWidthProps(width: PopoverWidth | undefined): Pick<ComboboxProps, 'width' | 'middlewares'> {
	const { contentWidthDropdown } = React.useContext(SelectDefaultsContext);
	return width === undefined && contentWidthDropdown ? contentWidthComboboxProps : { width };
}
