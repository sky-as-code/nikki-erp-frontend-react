import { EnvVars } from '@nikkierp/common/types';
import { MicroAppMetadata } from '@nikkierp/ui/types';
import { useEffect, useState } from 'react';
import { Outlet } from 'react-router';

import { ShellProviders } from '../context/ShellProviders';


export type RootLayoutProps = {
	microApps: MicroAppMetadata[];
};

export const RootLayout: React.FC<RootLayoutProps> = ({ microApps }) => {
	// const [envVars, setEnvVars] = useState<EnvVars | null>(null);

	// useEffect(() => {
	// 	loadEnvVars().then((envVarsRes) => {
	// 		if (envVarsRes) {
	// 			setEnvVars(envVarsRes);
	// 			initRequestMaker({ baseUrl: envVarsRes.BASE_API_URL });
	// 		}
	// 	});
	// }, []);

	// if (!envVars) return null;

	return (
		<ShellProviders
			microApps={microApps}
			// envVars={envVars}
		>
			<Outlet />
		</ShellProviders>
	);
};