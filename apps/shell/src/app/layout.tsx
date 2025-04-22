import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import 'mantine-react-table/styles.css';
import '@/styles/global.css';

import { ClientProvider } from '@common/context/ClientProvider';
import { ConfigProvider } from '@common/context/ConfigProvider';
import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { createAuthProvider } from '@providers/auth-provider';
import { createDataProvider } from '@providers/data-provider';
import type { Metadata } from 'next';
import React, { Suspense } from 'react';

import { ServerProvider } from '@/common/context/ServerProvider';
import { initRequestMaker } from '@/common/request';
import { LoadingSpinner } from '@/components/loading';
import { initConfig } from '@/config';
import { inter } from '@/styles/fonts';


export const metadata = {
	metadataBase: new URL('https://mantine-admin.vercel.app/'),
	title: { default: 'Mantine Admin', template: '%s | Mantine Admin' },
	description: 'A Modern Dashboard with Next.js.',
	keywords: [
		'Next.js',
		'Mantine',
		'Admin',
		'Template',
		'Admin Template',
		'Admin Dashboard',
		'Admin Panel',
		'Admin UI',
	],
	authors: [{
		name: 'jotyy',
		url: 'https://jotyy.vercel.app',
	}],
	creator: 'jotyy',
	manifest: 'https://mantine-admin.vercel.app/site.webmanifest',
};

export default function RootLayout({children}: { children: React.ReactNode }) {
	const config = initConfig();
	initRequestMaker({baseUrl: config.shell.SHELL_API_URL});
	return (
		<html lang='en-US' {...mantineHtmlProps}>
			<head>
				<ColorSchemeScript />
				<meta
					name='viewport'
					content='minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no'
				/>
			</head>
			<body className={inter.className}>
				<ServerProvider config={config}>
					<ClientProvider>
						<Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
					</ClientProvider>
					<Notifications />
				</ServerProvider>
			</body>
		</html>
	);
}

// export default function RootLayout({
// 	children,
// }: Readonly<{
// 	children: React.ReactNode;
// }>) {
// 	return (
// 		<html lang="en">
// 		<body>
// 			<MantineProvider
// 				theme={RefineThemes.Blue}
// 			>
// 				<ConfigProvider config={config}>
// 					<RefineKbarProvider>
// 					<Refine
// 						authProvider={createAuthProvider()}
// 						dataProvider={createDataProvider(config.shell.SHELL_API_URL)}
// 						routerProvider={routerProvider}
// 						resources={[
// 							{
// 								name: "users",
// 								list: "/users",
// 								show: "/users/:id",
// 								meta: {
// 									label: "Users",
// 								},
// 							},
// 						]}
// 					>
// 						<Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
// 						<RefineKbar />
// 						<Notifications />
// 					</Refine>
// 					</RefineKbarProvider>
// 				</ConfigProvider>
// 			</MantineProvider>
// 		</body>
// 		</html>
// 	);
// }