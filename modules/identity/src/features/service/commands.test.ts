import { schemaModuleOf } from '@nikkierp/common/dynamicModel';
import { describe, expect, it } from 'vitest';

import { registerServiceCommands, ServiceCommands } from './commands';

import type { ICommandBus } from '@nikkierp/common/commandBus';


function fakeBus() {
	const subscribed: string[] = [];
	const bus = {
		subscribe: (name: string) => {
			subscribed.push(name);
			return () => undefined;
		},
	} as unknown as ICommandBus;
	return { bus, subscribed };
}

describe('ServiceCommands', () => {
	it('derives the CRUD names from iam_service, never from iam_user', () => {
		expect(ServiceCommands.SEARCH).toBe('core.resource.iam_service.search');
		expect(ServiceCommands.GET_BY_ID).toBe('core.resource.iam_service.get_by_id');
		expect(Object.values(ServiceCommands).some(name => name.includes('iam_user'))).toBe(false);
	});

	it('registers the schema under iam and subscribes status and role-assignment handlers', () => {
		const { bus, subscribed } = fakeBus();
		registerServiceCommands(bus);

		expect(schemaModuleOf('iam_service')).toBe('iam');
		expect(subscribed.sort()).toEqual([
			ServiceCommands.ACTIVATE, ServiceCommands.MANAGE_ROLE_ASSIGNMENTS,
			ServiceCommands.SEARCH_ASSIGNED_ROLES, ServiceCommands.SUSPEND,
		].sort());
	});
});
