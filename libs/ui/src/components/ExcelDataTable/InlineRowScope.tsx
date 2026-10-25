import React from 'react';

import { ROW_SELECT_DEFAULTS } from './rowSelectDefaults';
import { InlineControlsScope } from '../Input/inlineControls';
import { SelectDefaultsContext } from '../SearchableSelect/dropdownWidth';


/**
 * The React half of a row in insert or edit mode; the row element itself carries
 * `INLINE_CONTROLS_ATTRS`, the CSS half. Dropdowns are portalled out of the row, so what they must
 * know about it (wider than the cell, options at the row's small text) travels by context.
 */
export function InlineRowScope({ children }: { children: React.ReactNode }): React.ReactElement {
	return (
		<SelectDefaultsContext.Provider value={ROW_SELECT_DEFAULTS}>
			<InlineControlsScope>{children}</InlineControlsScope>
		</SelectDefaultsContext.Provider>
	);
}
