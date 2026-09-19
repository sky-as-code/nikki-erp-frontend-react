import { describe, expect, it } from 'vitest';

import { buildResourceListActions, listActionCode, selectionModeOf } from './actions';
import { resourceListV2PropsSchema } from './props';

import type { TranslateFn } from '@nikkierp/ui/i18n';


const t = ((key: string) => key) as unknown as TranslateFn;

describe('buildResourceListActions', () => {
	it('builds refresh only for a bare list', () => {
		const params = resourceListV2PropsSchema.parse({ schemaName: 's', translationNs: 'n', searchCommand: 'c' });
		expect(buildResourceListActions(params, t, '/org/mod/page').map(a => a.testId)).toEqual(['refresh']);
	});

	it('keeps the v1 order and marks archive as collapsed', () => {
		const params = resourceListV2PropsSchema.parse({
			schemaName: 's', translationNs: 'n', searchCommand: 'c', createEnabled: true, importEnabled: true,
			deleteCommand: 'del', archiveCommand: 'arc', extraActions: [{ label: 'x', command: 'ext' }],
		});
		const actions = buildResourceListActions(params, t, '/base');
		// Every action this template builds carries a stable testId; only a page's own extra action
		// falls back to its command, since the template has no name to give it.
		expect(actions.map(a => a.testId ?? a.command)).toEqual([
			'refresh', 'create', 'import', 'delete', 'ext', 'archive',
		]);
		expect(actions.find(a => a.command === 'arc')?.collapsed).toBe(true);
		expect(actions.find(a => a.testId === 'create')?.href).toBe('/base/new');
	});

	// `iam_user` declares delete in both `deleteCommand` and `extraActions`, which rendered two
	// identical Delete buttons side by side.
	it('drops an extra action that repeats a command already built', () => {
		const params = resourceListV2PropsSchema.parse({
			schemaName: 's', translationNs: 'n', searchCommand: 'c', deleteCommand: 'del',
			extraActions: [{ label: 'action.delete', command: 'del' }, { label: 'x', command: 'other' }],
		});
		const commands = buildResourceListActions(params, t, '/base').map(a => a.command);

		expect(commands.filter(command => command === 'del')).toHaveLength(1);
		expect(commands).toContain('other');
	});

	it('drops create and import without a base href', () => {
		const params = resourceListV2PropsSchema.parse({
			schemaName: 's', translationNs: 'n', searchCommand: 'c', createEnabled: true, importEnabled: true,
		});
		expect(buildResourceListActions(params, t, undefined)).toHaveLength(1);
	});
});

describe('listActionCode', () => {
	it('gates create and import by the create entitlement and leaves refresh ungated', () => {
		expect(listActionCode({ testId: 'create' })).toBe('create');
		expect(listActionCode({ testId: 'import' })).toBe('create');
		expect(listActionCode({ testId: 'refresh' })).toBeNull();
	});
});

describe('selectionModeOf', () => {
	it('maps the v1 flags onto the action selection mode', () => {
		expect(selectionModeOf({ kind: 'command' })).toBeUndefined();
		expect(selectionModeOf({ kind: 'command', requireSelection: true })).toBe('single');
		expect(selectionModeOf({ kind: 'command', requireSelection: true, supportMultiple: true })).toBe('multiple');
	});
});
