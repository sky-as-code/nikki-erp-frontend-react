import { ShellProviders } from '@/common/context/ShellProviders';
import { UIProviders } from '@/common/context/UIProviders';
import { LoadingSpinner } from '@/components/loading';
import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Suspense } from 'react';

export const Route = createRootRoute({
  component: () => ( <RootLayout>
			<Outlet />
		</RootLayout> ),
})


const RootLayout: React.FC<React.PropsWithChildren> = ({children}) => {
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
				{/* <NoSSR> */}
					<ShellProviders envVars={{BASE_API_URL: 'http://localhost:4000/api', ROOT_PATH: '', ROOT_DOMAIN: 'localhost'}}>
						<UIProviders>
							<Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
						</UIProviders>
					</ShellProviders>
				{/* </NoSSR> */}
			</body>
		</html>
	);
}