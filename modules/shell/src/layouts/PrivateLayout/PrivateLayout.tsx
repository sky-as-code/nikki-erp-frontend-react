import { Stack } from '@mantine/core';
import { useAuthenticatedStatus } from '@nikkierp/shell/auth';
import { AuthorizedGuard } from '@nikkierp/ui/components';
import React from 'react';
import { Outlet } from 'react-router';


import { Header } from './Header';

import { SessionRestoring } from '@/components/Loading';
import { ScrollableContent } from '@/components/ScrollableContent';


export function PrivateLayout(): React.ReactNode {
	const status = useAuthenticatedStatus();

	return (!status || status.isSessionRestoring) ?
		<SessionRestoring/>
		: (
			<AuthorizedGuard>
				<Stack gap={0} h='100vh' miw={320} bg='var(--nikki-color-linear-page-background)'>
					<Header />
					<ScrollableContent>
						<Outlet/>
					</ScrollableContent>
				</Stack>
			</AuthorizedGuard>
		);
};
