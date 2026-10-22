import { useFieldRenderers } from '@nikkierp/viewengine/render';
import React from 'react';

import type { ResourceDetailV2Props } from './props';
import type { FieldRendererMap } from '@nikkierp/viewengine/core';


export type DetailFieldDisplay = {
	/** Read-mode renderers of the page's own fields, resolved from the page's `fieldRenderers`. */
	fieldRenderers?: FieldRendererMap,
	stableFieldLayout: boolean,
};

const DetailFieldDisplayContext = React.createContext<DetailFieldDisplay>({ stableFieldLayout: false });

/**
 * Carries the page-level display options down to the form columns, which the view engine renders
 * from metadata and so cannot receive them as props.
 */
export function DetailFieldDisplayProvider({ value, children }: {
	value: DetailFieldDisplay,
	children: React.ReactNode,
}): React.ReactNode {
	return <DetailFieldDisplayContext.Provider value={value}>{children}</DetailFieldDisplayContext.Provider>;
}

export function useDetailFieldDisplay(): DetailFieldDisplay {
	return React.useContext(DetailFieldDisplayContext);
}

/** Resolves the page's `fieldRenderers` specs and provides them with `stableFieldLayout`. */
export function DetailFieldDisplayScope({ params, children }: {
	params: Pick<ResourceDetailV2Props, 'fieldRenderers' | 'stableFieldLayout'>,
	children: React.ReactNode,
}): React.ReactNode {
	const fieldRenderers = useFieldRenderers(params.fieldRenderers);
	const stableFieldLayout = params.stableFieldLayout ?? false;
	const value = React.useMemo(() => ({ fieldRenderers, stableFieldLayout }), [fieldRenderers, stableFieldLayout]);
	return <DetailFieldDisplayProvider value={value}>{children}</DetailFieldDisplayProvider>;
}
