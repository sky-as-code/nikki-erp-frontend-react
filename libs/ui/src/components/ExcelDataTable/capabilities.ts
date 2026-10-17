import React from 'react';

import { useHasEntitlement } from '../PermissionGuard/entitlementContext';

import type { NewRowConfig, RowWriteSinks } from './context';
import type {
	ExcelDataTableCapability, NewRowFieldEditor, NewRowSource, RowsDeletedSink, RowValuesSink,
} from './types';
import type { EntitlementRequirementInput } from '../PermissionGuard/entitlementContext';


export const allCapabilities: readonly ExcelDataTableCapability[] = ['update', 'create', 'delete'];

export type CapabilityInput = {
	capabilities?: ExcelDataTableCapability[],
	updateCommand?: string,
	createCommand?: string,
	deleteCommand?: string,
	onUpdated?: unknown,
	onCreated?: unknown,
	onDeleted?: unknown,
	newRowSource?: NewRowSource,
	newRowResourceSchema?: string,
	newRowSearchField?: string,
};

/**
 * Declared capabilities win. Without them, a table given an `updateCommand` keeps the inline update
 * it had before capabilities existed, so pages written against the old contract need no change.
 */
export function resolveCapabilities(input: CapabilityInput): ExcelDataTableCapability[] {
	if (input.capabilities) {
		return allCapabilities.filter(capability => input.capabilities!.includes(capability));
	}
	return input.updateCommand ? ['update'] : [];
}

type SinkNames = [command: keyof CapabilityInput, callback: keyof CapabilityInput];

const sinkNames: Record<ExcelDataTableCapability, SinkNames> = {
	update: ['updateCommand', 'onUpdated'],
	create: ['createCommand', 'onCreated'],
	delete: ['deleteCommand', 'onDeleted'],
};

/** Misconfigurations a page cannot see until a user clicks; pure so it can be tested. */
export function findCapabilityConfigErrors(input: CapabilityInput): string[] {
	const errors: string[] = [];
	for (const capability of resolveCapabilities(input)) {
		const [command, callback] = sinkNames[capability];
		if (!input[command] && !input[callback]) {
			errors.push(`capability '${capability}' needs either ${command} or ${callback}`);
		}
	}
	if (input.newRowSource === 'server-resource') {
		if (!input.newRowResourceSchema) {
			errors.push(`newRowSource 'server-resource' needs newRowResourceSchema`);
		}
		if (!input.newRowSearchField) {
			errors.push(`newRowSource 'server-resource' needs newRowSearchField`);
		}
	}
	return errors;
}

/** Reported once per distinct misconfiguration, and only in development builds. */
export function useCapabilityConfigCheck(input: CapabilityInput, tableName: string): void {
	const errors = import.meta.env.DEV ? findCapabilityConfigErrors(input) : [];
	const key = errors.join('\n');
	React.useEffect(() => {
		if (key) {
			console.error(`ExcelDataTable '${tableName}': ${key}`);
		}
	}, [key, tableName]);
}

export type CapabilityLock = { locked: boolean, missing: string[] };

export type CapabilityLocks = Record<ExcelDataTableCapability, CapabilityLock>;

export type CapabilityEntitlements = Partial<Record<ExcelDataTableCapability, EntitlementRequirementInput>>;

const unlocked: CapabilityLock = { locked: false, missing: [] };

type AskedLock = { requirement: EntitlementRequirementInput, capability: ExcelDataTableCapability };

/**
 * Locks a capability whose entitlement the caller lacks. Unlocked while the entitlement context
 * loads, like `useActionLock`: a cold load must not flash a refusal on every button.
 */
export function useCapabilityLocks(entitlements: CapabilityEntitlements): CapabilityLocks {
	// Keyed by value, so a page passing a fresh requirement object each render does not re-check.
	const key = JSON.stringify(allCapabilities.map(capability => entitlements[capability] ?? null));
	const asked = React.useMemo(
		() => (JSON.parse(key) as Array<EntitlementRequirementInput | null>)
			.map((requirement, index) => ({ requirement, capability: allCapabilities[index] }))
			.filter((entry): entry is AskedLock => entry.requirement != null),
		[key],
	);
	const requirements = React.useMemo(() => asked.map(entry => entry.requirement), [asked]);
	const decision = useHasEntitlement(requirements);
	return React.useMemo(() => {
		const locks: CapabilityLocks = { update: unlocked, create: unlocked, delete: unlocked };
		if (decision.isPending) {
			return locks;
		}
		asked.forEach((entry, index) => {
			const result = decision.results[index];
			if (result && !result.allowed) {
				locks[entry.capability] = { locked: true, missing: [result.expression] };
			}
		});
		return locks;
	}, [asked, decision]);
}

