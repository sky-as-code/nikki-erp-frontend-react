'use client';

import { Box, Button, Text, PasswordInput, Space, TextInput } from '@mantine/core';

export function RegisterForm() {
	return (
		<Box>
			<Text size='xl' mb='md' className='text-center'>
				Sign Up
			</Text>

			<TextInput label='Email' placeholder='test@example.com' required mb={'md'} size='md' labelProps={{ className: 'text-gray-600' }} />
			<PasswordInput
				label='Password'
				labelProps={{ className: 'text-gray-600' }}
				placeholder='Your password'
				required
				size='md'
				mb='md'
			/>

			<Space h='md' />
			<Button fullWidth mt='md' size='md'>
				Sign Up
			</Button>
		</Box>
	);
}
