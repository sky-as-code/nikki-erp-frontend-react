import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Suspense, useEffect, useState } from 'react';

import { LoadingSpinner } from '@/common/components/loading';
import { ShellProviders } from '@/common/context/ShellProviders';
import { UIProviders } from '@/common/context/UIProviders';
import { loadEnvVars } from '@/common/envVars';
import { initRequestMaker } from '@/common/request';
import { EnvVars } from '@/types/envVars';

export const Route = createRootRoute({
	component: () => (
		<RootLayout>
			<Outlet />
		</RootLayout>
	),
});

const RootLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
	const [envVars, setEnvVars] = useState<EnvVars | null>(null);

	useEffect(() => {
		loadEnvVars().then((envVarsRes) => {
			if (envVarsRes) {
				setEnvVars(envVarsRes);
				initRequestMaker({ baseUrl: envVarsRes.BASE_API_URL });
			}
		});
	}, []);

	if (!envVars) return null;

	return (
		// <html lang='en-US' {...mantineHtmlProps}>
		// 	<head>
		// 		<ColorSchemeScript defaultColorScheme='light' />
		// 		<meta
		// 			name='viewport'
		// 			content='minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no'
		// 		/>
		// 	</head>
		// <body className={'overflow-hidden'}>
		<ShellProviders envVars={envVars}>
			<UIProviders>
				<Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
			</UIProviders>
		</ShellProviders>
		// </body>
		// </html>
	);
};
