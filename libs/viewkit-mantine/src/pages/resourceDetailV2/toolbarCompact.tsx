import { useMeasuredWidth } from '@nikkierp/ui/components/ExcelDataTable';
import React from 'react';


/**
 * The action row's width under which its icon buttons drop their labels. Narrower than the list
 * table's 768px fold: the detail row holds a handful of buttons, which still fit labelled at 700px.
 */
export const DETAIL_TOOLBAR_COMPACT_PX = 600;

const ToolbarCompactContext = React.createContext(false);

/**
 * Measures the action row and tells its buttons whether to go icon-only. Measured rather than a
 * media query: the row is as narrow in a split view's pane as on a phone. Before the first
 * reading (and where `ResizeObserver` does not exist) the row is not compact.
 */
export function useToolbarCompactMeasure(): { ref: React.RefCallback<HTMLElement>, compact: boolean } {
	const [width, setWidth] = React.useState<number | null>(null);
	const measuredRef = useMeasuredWidth(setWidth);
	const ref = React.useCallback((element: HTMLElement | null) => {
		if (typeof ResizeObserver !== 'undefined') {
			measuredRef(element);
		}
	}, [measuredRef]);
	return { ref, compact: width !== null && width > 0 && width < DETAIL_TOOLBAR_COMPACT_PX };
}

export function ToolbarCompactProvider({ compact, children }: {
	compact: boolean,
	children: React.ReactNode,
}): React.ReactNode {
	return <ToolbarCompactContext.Provider value={compact}>{children}</ToolbarCompactContext.Provider>;
}

export function useToolbarCompact(): boolean {
	return React.useContext(ToolbarCompactContext);
}

/**
 * A toolbar button's label and icon: the icon beside the label, or the icon alone in a compact row,
 * the label kept as its accessible name and tooltip.
 */
export function useToolbarButtonContent(icon: React.ReactNode, label: string): {
	leftSection?: React.ReactNode,
	children: React.ReactNode,
	'aria-label'?: string,
	title?: string,
} {
	const compact = useToolbarCompact();
	return compact
		? { children: icon, 'aria-label': label, title: label }
		: { leftSection: icon, children: label };
}
