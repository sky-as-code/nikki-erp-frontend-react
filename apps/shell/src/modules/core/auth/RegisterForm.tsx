'use client';

import { Button, Card, PasswordInput, Space, TextInput } from '@mantine/core';

export function RegisterForm() {
	return (
		<Card withBorder shadow='md' p={30} mt={30} radius='md'>
			<TextInput label='Email' placeholder='test@example.com' required />
			<PasswordInput
				label='Password'
				placeholder='Your password'
				required
				mt='md'
			/>
			<Space h='md' />
			<Button fullWidth mt='xl'>
				Sign Up
			</Button>
		</Card>
	);
}
