import { ShellProviders } from '@nikkierp/shell/contexts';
import { UIProviders } from '@nikkierp/shell/contexts';
import { MicroAppShellProps } from '@nikkierp/ui/microApp';
import React from 'react';

import { ShellRoutes } from './routes';

import './styles/index.css';


type ShellWindow = typeof window & {
	/** Config object injected by shellbff */
	__CLIENT_CONFIG__: Record<string, unknown>;
};

export function MicroAppShell({ microApps }: MicroAppShellProps): React.ReactNode {
	return (
		<ShellProviders
			microApps={microApps}
			envVars={(window as ShellWindow).__CLIENT_CONFIG__}
		>
			<UIProviders>
				<ShellRoutes microApps={microApps} />
			</UIProviders>
		</ShellProviders>
	);
}

