import { componentNodeSchema, conditionExpressionSchema } from '@nikkierp/viewengine/schema';
import { z } from 'zod';


export const schemaFieldSpecSchema = z.object({ schemaField: z.string().min(1) });
export const linkSpecSchema = z.object({ linkHref: z.string() });

export const statusOptionSchema = z.object({
	value: z.string(),
	label: z.string(),
	color: z.string(),
});

export const ownPropertySectionSchema = z.object({
	header: z.string(),
	fields: z.array(z.string()).optional(),
});

/**
 * Contextual action driven by a command name. `condition` is a serializable
 * expression rather than a predicate function.
 *
 * The old `buildRequest?: (resource) => unknown` escape hatch is gone: it was a
 * function in what is supposed to be metadata, and no page ever supplied one --
 * every call site fell through to the default request builder.
 */
export const resourceDetailExtraActionSchema = z.object({
	label: z.string().min(1),
	command: z.string().min(1),
	condition: conditionExpressionSchema.optional(),
});

/** Command names for standard CRUD actions, resolved by the owning module. */
export const standardActionCommandsSchema = z.object({
	getById: z.string().min(1).optional(),
	create: z.string().min(1).optional(),
	update: z.string().min(1).optional(),
	delete: z.string().min(1).optional(),
	archive: z.string().min(1).optional(),
});

export const resourceDetailPropsSchema = z.object({
	schemaName: z.string().min(1),
	translationNs: z.string().min(1),
	titleLvl1: schemaFieldSpecSchema.optional(),
	titleLvl2: schemaFieldSpecSchema.optional(),
	titleLvl3: linkSpecSchema.optional(),
	allStatuses: z.array(statusOptionSchema).optional(),
	currentStatus: schemaFieldSpecSchema.optional(),
	formSections: z.array(ownPropertySectionSchema).default([]),
	contextualActions: z.record(z.string(), resourceDetailExtraActionSchema).optional(),
	standardActionCommands: standardActionCommandsSchema.default({}),
	/** Extra component nodes appended inside the detail form section. */
	childrenNodes: z.array(componentNodeSchema).optional(),
}).strict();

export type ResourceDetailProps = z.infer<typeof resourceDetailPropsSchema>;
export type ResourceDetailPropsInput = z.input<typeof resourceDetailPropsSchema>;
export type SchemaFieldSpec = z.infer<typeof schemaFieldSpecSchema>;
export type LinkSpec = z.infer<typeof linkSpecSchema>;
export type StatusOption = z.infer<typeof statusOptionSchema>;
export type OwnPropertySection = z.infer<typeof ownPropertySectionSchema>;
export type ResourceDetailExtraAction = z.infer<typeof resourceDetailExtraActionSchema>;
export type ResourceDetailContextualActions = Record<string, ResourceDetailExtraAction>;
export type ResourceDetailStandardActionCommands = z.infer<typeof standardActionCommandsSchema>;
