import { ShellProviders } from '@/common/context/ShellProviders';
import { UIProviders } from '@/common/context/UIProviders';
import { loadEnvVars } from '@/common/envVars';
import { initRequestMaker } from '@/common/request';
import { LoadingSpinner } from '@/components/loading';
import { EnvVars } from '@/types/envVars';
import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Suspense, useEffect, useState } from 'react';

export const Route = createRootRoute({
	component: () => (
		<RootLayout>
			<Outlet />
		</RootLayout>
	),
});

const RootLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
	const [envVars, setEnvVars] = useState<EnvVars | null>(null);

	// const envVars = loadEnvVars();
	useEffect(() => {
		loadEnvVars().then((envVarsRes) => {
			console.debug('🚀 ~ RootLayout ~ envVarsRes:', envVarsRes);
			if (envVarsRes) {
				setEnvVars(envVarsRes);
				initRequestMaker({ baseUrl: envVarsRes.BASE_API_URL });
			}
		});
	}, []);

	if (!envVars) return <html />;

	return (
		<html lang='en-US' {...mantineHtmlProps}>
			<head>
				<ColorSchemeScript defaultColorScheme='light' />
				<meta
					name='viewport'
					content='minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no'
				/>
			</head>
			<body className={'overflow-hidden'}>
				<ShellProviders envVars={envVars}>
					<UIProviders>
						<Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
					</UIProviders>
				</ShellProviders>
			</body>
		</html>
	);
};
