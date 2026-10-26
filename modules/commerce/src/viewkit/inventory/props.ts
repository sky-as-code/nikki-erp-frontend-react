import { defineComponent } from '@nikkierp/viewengine/metadata';

import { ATTRIBUTE_VALUES, TEMPLATE_ATTRIBUTES } from './ids';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/**
 * The attribute's values, edited inline and saved with the attribute's own create or update. It
 * belongs in both `createNodes` and `childrenNodes`; React-free so pages stay plain JSON.
 */
export function attributeValuesNode(): ComponentNode {
	return defineComponent({ component: ATTRIBUTE_VALUES });
}

/**
 * The template's attribute lines and exclusions, saved with the template's own create or update.
 * It belongs in both `createNodes` and `childrenNodes`.
 */
export function templateAttributesNode(): ComponentNode {
	return defineComponent({ component: TEMPLATE_ATTRIBUTES });
}

export * from './ids';
