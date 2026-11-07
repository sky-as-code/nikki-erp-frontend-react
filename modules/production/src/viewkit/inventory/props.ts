// Proxy copy of the two template-attribute nodes of commerce/src/viewkit/inventory/props.ts. The
// components themselves are commerce's, installed on the host-owned view engine by its micro-app.
import { defineComponent } from '@nikkierp/viewengine/metadata';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


const TEMPLATE_ATTRIBUTES = 'nikkierp.inventory.components.templateAttributes.v1';
const TEMPLATE_ATTRIBUTES_HEADER = 'nikkierp.inventory.components.templateAttributesHeader.v1';

export function templateAttributesNode(): ComponentNode {
	return defineComponent({ component: TEMPLATE_ATTRIBUTES });
}

export function templateAttributesHeaderNode(): ComponentNode {
	return defineComponent({ component: TEMPLATE_ATTRIBUTES_HEADER });
}
