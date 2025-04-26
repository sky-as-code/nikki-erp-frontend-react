import '@/styles/global.css';

import { ShellProviders } from '@common/context/ShellProviders';
import { UIProviders } from '@common/context/UIProviders';
import { Button, ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { useContextMenu } from 'mantine-contextmenu';
import type { Metadata } from 'next';
import React, { Suspense } from 'react';

import { NoSSR } from '@/common/components/NoSSR';
import { loadEnvVars } from '@/common/envVars';
import { initRequestMaker } from '@/common/request';
import { LoadingSpinner } from '@/components/loading';
import { inter } from '@/styles/fonts';


export const metadata: Metadata = {
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
	const envVars = loadEnvVars();
	initRequestMaker({baseUrl: envVars.BASE_API_URL});
	return (
		<html lang='en-US' {...mantineHtmlProps}>
			<head>
				<ColorSchemeScript defaultColorScheme='light' />
				<meta
					name='viewport'
					content='minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no'
				/>
			</head>
			<body className={`${inter.className} overflow-hidden`}>
				<NoSSR>
					<ShellProviders envVars={envVars}>
						<UIProviders>
							<Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
							<Notifications />
						</UIProviders>
					</ShellProviders>
				</NoSSR>
			</body>
		</html>
	);
}
