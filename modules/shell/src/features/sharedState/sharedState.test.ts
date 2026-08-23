import { CommandBus } from '@nikkierp/common/commandBus';
import { dispatchServiceMethod } from '@nikkierp/ui/appState/store';
import { describe, expect, it } from 'vitest';


import { SHARED_STATE_COMMANDS, registerSharedStateCommands } from './sharedStateCommands';
import { sharedStateService } from './sharedStateService';


/**
 * Regression cover for the env-var bag crossing into a micro-app.
 *
 * The bug these guard against: calling `sharedStateService.setEnvVars(bag)` directly runs the
 * method body and writes nothing to the slice, because `@storeService` installs a bound copy of
 * the plain method and hangs the action off it as metadata. It fails silently — the caller sees a
 * sensible return value while `getEnvVars()` keeps reporting the initial state.
 */
describe('shared state env vars', () => {
	it('returns an empty bag before anything is stored', () => {
		expect(sharedStateService.getEnvVars()).toEqual({});
	});

	it('stores the bag when dispatched, not when called directly', () => {
		// The trap: a direct call type-checks and returns the bag, but never reaches the store.
		sharedStateService.setEnvVars({ MAPLIBRE_GL_API_KEY: 'direct-call' });
		expect(sharedStateService.getEnvVars()).toEqual({});

		void dispatchServiceMethod(sharedStateService.setEnvVars, { MAPLIBRE_GL_API_KEY: 'real-key' });
		expect(sharedStateService.getEnvVars()).toEqual({ MAPLIBRE_GL_API_KEY: 'real-key' });
	});

	it('serves the whole untyped bag over the command bus', async () => {
		const bag = {
			BASE_API_URL: 'https://api.example.test',
			// Deployment-specific and absent from `ShellEnvVars`: the case that regressed.
			MAPLIBRE_GL_API_KEY: 'coremart-only-key',
		};
		void dispatchServiceMethod(sharedStateService.setEnvVars, bag);

		const bus = new CommandBus();
		const unsubscribe = registerSharedStateCommands(bus);

		const response = await bus.publish<Record<string, unknown>>({
			name: SHARED_STATE_COMMANDS.GET_ENV_VARS,
		});

		expect(response.result?.data).toEqual(bag);
		unsubscribe();
	});
});
