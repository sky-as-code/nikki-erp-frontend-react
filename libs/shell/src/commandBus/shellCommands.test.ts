import { CommandBus } from '@nikkierp/common/commandBus';
import { readStoreMethodTag } from '@nikkierp/ui/appState/store';
import { beforeEach, describe, expect, it } from 'vitest';

import { shellStore } from '../appState/shellStore';
import { SESSION_COMMANDS, registerSessionCommands } from '../authenticate/sessionCommands';
import { ROUTING_COMMANDS, registerRoutingCommands } from '../routing/routingCommands';
import { routingService } from '../routing/routingService';
import { USER_CONTEXT_COMMANDS, registerUserContextCommands } from '../userContext/userContextCommands';


function buildBus() {
	const bus = new CommandBus();
	registerRoutingCommands(bus);
	registerSessionCommands(bus);
	registerUserContextCommands(bus);
	return bus;
}

function setActive(method: unknown, value: string) {
	const tag = readStoreMethodTag(method)!;
	shellStore.dispatch(tag.syncAction!(value) as any);
}


describe('shell.* command surface', () => {
	let bus: CommandBus;

	beforeEach(() => {
		bus = buildBus();
	});

	it('registers every shell.* command name', () => {
		const names = [
			...Object.values(ROUTING_COMMANDS),
			...Object.values(SESSION_COMMANDS),
			...Object.values(USER_CONTEXT_COMMANDS),
		];

		for (const name of names) {
			expect(bus.has(name), `not registered: ${name}`).toBe(true);
		}
	});

	it('reserves the shell namespace for the host', () => {
		// Part 0 of a command name is what the bus hands to its ModuleLoader, so every
		// name here must start with `shell.` or it would try to lazy-load a micro-app.
		const names = [
			...Object.values(ROUTING_COMMANDS),
			...Object.values(SESSION_COMMANDS),
			...Object.values(USER_CONTEXT_COMMANDS),
		];

		expect(names.every(name => name.startsWith('shell.'))).toBe(true);
	});

	it('answers get_active_context with the current routing state', async () => {
		setActive(routingService.setActiveOrg, 'acme');
		setActive(routingService.setActiveModule, 'iam');

		const response = await bus.publish({ name: ROUTING_COMMANDS.GET_ACTIVE_CONTEXT });

		expect(response.error).toBeNull();
		expect(response.result?.data).toMatchObject({ activeOrg: 'acme', activeModule: 'iam' });
	});

	it('reports a malformed navigate payload as a technical error', async () => {
		// A missing `to` is a caller bug, not something an end user can act on, so it
		// belongs in `error` rather than `clientErrors`.
		const response = await bus.publish({ name: ROUTING_COMMANDS.NAVIGATE, payload: {} });

		expect(response.error).toBeInstanceOf(Error);
		expect(response.result).toBeNull();
	});

	it('answers is_authenticated without throwing when no session exists', async () => {
		const response = await bus.publish({ name: SESSION_COMMANDS.IS_AUTHENTICATED });

		expect(response.error).toBeNull();
		expect(typeof response.result?.data).toBe('boolean');
	});

	it('exposes no sign-in command — authentication stays the Shell own flow', () => {
		const names = Object.values(SESSION_COMMANDS) as string[];

		expect(names.some(name => name.includes('sign_in'))).toBe(false);
		expect(names.some(name => name.includes('refresh'))).toBe(false);
	});
});
