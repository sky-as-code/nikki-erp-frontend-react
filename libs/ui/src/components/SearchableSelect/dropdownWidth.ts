import type { ComboboxProps, PopoverWidth } from '@mantine/core';


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

/**
 * The dropdown width a select uses: its own `width` when given, else the content width, so a select
 * narrower than its labels (a unit beside a price, a table cell) never clips its options.
 */
export function dropdownWidthProps(width: PopoverWidth | undefined): Pick<ComboboxProps, 'width' | 'middlewares'> {
	return width === undefined ? contentWidthComboboxProps : { width };
}
