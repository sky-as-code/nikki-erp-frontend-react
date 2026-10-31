/**
 * A stand-in for `@nikkierp/ui/i18n` in the detail-page component tests. It has no imports of its own,
 * so a `vi.mock` factory can load it while the module it replaces is still being mocked.
 */
const MESSAGES: Record<string, string> = {
	'audit.toggle': 'Audit',
	'audit.tab.history': 'History',
	'audit.tab.comments': 'Comments',
	'audit.comments.empty': 'No comments yet.',
	'audit.history.empty': 'No history yet.',
	'audit.history.loadMore': 'Load older entries',
	'audit.history.loadFailed': 'The history could not be loaded.',
	'audit.actor.system': 'System',
	'audit.message.create': '{{resource}} created',
	'audit.message.archive': '{{resource}} archived',
	'audit.message.custom': 'Action: {{action}}',
	'action.close': 'Close',
	'action.refresh': 'Refresh',
	'action.suspend': 'Suspend',
	'permission.field_read_locked': 'Locked: {{expression}}',
	'iam_user.label_one': 'user',
	'iam_user.label_other': 'users',
	'iam_role.label_one': 'Role',
	'iam_role.label_other': 'Roles',
	'form.collapseSection': 'Collapse section',
	'form.expandSection': 'Expand section',
	'form.generalInformation': 'General information',
	'form.statusFlow': 'Status',
	'form.statusStepOf': 'Step {{current}} of {{total}}',
	'fields.display_name': 'Display name',
	'fields.status': 'Status',
	'status.active': 'Active',
	'status.suspended': 'Suspended',
};

/** Resolves `ns:key` by its key, and a `count` by i18next's `_one` / `_other` suffixes. */
function testTranslate(rawKey: string, vars?: Record<string, unknown>): string {
	const key = rawKey.includes(':') ? rawKey.slice(rawKey.indexOf(':') + 1) : rawKey;
	const count = vars?.count;
	const plural = typeof count === 'number' ? MESSAGES[`${key}_${count === 1 ? 'one' : 'other'}`] : undefined;
	const message = plural ?? MESSAGES[key];
	if (message === undefined) {
		return `test:${key}`;
	}
	return message.replace(/\{\{(\w+)\}\}/g, (_, name: string) => String(vars?.[name] ?? ''));
}

function testLocalize(langJson: unknown, opts?: { count: number }): string {
	if (!langJson) {
		return '';
	}
	if (typeof langJson === 'string') {
		return testTranslate(langJson, opts);
	}
	const ref = (langJson as Record<string, string>).$ref;
	return ref ? testTranslate(ref, opts) : ((langJson as Record<string, string>)['en-US'] ?? '');
}

export const testI18nMock = {
	useTranslate: () => testTranslate,
	useLocalize: () => testLocalize,
	useI18n: () => ({ language: 'en-US' }),
};
