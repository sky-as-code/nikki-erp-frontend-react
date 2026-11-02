import React from 'react';

import { InlineControlsScope } from '../Input/inlineControls';


/**
 * The React half of a row in insert or edit mode; the row element itself carries
 * `INLINE_CONTROLS_ATTRS`, the CSS half. Dropdowns are portalled out of the row, so what they must
 * know about it (options at the row's small text) travels by context.
 */
export function InlineRowScope({ children }: { children: React.ReactNode }): React.ReactElement {
	return (
		<InlineControlsScope>{children}</InlineControlsScope>
	);
}
