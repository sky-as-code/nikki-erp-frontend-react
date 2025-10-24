import { EnvVars, MicroAppMetadata } from '@nikkierp/common/types';
import { useEffect, useState } from 'react';
import { Outlet } from 'react-router';

import { ShellProviders } from '../context/ShellProviders';


export type RootLayoutProps = {
	remoteApps: MicroAppMetadata[];
};

export const RootLayout: React.FC<RootLayoutProps> = ({ remoteApps }) => {
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
			remoteApps={remoteApps}
			// envVars={envVars}
		>
			<Outlet />
		</ShellProviders>
	);
};