import { resolveActionCode } from './actionEntitlements';


/** A page-declared command action the entitlement lock cannot gate. */
export type UngatedAction = {
	schemaName: string,
	label: string,
	command: string,
};

type ActionLike = { label?: unknown, command?: unknown, actionCode?: unknown };

/**
 * Every command action in a page tree that resolves to no action code, so would render ungated.
 *
 * Meant for a module's page test: `expect(findUngatedActions(pages)).toEqual([])`. A custom verb
 * the derivation does not know must carry an explicit `actionCode`, copied from the backend
 * application service, or the button stays clickable for a user the server will refuse.
 *
 * Walks plain JSON, since page metadata is plain JSON: any object with a `schemaName` is a
 * template's props, and its `extraActions` / `contextualActions` are the page's own actions.
 */
export function findUngatedActions(node: unknown): UngatedAction[] {
	const found: UngatedAction[] = [];
	walk(node, found);
	return found;
}

function walk(node: unknown, found: UngatedAction[]): void {
	if (Array.isArray(node)) {
		node.forEach(child => walk(child, found));
		return;
	}
	if (node == null || typeof node !== 'object') {
		return;
	}
	const record = node as Record<string, unknown>;
	if (typeof record.schemaName === 'string') {
		collectFrom(record.schemaName, record.extraActions, found);
		collectFrom(record.schemaName, record.contextualActions, found);
	}
	Object.values(record).forEach(child => walk(child, found));
}

function collectFrom(schemaName: string, actions: unknown, found: UngatedAction[]): void {
	if (actions == null || typeof actions !== 'object') {
		return;
	}
	const list = (Array.isArray(actions) ? actions : Object.values(actions)) as ActionLike[];
	for (const action of list) {
		if (typeof action?.command !== 'string') {
			continue;
		}
		const actionCode = typeof action.actionCode === 'string' ? action.actionCode : undefined;
		if (resolveActionCode({ actionCode, command: action.command }) == null) {
			found.push({ schemaName, label: String(action.label ?? ''), command: action.command });
		}
	}
}
