import clsx from 'clsx';

import panelClasses from './FormPanel.module.css';


/** How a `resource_form__column` sits in the form panel (`isFluid`, `showSeparator` on its props). */
export type FormPanelSectionLayout = {
	isFluid?: boolean,
	showSeparator?: boolean,
};

/**
 * Class of one section of the form panel. The panel draws the separators between sections; a section
 * that is not fluid takes a row of its own, and one without a separator draws none.
 */
export function formPanelSectionClass(layout: FormPanelSectionLayout): string {
	return clsx(
		panelClasses.section,
		layout.isFluid === false && panelClasses.fullRow,
		layout.showSeparator === false && panelClasses.noSeparator,
	);
}
