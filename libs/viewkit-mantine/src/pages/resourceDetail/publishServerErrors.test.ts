import { ClientErrorItem } from '@nikkierp/common/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { publishServerErrors } from './publishServerErrors';


// Translation and the authorization skip are `showClientErrorModal`'s job, tested in common.
const showClientErrorModal = vi.hoisted(() => vi.fn());

vi.mock('@nikkierp/common/service', () => ({ showClientErrorModal }));

function item(fields: Record<string, unknown>): ClientErrorItem {
	return new ClientErrorItem({ type: 'business', message: 'fallback', ...fields });
}

const translate = vi.fn(() => 'translated');

describe('publishServerErrors', () => {
	beforeEach(() => {
		showClientErrorModal.mockClear();
	});

	it('attaches what the form can show and opens the modal for the rest', () => {
		const fieldItem = item({ field: 'code', key: 'common:err_unique' });
		const hiddenItem = item({ field: 'id', key: 'common:resource_in_use' });
		const formItem = item({ key: 'common:resource_in_use', vars: { referenced_by: 'iam:iam_role_users' } });
		const attach = vi.fn((errors: ClientErrorItem[]) => errors.filter(it => it.field !== 'code'));
		publishServerErrors(translate, [fieldItem, hiddenItem, formItem], attach);
		expect(attach).toHaveBeenCalledWith([fieldItem, hiddenItem, formItem]);
		expect(showClientErrorModal).toHaveBeenCalledTimes(1);
		expect(showClientErrorModal).toHaveBeenCalledWith(translate, [hiddenItem, formItem]);
	});

	it('shows every error in the modal when there is no form', () => {
		const fieldItem = item({ field: 'code', key: 'common:err_unique' });
		publishServerErrors(translate, [fieldItem]);
		expect(showClientErrorModal).toHaveBeenCalledWith(translate, [fieldItem]);
	});

	it('leaves the errors a section shows itself to that section', () => {
		const rowItem = item({ field: 'values.2.name', key: 'common:err_unique' });
		const formItem = item({ key: 'common:resource_in_use' });
		publishServerErrors(translate, [rowItem, formItem], errors => errors, field => field.startsWith('values'));
		expect(showClientErrorModal).toHaveBeenCalledWith(translate, [formItem]);
	});

	it('shows nothing for an empty list', () => {
		publishServerErrors(translate, [], vi.fn());
		expect(showClientErrorModal).not.toHaveBeenCalled();
	});
});
