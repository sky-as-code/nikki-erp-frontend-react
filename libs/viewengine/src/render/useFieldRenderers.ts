import React from 'react';

import { useViewEngine } from './ViewEngineContext';

import type { FieldRendererMap } from '../core';
import type { FieldRendererSpec } from '../metadata/types';


/**
 * Resolves serializable field-renderer specs against the host engine at render
 * time.
 *
 * Resolving at *page-build* time (the previous `resolveFieldRendererMap`) broke
 * three things at once: the page stopped being serializable, the lookup hit a
 * module singleton the host could not see, and the renderer set was frozen
 * before any later-loading kit could contribute to it.
 */
export function useFieldRenderers(
	specs?: Record<string, FieldRendererSpec>,
): FieldRendererMap | undefined {
	const engine = useViewEngine();
	return React.useMemo(() => engine.resolveFieldRenderers(specs), [engine, specs]);
}
