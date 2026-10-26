import React from 'react';


/**
 * Marks a portalled dropdown as part of the ribbon: Mantine renders menus under `<body>`, outside
 * the tab strip and the panel, and picking an entry there must not count as leaving the ribbon.
 */
export const RIBBON_DROPDOWN_PROPS = { 'data-ribbon-dropdown': true } as const;

/**
 * Closes the floating panel when the pointer or focus lands outside the ribbon, or on Escape. Focus
 * is watched as well as the pointer so a keyboard user tabbing past the ribbon collapses it too.
 */
export function useDismissFloatingPanel(
	active: boolean,
	refs: ReadonlyArray<React.RefObject<HTMLElement | null>>,
	onDismiss: () => void,
): void {
	React.useEffect(() => {
		if (!active) {
			return undefined;
		}
		const isInside = (target: EventTarget | null) => target instanceof Element && (
			refs.some(ref => ref.current?.contains(target)) || target.closest('[data-ribbon-dropdown]') !== null
		);
		const onOutside = (event: Event) => {
			if (!isInside(event.target)) onDismiss();
		};
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') onDismiss();
		};
		document.addEventListener('pointerdown', onOutside);
		document.addEventListener('focusin', onOutside);
		document.addEventListener('keydown', onKeyDown);
		return () => {
			document.removeEventListener('pointerdown', onOutside);
			document.removeEventListener('focusin', onOutside);
			document.removeEventListener('keydown', onKeyDown);
		};
	}, [active, refs, onDismiss]);
}
