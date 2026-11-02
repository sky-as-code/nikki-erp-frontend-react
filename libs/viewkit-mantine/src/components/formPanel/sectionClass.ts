import clsx from 'clsx';

import panelClasses from './FormPanel.module.css';


/** How a `resource_form__column` sits in the form panel (`isFluid` on its props). */
export type FormPanelSectionLayout = {
	isFluid?: boolean,
};

/**
 * Class of one section of the form panel. Sections have no border; one that is not fluid takes a row of
 * its own.
 */
export function formPanelSectionClass(layout: FormPanelSectionLayout): string {
	return clsx(
		panelClasses.section,
		layout.isFluid === false && panelClasses.fullRow,
	);
}
