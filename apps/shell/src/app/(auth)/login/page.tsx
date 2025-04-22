import { Anchor, Box, Text, Title } from '@mantine/core';

import { LoginForm } from '@/components/auth/LoginForm';

// NextJS config
export const revalidate = 60;

export default function Login() {
	return (
		<>
			<Title order={1} fw='bolder'>
				Mantine Admin
			</Title>
			<Text c='dimmed' size='sm' mt={5}>
				Don&apos;t have an account?{' '}
				<Anchor size='sm' href='/register'>
					Sign Up
				</Anchor>
			</Text>
			<Box w={400}>
				<LoginForm />
			</Box>
		</>
	);
}
