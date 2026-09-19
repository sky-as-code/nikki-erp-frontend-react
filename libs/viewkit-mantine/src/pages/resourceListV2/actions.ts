import { commandActionCode, StandardActionCode } from '../../permissions';

import type { ResourceListV2Props } from './props';
import type { DataTableAction } from '@nikkierp/ui/components/DataTable';
import type { TranslateFn } from '@nikkierp/ui/i18n';


/**
 * One toolbar entry of the v2 list, in the shape `useActionLocks` gates. The list is data, not
 * elements, so the entitlement pass can run once and the bar can fold it into a menu on a
 * compact screen.
 */
export type ResourceListAction = Pick<
	DataTableAction, 'label' | 'testId' | 'command' | 'href' | 'requireSelection' | 'supportMultiple' | 'locked' | 'lockedMissing'
> & { kind: 'refresh' | 'link' | 'command', collapsed?: boolean };

/**
 * The same entries v1 builds, in the same order: refresh, create, import, delete, the page's
 * extra actions, archive. Selection-scoped entries are hidden until rows are selected; the
 * archive entry lives behind the `[...]` menu as v1 placed it after a separator.
 */
export function buildResourceListActions(
	params: ResourceListV2Props, t: TranslateFn, baseHref: string | undefined,
): ResourceListAction[] {
	const actions: ResourceListAction[] = [{ kind: 'refresh', label: t('action.refresh'), testId: 'refresh' }];
	if (params.createEnabled && baseHref) {
		// Absolute: the list renders both at `/{org}/{module}/{page}` and, in a split view, at
		// `/{org}/{module}/{page}/:id`, so a relative href lands elsewhere.
		actions.push({ kind: 'link', label: t('action.create'), testId: 'create', href: `${baseHref}/new` });
	}
	if (params.importEnabled && baseHref) {
		actions.push({ kind: 'link', label: t('action.import'), testId: 'import', href: `${baseHref}/import` });
	}
	if (params.deleteCommand) {
		actions.push({
			kind: 'command', label: t('action.delete'), command: params.deleteCommand, testId: 'delete',
			requireSelection: true, supportMultiple: true,
		});
	}
	for (const extra of params.extraActions) {
		// A page that lists a command the template already built a button for would show it twice —
		// `iam_user` declares delete in both `deleteCommand` and `extraActions`. The standard button
		// wins: it carries the icon and the entitlement gate.
		if (extra.command && actions.some(action => action.command === extra.command)) {
			continue;
		}
		actions.push({
			kind: 'command', label: t(extra.label), command: extra.command, testId: extra.testId,
			requireSelection: extra.requireSelection, supportMultiple: extra.supportMultiple,
		});
	}
	if (params.archiveCommand) {
		actions.push({
			kind: 'command', label: t('action.archive'), command: params.archiveCommand, testId: 'archive',
			requireSelection: true, supportMultiple: true, collapsed: true,
		});
	}
	return actions;
}

/** The action code an entry performs, or null to leave it ungated (refresh needs nothing). */
export function listActionCode(action: Pick<DataTableAction, 'testId' | 'command'>): string | null {
	// Import writes records, so it is gated by the same entitlement as create.
	if (action.testId === 'create' || action.testId === 'import') {
		return StandardActionCode.Create;
	}
	return commandActionCode(action.command);
}

export function selectionModeOf(action: ResourceListAction): 'single' | 'multiple' | undefined {
	if (!action.requireSelection) {
		return undefined;
	}
	return action.supportMultiple ? 'multiple' : 'single';
}
