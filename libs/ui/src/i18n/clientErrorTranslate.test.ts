import { translateClientError } from '@nikkierp/common/types';
import i18next, { i18n } from 'i18next';
import { beforeAll, describe, expect, it } from 'vitest';


/**
 * Against a real i18next instance, because the nesting contract (D3) is i18next behaviour: the
 * var is interpolated first, then `$t(...)` resolves the resulting namespaced key.
 */
describe('translateClientError with i18next', () => {
	let instance: i18n;

	beforeAll(async () => {
		instance = i18next.createInstance();
		await instance.init({
			lng: 'en-US',
			fallbackLng: false,
			ns: ['common', 'iam'],
			defaultNS: 'common',
			appendNamespaceToMissingKey: true,
			interpolation: { escapeValue: false },
			resources: {
				'en-US': {
					common: {
						resource_in_use: 'Cannot delete: referenced by $t({{referenced_by}})',
						greet: 'Hello {{name}}',
						used_by: 'Used by {{modules}}',
					},
					iam: { iam_role_user_assignments: 'role user assignments' },
				},
			},
		});
	});

	function translate(key: string, message: string, vars?: Record<string, unknown>): string {
		return translateClientError(instance.t.bind(instance), { key, message, vars });
	}

	it('interpolates vars', () => {
		expect(translate('common:greet', 'x', { name: 'Bob' })).toBe('Hello Bob');
	});

	it('nests a namespaced key carried by a var', () => {
		const vars = { referenced_by: 'iam:iam_role_user_assignments' };
		expect(translate('common:resource_in_use', 'x', vars))
			.toBe('Cannot delete: referenced by role user assignments');
	});

	it('falls back to the server message for a missing key', () => {
		expect(translate('common:no_such_key', 'Server says no')).toBe('Server says no');
	});

	it('joins an array var', () => {
		expect(translate('common:used_by', 'x', { modules: ['inventory', 'sales'] }))
			.toBe('Used by inventory, sales');
	});
});
