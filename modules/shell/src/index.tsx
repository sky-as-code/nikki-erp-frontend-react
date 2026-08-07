import { ShellProviders } from '@nikkierp/shell/contexts';
import { UIProviders } from '@nikkierp/shell/contexts';
import { MicroAppShellProps } from '@nikkierp/ui/microApp';
import React from 'react';

import { registerSharedStateCommands } from './features/sharedState';
import { ShellRoutes } from './routes';

import './styles/index.css';


type ShellWindow = typeof window & {
	/** Config object injected by shellbff */
	__CLIENT_CONFIG__: Record<string, unknown>;
};

/**
 * Commands this shell owns, which `@nikkierp/shell` cannot name because it is the library this
 * shell is built on. Listing them here is also what imports the services, and `@storeService`
 * builds a slice on first instantiation — so the slices exist before anything reads them.
 */
const shellCommandRegistrars = [registerSharedStateCommands];

export function MicroAppShell({ microApps }: MicroAppShellProps): React.ReactNode {

	return (
		<ShellProviders
			microApps={microApps}
			envVars={(window as ShellWindow).__CLIENT_CONFIG__}
			extraRegistrars={shellCommandRegistrars}
		>
			<UIProviders>
				<ShellRoutes microApps={microApps} />
			</UIProviders>
		</ShellProviders>
	);
}
