'use client';

import { Anchor, Box, Stack, Text, Title } from '@mantine/core';
import { LoginForm } from '@modules/core/auth/LoginForm';
import { useSearchParams } from 'next/navigation';


export const LoginPage: React.FC = () => {
	const searchParams = useSearchParams();
	const returnUrl = searchParams.get('to') || '/';

	return (
		<Box
			className='w-full h-screen max-w-[400px] pt-[15vh]'
			px='md'
			mx='auto'
		>
			<Stack
				gap='xs'
				mb='md'
			>
				<Title
					order={1}
					fw='bolder'
					size='h1'
					ta='center'
				>
					Nikki ERP
				</Title>
				<Text
					c='dimmed'
					size='xs'
					ta='center'
				>
					Don&apos;t have an account?{' '}
					<Anchor
						size='xs'
						href='/register'
					>
						Sign Up
					</Anchor>
				</Text>
			</Stack>

			<LoginForm returnUrl={returnUrl} />
		</Box>
	);
};
