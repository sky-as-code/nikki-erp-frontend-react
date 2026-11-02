import { z } from 'zod';

import { ErrorKeys } from './validationErrorKeys';

import type { ModelSchema, ModelSchemaField, ModelValidationSchema } from './model_schema';


/** What the conditional field maps (`required_fields` / `optional_fields`) do to a form right now. */
export type ConditionalFieldRules = {
	hidden: ReadonlySet<string>,
	required: ReadonlySet<string>,
};

const NO_RULES: ConditionalFieldRules = { hidden: new Set(), required: new Set() };

/** The source fields: those whose value decides what else shows. A form watches these. */
export function conditionalSourceFields(modelSchema: ModelSchema | undefined): string[] {
	if (!modelSchema) {
		return [];
	}
	return Object.entries(modelSchema.fields)
		.filter(([, fieldDef]) => fieldDef.required_fields != null || fieldDef.optional_fields != null)
		.map(([name]) => name)
		.sort();
}

/**
 * While a source field holds a value listed in its `required_fields` or `optional_fields`, every
 * other field is hidden except the sources, the fields listed for that value and those required
 * on create or update; the `required_fields` ones become required. An unset or unlisted value
 * changes nothing. Server-owned fields (key, auto-generated, computed) are no input and stay as
 * they are. Several active sources hide the union of what each hides.
 */
export function conditionalFieldRules(
	modelSchema: ModelSchema | undefined, values: Record<string, unknown>,
): ConditionalFieldRules {
	const sources = conditionalSourceFields(modelSchema);
	const active = sources.flatMap(source => listedFields(modelSchema!.fields[source], values[source]) ?? []);
	if (!modelSchema || active.length === 0) {
		return NO_RULES;
	}
	const required = new Set(active.flatMap(listed => listed.required));
	const alwaysShown = new Set([...sources, ...required]);
	const hidden = new Set<string>();
	active.forEach(listed => {
		const kept = new Set([...listed.required, ...listed.optional]);
		Object.entries(modelSchema.fields).forEach(([name, fieldDef]) => {
			if (!alwaysShown.has(name) && !kept.has(name) && !isExempt(fieldDef)) {
				hidden.add(name);
			}
		});
	});
	return { hidden, required };
}

/**
 * Whether a value the server reads as empty for a required field: nil, an empty string (trimmed,
 * as a blank input submits), an empty array or an empty object.
 */
export function isConditionallyEmpty(value: unknown): boolean {
	if (value == null) {
		return true;
	}
	if (typeof value === 'string') {
		return value.trim().length === 0;
	}
	if (Array.isArray(value)) {
		return value.length === 0;
	}
	return typeof value === 'object' && Object.keys(value).length === 0;
}

/**
 * `objectSchema` plus the fields the source values make required. Run beside the object's own
 * checks rather than as a refinement of it, which zod skips while any field is invalid: one submit
 * reports every missing field at once.
 */
export function withConditionalRequired(
	objectSchema: ModelValidationSchema, modelSchema: ModelSchema,
): ModelValidationSchema {
	if (conditionalSourceFields(modelSchema).length === 0) {
		return objectSchema;
	}
	return z.any().transform((raw: unknown, ctx) => {
		const values = (raw ?? {}) as Record<string, unknown>;
		const result = objectSchema.safeParse(raw);
		const issues = result.error?.issues ?? [];
		const reported = new Set(issues.map(issue => String(issue.path[0])));
		const missing = [...conditionalFieldRules(modelSchema, values).required]
			.filter(field => !reported.has(field) && isConditionallyEmpty(values[field]));
		if (!result.success || missing.length > 0) {
			// Re-raised as they are: the resolver maps each to its field by `path`.
			issues.forEach(issue => ctx.addIssue(issue as never));
			missing.forEach(field => ctx.addIssue({ code: 'custom', path: [field], message: ErrorKeys.missingRequiredField }));
			return z.NEVER;
		}
		return result.data;
	});
}

type ListedFields = { required: string[], optional: string[] };

function listedFields(fieldDef: ModelSchemaField, value: unknown): ListedFields[] | null {
	if (typeof value !== 'string' || value === '') {
		return null;
	}
	const required = fieldDef.required_fields?.[value];
	const optional = fieldDef.optional_fields?.[value];
	if (!required && !optional) {
		return null;
	}
	return [{ required: required ?? [], optional: optional ?? [] }];
}

function isExempt(fieldDef: ModelSchemaField): boolean {
	return Boolean(
		fieldDef.is_required_for_create || fieldDef.is_required_for_update || fieldDef.is_primary_key
		|| fieldDef.is_auto_generated || (fieldDef.is_computed && fieldDef.metadata?.writable !== true),
	);
}
