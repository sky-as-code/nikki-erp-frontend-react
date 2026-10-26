import { PageNode } from '@nikkierp/viewengine/metadata';

import { buildUomPages } from '../pages/essential/uom';
import { buildUomCatPages } from '../pages/essential/uomcat';


/**
 * Unit-of-measure pages proxied from the essential micro-app, which keeps its schemas and services
 * (and everything else it hosts: settings, org home): Commerce registers none of them.
 */
export function buildEssentialPages(): PageNode[] {
	return [...buildUomPages(), ...buildUomCatPages()];
}
