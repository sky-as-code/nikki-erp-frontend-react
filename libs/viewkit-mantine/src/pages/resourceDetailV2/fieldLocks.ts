import { buildFieldExpression, ResourceScope } from '@nikkierp/common/entitlements';

import type { FieldVisibilityMode } from './fieldVisibility';
import type { ActionLock } from '../../permissions';


/** Which refusal a locked field explains: reading it, or updating it. */
export type FieldLockKind = 'read' | 'update';

export type FieldLockView = {
	kind: FieldLockKind,
	/** The expressions the caller lacks, for the refusal modal. */
	missing: string[],
};

export type FieldLockInput = {
	schemaName: string,
	field: string,
	mode: FieldVisibilityMode,
	/** Whether update mode offers an input for the field (as opposed to read-only text). */
	editable: boolean,
	readLock?: ActionLock,
	updateLock?: ActionLock,
	/**
	 * The server blanked the field in the loaded record (`meta.masked_fields`): the field itself, or the
	 * edge a foreign key or dotted field reaches through (`org_unit` / `org_unit.*` for `org_unit_id`).
	 */
	masked: boolean,
	/** What the masked field lacks, from `maskedFieldMissing` (`read:<dest>:org` for a masked edge). */
	maskedMissing?: string[],
};

/**
 * Decides how one field renders under field-level permissions, or null when it renders as usual.
 *
 * - Not readable (by the client check, or because the server masked it): locked in every mode; the
 *   refusal explains `read` in view mode and `update` where update mode offers an input.
 * - Readable but not updatable: the value shows in view mode and locks in update mode.
 *
 * Create mode is not decided here: there is no record yet, and the create form writes through the
 * resource's create grant.
 */
export function fieldLockView(input: FieldLockInput): FieldLockView | null {
	if (input.mode === 'create') {
		return null;
	}
	const readLocked = input.masked || input.readLock?.locked === true;
	if (input.mode === 'update' && input.editable) {
		if (input.updateLock?.locked) {
			return { kind: 'update', missing: input.updateLock.missing };
		}
		return readLocked ? { kind: 'update', missing: missingOrDerived(input, 'read', input.readLock) } : null;
	}
	return readLocked ? { kind: 'read', missing: missingOrDerived(input, 'read', input.readLock) } : null;
}

/**
 * A field the server masked although the client check allowed it (a private or org-unit grant the
 * client cannot evaluate per record, or a masked edge) has no refused expression of its own: the one
 * `maskedMissing` names, else the field-level one at the default org scope.
 */
function missingOrDerived(input: FieldLockInput, action: string, lock?: ActionLock): string[] {
	if (lock?.locked && lock.missing.length > 0) {
		return lock.missing;
	}
	if (input.maskedMissing && input.maskedMissing.length > 0) {
		return input.maskedMissing;
	}
	return [buildFieldExpression(action, input.schemaName, input.field, ResourceScope.Org)];
}

/**
 * The keys of an update payload the caller may send: everything but the schema fields the caller
 * may not update and the fields the server masked on load (their form value is the blanked null,
 * and sending it back would overwrite the stored value). Keys naming no schema field and the
 * addressing keys pass through.
 */
export function updatablePayload(
	payload: Record<string, unknown>,
	schemaFields: ReadonlySet<string>,
	updateLocks: Record<string, ActionLock>,
	maskedFields: readonly string[],
): Record<string, unknown> {
	return Object.fromEntries(Object.entries(payload).filter(([key]) => {
		if (ADDRESSING_FIELDS.has(key) || !schemaFields.has(key)) {
			return true;
		}
		return !maskedFields.includes(key) && updateLocks[key]?.locked !== true;
	}));
}

/** Mirrors the backend's addressing keys, which need no field grant. */
const ADDRESSING_FIELDS: ReadonlySet<string> = new Set(['id', 'etag', 'org_id', 'tenant_id']);
