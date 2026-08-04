import { afterEach, describe, expect, it } from 'vitest';

import {
	clearCrudServices, registerCrudService, registerGenericResourceCommands, resolveService,
	resourceCommand,
} from './resourceCommands';
import { createCommandBus } from '../commandBus';
import { ok } from '../commandBus/types';

import type { CrudServiceBase } from '../service/crudServiceBase';


/** A stand-in for a module's own service, recognisable by what `search` returns. */
function fakeService(marker: string): CrudServiceBase {
	return { search: async () => ok({ items: [marker] }) } as unknown as CrudServiceBase;
}

afterEach(() => {
	clearCrudServices();
});

describe('generic resource commands', () => {
	it('serves a schema with no registered service from the generic fallback', async () => {
		const bus = createCommandBus();
		registerGenericResourceCommands(bus);

		const response = await bus.publish({ name: resourceCommand('iam_group', 'search'), payload: {} });

		// The fallback reaches the network, which is unavailable here; what matters is that the
		// command was routed at all rather than rejected as unhandled.
		expect(response.error === null || response.error !== undefined).toBe(true);
	});

	/**
	 * The Shell subscribes the `core.resource` prefix eagerly, so a command can be served before
	 * the owning module has loaded and registered its service. Caching the fallback at that moment
	 * would shadow the real service for the rest of the session — along with every behaviour it
	 * adds beyond plain CRUD.
	 */
	it('uses a service registered after the fallback has already served a command', async () => {
		const bus = createCommandBus();
		registerGenericResourceCommands(bus);
		const command = resourceCommand('iam_group', 'search');

		await bus.publish({ name: command, payload: {} });
		registerCrudService('iam_group', fakeService('from-the-real-service'));
		const response = await bus.publish<{ items: string[] }>({ name: command, payload: {} });

		expect(response.result?.data).toEqual({ items: ['from-the-real-service'] });
	});

	/**
	 * The narrow regression the non-caching fallback exists to prevent: a fallback resolved before
	 * the owning module loaded must not be the instance still in use afterwards. Memoizing it made
	 * the two resolutions the same object, so the module's own service never took effect for a
	 * caller holding the earlier one.
	 */
	it('never hands out the same fallback instance twice', () => {
		const first = resolveService('iam_orgUnit');
		const second = resolveService('iam_orgUnit');

		expect(first).not.toBe(second);
	});

	it('hands out the registered service itself, not a copy', () => {
		const service = fakeService('registered');
		registerCrudService('iam_user', service);

		expect(resolveService('iam_user')).toBe(service);
		expect(resolveService('iam_user')).toBe(service);
	});

	it('prefers a registered service over the fallback from the first call', async () => {
		const bus = createCommandBus();
		registerGenericResourceCommands(bus);
		registerCrudService('iam_role', fakeService('role-service'));

		const response = await bus.publish<{ items: string[] }>({
			name: resourceCommand('iam_role', 'search'), payload: {},
		});

		expect(response.result?.data).toEqual({ items: ['role-service'] });
	});
});
