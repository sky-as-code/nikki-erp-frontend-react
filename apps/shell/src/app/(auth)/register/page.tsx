import { Anchor, Box, Text, Title } from '@mantine/core';
import { RegisterForm } from '@modules/core/auth/RegisterForm';

// NextJS config
export const revalidate = 60;

export default function Register() {
	return (
		<>
			<Title order={1} fw='bolder'>
				Mantine Admin
			</Title>
			<Text c='dimmed' size='sm' mt={5}>
				Already have an account?{' '}
				<Anchor size='sm' href='/login'>
					Log In
				</Anchor>
			</Text>
			<Box w={400}>
				<RegisterForm />
			</Box>
		</>
	);
}
