import { ClientErrorItem } from '@nikkierp/common/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { notifyServerError, publishServerErrors } from './publishServerErrors';


// Translation, escaping and the authorization skip are `notifyClientErrors`' job, tested in common.
const notifyClientErrors = vi.hoisted(() => vi.fn());

vi.mock('@nikkierp/common/service', () => ({ notifyClientErrors }));

function item(fields: Record<string, unknown>): ClientErrorItem {
	return new ClientErrorItem({ type: 'business', message: 'fallback', ...fields });
}

const translate = vi.fn(() => 'translated');

describe('publishServerErrors', () => {
	beforeEach(() => {
		notifyClientErrors.mockClear();
	});

	it('returns the field items and publishes only the others', () => {
		const fieldItem = item({ field: 'code', key: 'common:err_unique' });
		const formItem = item({ key: 'common:resource_in_use', vars: { referenced_by: 'iam:iam_role_users' } });
		const result = publishServerErrors(translate, [fieldItem, formItem]);
		expect(result).toEqual([fieldItem]);
		expect(notifyClientErrors).toHaveBeenCalledTimes(1);
		expect(notifyClientErrors).toHaveBeenCalledWith(translate, [formItem]);
	});

	it('publishes nothing for an empty list', () => {
		expect(publishServerErrors(translate, [])).toEqual([]);
		expect(notifyClientErrors).not.toHaveBeenCalled();
	});

	it('notifyServerError publishes a single item even when it names a field', () => {
		const fieldItem = item({ field: 'code', key: 'common:err_unique' });
		notifyServerError(translate, fieldItem);
		expect(notifyClientErrors).toHaveBeenCalledWith(translate, [fieldItem]);
	});
});
