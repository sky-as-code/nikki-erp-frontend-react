import { NewRow } from './NewRow';

import type React from 'react';


/**
 * Where the insert row renders, after the body rows. Kept as its own part so the insert row and the
 * row actions can evolve without touching the same lines of `Table`.
 */
export function NewRowSlot(): React.ReactNode {
	return <NewRow />;
}
