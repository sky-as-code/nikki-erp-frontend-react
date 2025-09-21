'use client';


import { Logo } from '@components/Logo/Logo';
import {  Box, Button, Card, Divider, Stack } from '@mantine/core';
import { RegisterForm } from '@modules/core/auth/RegisterForm';
import { useRouter } from 'next/navigation';


export const RegisterPage = () => {
	const router = useRouter();

	return (
		<Box className='w-full max-w-[500px] min-w-[400px] p-10' mx='auto'>
			<Card withBorder shadow='md' radius='md' p={50} className='backdrop-blur-sm bg-white/50'>
				<Stack gap='xs' mb='md' align='center'>
					<Logo enableLink={false} />
				</Stack>


				<RegisterForm />

				<Divider my='md' label='or' labelPosition='center' />

				<Button
					fullWidth
					type='button'
					color='gray'
					variant='light'
					size='md'
					onClick={() => router.push('/login')}
				>
					Login
				</Button>
			</Card>
		</Box>

	);
};
