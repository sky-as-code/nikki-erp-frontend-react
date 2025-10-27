import { EnvVars } from '@nikkierp/common/types';
import { useEffect, useState } from 'react';
import { Outlet } from 'react-router';

import { ShellProviders } from '../context/ShellProviders';


export const RootLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
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
			// envVars={envVars}
		>
			<Outlet />
		</ShellProviders>
	);
};