/**
 * Puts `field` first, where an assignment's record search sits, keeping the rest in order. Callers
 * that fetch apply it to the requested fields too, so the column is always projected.
 */
export function withLeadingField(fields: string[], field: string | undefined): string[] {
	if (!field) {
		return fields;
	}
	return [field, ...fields.filter(other => other !== field)];
}

/** The Provider props that decide what a user may do to rows, and where each write goes. */
export type ExcelDataTableRowWriteProps = {
	/**
	 * What the table lets the user do; absent or empty means read-only. A table without it but with
	 * an `updateCommand` keeps its legacy inline update.
	 */
	capabilities?: ExcelDataTableCapability[],
	/** The command an inline row update publishes; `onUpdated` takes the payload when absent. */
	updateCommand?: string,
	/** The command the insert row publishes; `onCreated` takes the values when absent. */
	createCommand?: string,
	/** The command a row delete publishes with `{ ids }`; `onDeleted` takes the rows when absent. */
	deleteCommand?: string,
	onUpdated?: RowValuesSink,
	onCreated?: RowValuesSink,
	onDeleted?: RowsDeletedSink,
	/** Locks the matching controls when the caller lacks it; the backend's assertion, verbatim. */
	updateEntitlement?: EntitlementRequirementInput,
	createEntitlement?: EntitlementRequirementInput,
	deleteEntitlement?: EntitlementRequirementInput,
	/** Defaults to `user-input`. */
	newRowSource?: NewRowSource,
	/** With `server-resource`: the schema whose records the insert row searches. */
	newRowResourceSchema?: string,
	/** With `server-resource`: the column holding the record search, shown first. */
	newRowSearchField?: string,
	/** Searches the records through this command instead of the schema's default search. */
	newRowSearchCommand?: string,
	/** Replaces the insert button's default "Add a line" label. */
	newRowPrompt?: string,
	/** Per-column editors replacing the insert row's default `AutoField`. */
	newRowFieldEditors?: Record<string, NewRowFieldEditor>,
};

export type RowCapabilities = {
	capabilities: ExcelDataTableCapability[],
	locks: CapabilityLocks,
	canUpdateRows: boolean,
	sinks: RowWriteSinks,
	newRow: NewRowConfig,
};

const emptyEditors: Record<string, NewRowFieldEditor> = {};

export function useRowCapabilities(props: ExcelDataTableRowWriteProps, tableName: string): RowCapabilities {
	useCapabilityConfigCheck(props, tableName);
	const capabilityKey = resolveCapabilities(props).join(',');
	const capabilities = React.useMemo(
		() => (capabilityKey ? capabilityKey.split(',') as ExcelDataTableCapability[] : []), [capabilityKey],
	);
	const locks = useCapabilityLocks({
		update: props.updateEntitlement, create: props.createEntitlement, delete: props.deleteEntitlement,
	});
	const sinks = useRowWriteSinks(props);
	const newRow = useNewRowConfig(props);
	return React.useMemo(() => ({
		capabilities,
		locks,
		canUpdateRows: capabilities.includes('update') && !locks.update.locked,
		sinks,
		newRow,
	}), [capabilities, locks, sinks, newRow]);
}

function useRowWriteSinks(props: ExcelDataTableRowWriteProps): RowWriteSinks {
	const { updateCommand, createCommand, deleteCommand, onUpdated, onCreated, onDeleted } = props;
	return React.useMemo(
		() => ({ updateCommand, createCommand, deleteCommand, onUpdated, onCreated, onDeleted }),
		[updateCommand, createCommand, deleteCommand, onUpdated, onCreated, onDeleted],
	);
}

function useNewRowConfig(props: ExcelDataTableRowWriteProps): NewRowConfig {
	const source = props.newRowSource ?? 'user-input';
	const { newRowResourceSchema, newRowSearchField, newRowSearchCommand, newRowPrompt } = props;
	const fieldEditors = props.newRowFieldEditors ?? emptyEditors;
	return React.useMemo(() => ({
		source,
		resourceSchema: newRowResourceSchema,
		searchField: newRowSearchField,
		searchCommand: newRowSearchCommand,
		prompt: newRowPrompt,
		fieldEditors,
	}), [source, newRowResourceSchema, newRowSearchField, newRowSearchCommand, newRowPrompt, fieldEditors]);
}
