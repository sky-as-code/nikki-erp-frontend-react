import { moduleStoreRegistry } from '@nikkierp/ui/appState/store';
import { describe, expect, it } from 'vitest';

// Deliberately NOT importing `./store`: it pulls in `routingSlice`, which reads
// `window.location` at import time and so cannot load outside a browser. That landmine is
// what moving routing into this package (APPST-007) removes.
import { SHELL_STORE_NAME, shellStore } from './shellStore';
import { SLICE_NAME, setEnvVarsAction } from '../config/shellConfigSlice';

import type { ShellEnvVars } from '../types';


const ENV_VARS: ShellEnvVars = {
	BASE_API_URL: 'https://api.example.test',
	APP_ENV: 'local',
	ROOT_DOMAIN: 'example.test',
	ROOT_PATH: '/',
};


describe('shellStore', () => {
	it('registers itself under the shell name', () => {
		expect(moduleStoreRegistry.get(SHELL_STORE_NAME)).toBe(shellStore);
	});

	it('holds the shellConfig slice', () => {
		expect(shellStore.hasSlice(SLICE_NAME)).toBe(true);
	});

	it('records env vars dispatched to it', () => {
		shellStore.dispatch(setEnvVarsAction(ENV_VARS));

		expect((shellStore.getState()[SLICE_NAME] as any).envVars).toEqual(ENV_VARS);
	});
});
