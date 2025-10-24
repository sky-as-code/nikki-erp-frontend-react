import {
	Alert,
	Anchor,
	Button,
	Card,
	Checkbox,
	Container,
	Group,
	PasswordInput,
	Stack,
	Text,
	TextInput,
	Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';


interface LoginFormData {
	email: string;
	password: string;
	rememberMe: boolean;
}

const LoginForm = ({ form, loading }: {
	form: ReturnType<typeof useForm<LoginFormData>>;
	loading: boolean;
}) => (
	<form onSubmit={form.onSubmit(handleSubmit)}>
		<Stack gap='md'>
			<TextInput
				label='Email Address'
				placeholder='Enter your email'
				leftSection='📧'
				required
				{...form.getInputProps('email')}
				className='[&_input]:rounded-lg [&_input]:border-gray-300 [&_input]:focus:border-blue-500'
			/>

			<PasswordInput
				label='Password'
				placeholder='Enter your password'
				leftSection='🔒'
				required
				{...form.getInputProps('password')}
				className='[&_input]:rounded-lg [&_input]:border-gray-300 [&_input]:focus:border-blue-500'
			/>

			<Group justify='space-between' className='flex-wrap'>
				<Checkbox
					label='Remember me'
					size='sm'
					{...form.getInputProps('rememberMe', { type: 'checkbox' })}
					className='text-sm'
				/>
				<Anchor
					href='#'
					size='sm'
					className='text-blue-600 hover:text-blue-800 transition-colors'
				>
					Forgot password?
				</Anchor>
			</Group>

			<Button
				type='submit'
				fullWidth
				size='lg'
				loading={loading}
				className='bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors'
			>
				{loading ? 'Signing in...' : 'Sign In'}
			</Button>
		</Stack>
	</form>
);

const handleSubmit = async (values: LoginFormData) => {
	// This would be passed as a prop in a real implementation
	console.log('Login attempt:', values);
};

export const LoginPage = () => {
	const [loading] = useState(false);
	const [error] = useState<string | null>(null);

	const form = useForm<LoginFormData>({
		initialValues: {
			email: '',
			password: '',
			rememberMe: false,
		},
		validate: {
			email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
			password: (value) => (value.length < 6 ? 'Password must be at least 6 characters' : null),
		},
	});

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
			<Container size='sm' className='w-full'>
				<Card
					shadow='xl'
					radius='lg'
					p='xl'
					className='bg-white/80 backdrop-blur-sm border-0'
				>
					<Stack gap='lg'>
						{/* Header */}
						<div className='text-center'>
							<Title order={1} className='text-3xl font-bold text-gray-800 mb-2'>
								Welcome Back
							</Title>
							<Text c='dimmed' size='lg'>
								Sign in to your account to continue
							</Text>
						</div>

						{/* Error Alert */}
						{error && (
							<Alert
								icon='⚠️'
								color='red'
								variant='light'
								className='rounded-lg'
							>
								{error}
							</Alert>
						)}

						{/* Login Form */}
						<LoginForm form={form} loading={loading} />

						{/* Footer */}
						<div className='text-center pt-4 border-t border-gray-200'>
							<Text size='sm' c='dimmed'>
								Don't have an account?{' '}
								<Anchor
									href='#'
									className='text-blue-600 hover:text-blue-800 font-medium'
								>
									Sign up here
								</Anchor>
							</Text>
						</div>
					</Stack>
				</Card>
			</Container>
		</div>
	);
};