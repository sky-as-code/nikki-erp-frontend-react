import { Stack } from '@mantine/core';
import { useAuthenticatedStatus } from '@nikkierp/shell/auth';
import { AuthorizedGuard } from '@nikkierp/ui/components';
import React from 'react';
import { Outlet } from 'react-router';


import { ContentContainer } from '@/components/ContentContainer';
import { SessionRestoring } from '@/components/SessionRestoring';

import { Header } from './Header';


export function PrivateLayout(): React.ReactNode {
	const status = useAuthenticatedStatus();

	return (!status || status.isSessionRestoring) ?
		<SessionRestoring/>
		: (
			<AuthorizedGuard>
				<Stack gap={0} h='100vh' miw={320}>
					<Header />
					<ContentContainer>
						<Outlet/>
					</ContentContainer>
				</Stack>
			</AuthorizedGuard>
		);
};
