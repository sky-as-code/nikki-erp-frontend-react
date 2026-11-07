import { z } from 'zod';


const fieldSchema = z.object({
	name: z.string(),
	kind: z.enum(['relation', 'number', 'text', 'select', 'boolean', 'lines']),
	required: z.boolean(),
	options: z.array(z.string()).optional(),
	schema: z.string().optional(),
	labelField: z.string().optional(),
	filterField: z.string().optional(),
	/** `@field` reads the record, `=value` is a constant. */
	filterValue: z.string().optional(),
});

const actionSchema = z.object({
	key: z.string(),
	label: z.string(),
	actionCode: z.string(),
	/** The resource whose service runs the action and whose entitlement locks the button. */
	schemaName: z.string(),
	collection: z.boolean(),
	/** A collection action receives the record's id under this name (e.g. bom_id). */
	recordAs: z.string().optional(),
	condition: z.object({ field: z.string(), in: z.array(z.string()) }).optional(),
	fields: z.array(fieldSchema),
});

export const actionDialogsPropsSchema = z.object({
	schemaName: z.string(),
	actions: z.array(actionSchema),
}).strict();

export type ActionField = z.infer<typeof fieldSchema>;
export type ActionSpec = z.infer<typeof actionSchema>;
export type ActionDialogsProps = z.infer<typeof actionDialogsPropsSchema>;
