import { buildExpression, buildFieldExpression, ResourceScope } from '@nikkierp/common/entitlements';

import type * as dyn from '@nikkierp/common/dynamicModel';


const READ_ACTION = 'read';

/**
 * Whether the server masked `edge`: it lists the edge itself (`org_unit`) or any selection through it
 * (`org_unit.name`). The edge value is then null on the record, so nothing under it can be shown.
 */
export function isEdgeMasked(maskedFields: readonly string[] | null | undefined, edge: string): boolean {
	return (maskedFields ?? []).some(name => name === edge || name.startsWith(`${edge}.`));
}

/**
 * The entitlements a field lacks because the server masked it (`masked_fields`), or null when it is not
 * masked. Three cases render locked:
 *
 * - the field itself is masked → `read:<schema>.<field>:org`;
 * - a dotted field (`org_unit.name`) whose root edge is masked → `read:<dest>:org`;
 * - a foreign key (`org_unit_id`) whose edge is masked, the edge label being what the field shows →
 *   `read:<dest>:org`.
 *
 * The scope is the default `org`: a masked field has no refused expression of its own to show.
 */
export function maskedFieldMissing(
	modelSchema: dyn.ModelSchema | undefined,
	field: string,
	maskedFields: readonly string[] | null | undefined,
): string[] | null {
	if (!modelSchema || !maskedFields || maskedFields.length === 0) {
		return null;
	}
	const isDotted = field.includes('.');
	if (!isDotted && maskedFields.includes(field)) {
		return [buildFieldExpression(READ_ACTION, modelSchema.name, field, ResourceScope.Org)];
	}
	const relation = isDotted
		? modelSchema.to_relations?.find(rel => rel.edge === field.split('.', 1)[0])
		: modelSchema.to_relations?.find(rel => rel.src_field === field);
	if (!relation || !isEdgeMasked(maskedFields, relation.edge)) {
		return null;
	}
	return [buildExpression(READ_ACTION, relation.dest_schema_name, ResourceScope.Org)];
}
