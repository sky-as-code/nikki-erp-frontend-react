'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
	Alert,
	Anchor,
	Button,
	Card,
	Checkbox,
	Group,
	PasswordInput,
	TextInput,
} from '@mantine/core';
import { useAuth } from '@modules/core/auth/AuthProvider';
import { IconAlertCircle } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { loginUser } from './service';



export const LoginForm = ({ returnUrl }: { returnUrl: string }) => {
	const { form, apiErrors, onSubmit } = useLoginForm(returnUrl);
	const { register, handleSubmit, formState: { errors } } = form;

	return (
		<Card withBorder shadow='md' p={30} mt={30} radius='md'>
			<ErrorAlert errors={apiErrors} />
			<form onSubmit={handleSubmit(onSubmit)}>
				<TextInput
					label='Email'
					placeholder='test@example.com'
					error={errors.email?.message}
					{...register('email')}
				/>
				<PasswordInput
					label='Password'
					placeholder='Your password'
					mt='md'
					error={errors.password?.message}
					{...register('password')}
				/>
				<Group mt='md' justify='space-between'>
					<Checkbox label='Remember me' />
					<Anchor size='sm' href='#'>
						Forgot Password?
					</Anchor>
				</Group>
				<Button type='submit' fullWidth mt='xl'>
					Sign In
				</Button>
			</form>
		</Card>
	);
};

const loginSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const useLoginForm = (returnUrl: string) => {
	const form = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });
	const router = useRouter();
	const { login } = useAuth();
	const [apiErrors, setApiErrors] = useState<string[]>([]);

	const onSubmit = async (data: LoginFormData) => {
		const authData = await loginUser(data);
		if (authData.errors) {
			setApiErrors(authData.errors);
			return;
		}
		login(authData.data!);
		router.push(returnUrl);
	};

	return { form, apiErrors, onSubmit };
};

const ErrorAlert = ({ errors }: { errors: string[] }) => (
	errors.length > 0 && (
		<Alert icon={<IconAlertCircle size={16} />} color='red' mb='lg'>
			{errors.map((error, index) => (
				<div key={index}>{error}</div>
			))}
		</Alert>
	)
);
