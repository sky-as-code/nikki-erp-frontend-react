import { z } from 'zod';

import type { ComponentNode } from '../metadata/types';


/**
 * Zod schemas shared by view kits.
 *
 * They live behind their own `@nikkierp/viewengine/schema` subpath, and are not
 * re-exported from `metadata`, so the rest of the core stays free of any runtime
 * validation dependency. Kits opt in; a kit built on valibot never loads this.
 */

/** Serializable field-renderer spec: `{ renderer, ...rendererSpecificOptions }`. */
export const fieldRendererSpecSchema = z.object({
	renderer: z.string().min(1),
}).catchall(z.unknown());

export const conditionOperatorSchema = z.enum([
	'equal', 'not_equal', 'in', 'not_in', 'gt', 'gte', 'lt', 'lte', 'exists', 'not_exists',
]);

export const conditionExpressionSchema = z.object({
	field: z.string().min(1),
	operator: conditionOperatorSchema,
	value: z.unknown().optional(),
});

/** A nested template invocation inside another template's props. */
export const templateRefSchema = z.object({
	template: z.string().min(1),
	props: z.unknown().optional(),
});

export const componentNodeSchema: z.ZodType<ComponentNode> = z.lazy(() => z.object({
	type: z.literal('component'),
	component: z.string().min(1),
	props: z.record(z.string(), z.unknown()).optional(),
	children: z.array(componentNodeSchema).optional(),
}));

export const pageNodeSchema = z.object({
	type: z.literal('page'),
	routePath: z.string(),
	template: z.string().min(1).optional(),
	props: z.unknown().optional(),
	children: z.array(componentNodeSchema).optional(),
});
