import { ShellProviders } from '@nikkierp/shell/contexts';
import { UIProviders } from '@nikkierp/shell/contexts';
import { dispatchServiceMethod } from '@nikkierp/ui/appState/store';
import { MicroAppShellProps } from '@nikkierp/ui/microApp';
import React from 'react';

import { registerSharedStateCommands, sharedStateService } from './features/sharedState';
import { ShellRoutes } from './routes';

import './styles/index.css';


type ShellWindow = typeof window & {
	/** Config object injected by shellbff */
	__CLIENT_CONFIG__: Record<string, unknown>,
};

/**
 * Commands this shell owns, which `@nikkierp/shell` cannot name because it is the library this
 * shell is built on. Listing them here is also what imports the services, and `@storeService`
 * builds a slice on first instantiation — so the slices exist before anything reads them.
 */
const shellCommandRegistrars = [registerSharedStateCommands];

const envVars = (window as ShellWindow).__CLIENT_CONFIG__;

/*
 * Published into shared state at module scope, before `MicroAppShell` first renders, so the whole
 * bag is already readable the moment a micro-app can publish `shell.shared_state.get_env_vars`.
 *
 * The Shell also dispatches these into its own `shellConfig` slice (`ShellProviders.initServices`),
 * but that slice is only reachable through React from inside the Shell's store scope. This is the
 * copy micro-apps read, and it stays untyped so deployment-specific vars survive the trip.
 *
 * Dispatched rather than called: `@storeService` installs a bound copy of the plain method and
 * hangs the action off it as metadata, so `sharedStateService.setEnvVars(envVars)` would run the
 * body and write nothing to the slice. `dispatchServiceMethod` is the non-React twin of
 * `useServiceLayer`, and the Shell has no React context this early.
 */
void dispatchServiceMethod(sharedStateService.setEnvVars, envVars);

export function MicroAppShell({ microApps }: MicroAppShellProps): React.ReactNode {

	return (
		<ShellProviders
			microApps={microApps}
			envVars={envVars}
			extraRegistrars={shellCommandRegistrars}
		>
			<UIProviders>
				<ShellRoutes microApps={microApps} />
			</UIProviders>
		</ShellProviders>
	);
}
