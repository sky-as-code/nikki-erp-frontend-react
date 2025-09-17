'use client';

import { Logo } from '@components/Logo/Logo';
import { Box, Card, Stack } from '@mantine/core';
import {  useSearchParams } from 'next/navigation';

import { LoginAttemptForm } from './LoginAttemptForm';


export const LoginPage: React.FC = () => {
	const searchParams = useSearchParams();
	const returnUrl = searchParams.get('to') || '/';

	return (
		<Box
			className='w-full max-w-[400px]'
			mx='auto'
		>
			<Card withBorder shadow='md' radius='md' p={30}>
				<Stack
					gap='xs'
					mb='md'
					align='center'
				>
					<Logo/>
				</Stack>

				<LoginAttemptForm returnUrl={returnUrl} />
			</Card>
		</Box>
	);
};
