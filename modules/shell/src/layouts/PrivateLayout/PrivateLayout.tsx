import { Box, Paper, Stack, Text } from '@mantine/core';
import { useIsAuthenticated, useIsAuthenticatePending, useRestoreAuthSession } from '@nikkierp/shell/authenticate';
import { routingService } from '@nikkierp/shell/routing';
import { ErrorBoundary } from '@nikkierp/ui/components';
import React from 'react';
import { Outlet } from 'react-router';

import { Header } from './Header';


export function PrivateLayout(): React.ReactNode {
	const isAuthenticatePending = useIsAuthenticatePending();
	const restore = useRestoreAuthSession();
	const isAuthenticated = useIsAuthenticated();

	React.useEffect(() => {
		if (isAuthenticatePending) return;

		if (!isAuthenticated && restore.result.isFulfilled && !restore.data) {
			void routingService.navigateWillReturn({ to: '/signin', hardNavigate: true });
		}
	}, [isAuthenticated, restore.result.isFulfilled]);

	return isAuthenticated && (
		<ErrorBoundary>
			<Stack gap={0} h='100vh' miw={320} bg='var(--nikki-color-linear-page-background)'>
				<Header />
				<Box className='flex-1 overflow-auto relative p-0 m-0'>
					<Outlet/>
				</Box>
				{/* <Footer /> */}
			</Stack>
		</ErrorBoundary>
	);
};


function Footer(): React.ReactNode {
	return (
		<Paper
			withBorder
			bdrs={0}
			component='footer'
			bg={'var(--nikki-color-white)'}
			className='flex items-center justify-center h-10'
		>
			<Text c='dimmed' fz='sm'>
				Copyright © 2026 Nikki ERP
			</Text>
		</Paper>
	);
};