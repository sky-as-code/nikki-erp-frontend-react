import React from 'react';


/**
 * Where a view mode's icon lives, because page metadata cannot hold one.
 *
 * A page declares its modes through `getViewModes`, which runs where the page is authored and can
 * therefore take a real React element. Metadata, though, has to survive `JSON.stringify` — so the
 * element stays here and the page props carry only the token that finds it again at render time.
 *
 * The consequence, and the reason this is a deliberate trade rather than an oversight: a page
 * whose modes carry icons is no longer reconstructible from its JSON alone. That costs nothing
 * today, because a remote page cannot execute a `getViewModes` factory either; a mode whose icon
 * is missing still renders with its label.
 */
const icons = new Map<string, React.ReactNode>();

let sequence = 0;

/** Stores an icon and returns the token that reads it back. */
export function registerViewModeIcon(icon: React.ReactNode): string {
	sequence += 1;
	const token = `viewMode:${sequence}`;
	icons.set(token, icon);
	return token;
}

export function getViewModeIcon(token: string | undefined): React.ReactNode {
	return token === undefined ? undefined : icons.get(token);
}
