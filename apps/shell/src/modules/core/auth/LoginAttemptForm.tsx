'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Button, Divider, TextInput, Text, Pill, Stack } from '@mantine/core';
import { useAuth } from '@modules/core/auth/AuthProvider';
import { IconAlertCircle, IconArrowLeft, IconArrowNarrowLeft, IconCornerUpLeft } from '@tabler/icons-react';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { createLoginAttempt, loginUser } from './service';

export type AuthPayload = {
	attemptId: string;
	username: string;
	password?: string;
	otpCode?: string;
};



export const LoginAttemptForm = ({ returnUrl }: { returnUrl: string }) => {
	const router = useRouter();

	const [loginStep, setLoginStep] = useState(0);
	const [attemptId, setAttemptId] = useState<string | null>(null);
	const [authPayload, setAuthPayload] = useState<AuthPayload>({
		attemptId: '',
		username: '',
	});



	const handleNextStep = () => {
		if (loginStep < loginSteps.length - 1) {
			setLoginStep(loginStep + 1);
		}
		else {
			router.push(returnUrl);
		}
	};

	const handlePrevStep = () => {
		if (loginStep > 0) {
			setLoginStep(loginStep - 1);
		}
	};

	const methods = [
		{ name: 'Password' },
		{ name: 'Captcha' },
		{ name: 'OTP Code' },
	];

	const loginSteps = [
		{
			name: 'Email',
			component: <EmailAttemptStep
				handleNextStep={handleNextStep}
				authPayload={authPayload}
				setAuthPayload={setAuthPayload} />,
		},
		{
			name: 'Select Method',
			component: (
				<LoginMethods
					methods={methods}
					handleNextStep={handleNextStep}
					authPayload={authPayload}
					setAuthPayload={setAuthPayload} />
			),
		},
		{
			name: 'Password',
			component: <PasswordStep
				handleNextStep={handleNextStep}
				authPayload={authPayload}
				setAuthPayload={setAuthPayload} />,
		}
	];


	return <Box>
		<Button
			className={clsx(
				{ 'hidden': loginStep <= 0 },
				'absolute',
				'top-6',
				'left-6',
			)}
			onClick={handlePrevStep}
			variant='subtle'
			color='gray'
		>
			<IconArrowLeft size={22} />
		</Button>
		{loginSteps[loginStep].component}
	</Box>;
};


const EmailAttemptStep: FC<{
	handleNextStep: () => void,
	setAuthPayload: (data: AuthPayload) => void;
	authPayload: AuthPayload;
}> = ({ handleNextStep, setAuthPayload, authPayload }) => {
	const { form, apiErrors, onSubmit: onSubmitForm } = useLoginAttemptForm();
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = form;
	const router = useRouter();

	const onSubmit = async (data: LoginAttemptFormData) => {
		onSubmitForm(data, () => {
			handleNextStep();
			setAuthPayload({
				...authPayload,
				username: data.email,
			});
		});
	};

	return (
		<Box>
			<Text size='xl' mb='md' className='text-center'>Login</Text>

			<ErrorAlert errors={apiErrors} />
			<form onSubmit={handleSubmit(onSubmit)}>
				<TextInput
					label='Email'
					placeholder='test@example.com'
					error={errors.email?.message}
					{...register('email')}
				/>

				<Button type='submit' fullWidth mt='xl'>
					Next
				</Button>
			</form>

			<Divider mt={'md'} my='xs' label='or' labelPosition='center' />

			<Box mt='md'>
				<Button
					fullWidth
					type='button'
					color='gray'
					variant='light'
					onClick={() => router.push('/register')}
				>
					Sign Up
				</Button>
			</Box>
		</Box>
	);
};

export const LoginMethods: FC<{
	handleNextStep: () => void;
	setAuthPayload: (data: AuthPayload) => void;
	authPayload: AuthPayload;
	methods: { name: string }[];
}> = ({ handleNextStep, methods, authPayload }) => {
	return (
		<Box>
			<Stack
				gap='xs'
				mb='md'
				align='center'
			>
				<Pill size='lg'>{authPayload.username}</Pill>
			</Stack>
			<Text size='xl' mt='lg' className='text-center'>Select Method</Text>

			<Divider mt={'sm'} my='md' labelPosition='center' />


			<Stack
				bg='var(--mantine-color-body)'
				align='stretch'
				justify='center'
				gap='md'
			>
				{methods.map((method) => (
					<Box key={method.name}>
						<Button fullWidth type='button' variant='default' onClick={handleNextStep}>
							{method.name}
						</Button>
					</Box>
				))}
			</Stack>
		</Box>
	);
};


const PasswordStep: FC<{
	handleNextStep: () => void
	setAuthPayload: (data: AuthPayload) => void;
	authPayload: AuthPayload;
}> = ({ handleNextStep, authPayload }) => {
	const { form, apiErrors, onSubmit } = useLoginForm('/');
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = form;

	return (
		<Box>
			<Stack
				gap='xs'
				mb='md'
				align='center'
			>
				<Pill size='lg'>{authPayload.username}</Pill>
			</Stack>
			<Text size='xl' mt='lg' className='text-center'>Enter Your Password</Text>

			<Divider mt={'sm'} my='md' labelPosition='center' />

			<form onSubmit={handleSubmit(onSubmit)}>
				<TextInput
					label='Password'
					placeholder='Your password'
					error={errors.password?.message}
					{...register('password')}
				/>

				<TextInput
					className='hidden'
					value={authPayload.username}
					{...register('email')}
				/>


				<Button type='submit' fullWidth mt='xl'>
					Sign In
				</Button>
			</form>
		</Box>
	);
};

const OtpCodeStep: FC<{
	handleNextStep: () => void;
	setAuthPayload: (data: AuthPayload) => void;
	authPayload: AuthPayload
}> = ({ handleNextStep, setAuthPayload, authPayload }) => {
	return (
		<Box>
			<TextInput label='OTP Code' placeholder='Your OTP Code' />
			<Button type='submit' fullWidth mt='xl'>
				Next
			</Button>
		</Box>
	);
};




const loginAttemptSchema = z.object({
	email: z.string().email('Invalid email address'),
});

type LoginAttemptFormData = z.infer<typeof loginAttemptSchema>;

const useLoginAttemptForm = () => {
	const form = useForm<LoginAttemptFormData>({
		resolver: zodResolver(loginAttemptSchema),
	});
	const router = useRouter();
	const { login } = useAuth();
	const [apiErrors, setApiErrors] = useState<string[]>([]);

	const onSubmit = async (
		data: LoginAttemptFormData,
		handleNextStep: () => void
	) => {
		const attemptData = await createLoginAttempt(data);
		if (attemptData.errors) {
			setApiErrors(attemptData.errors);
			return;
		}
		handleNextStep();
	};

	return { form, apiErrors, onSubmit };
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

const ErrorAlert = ({ errors }: { errors: string[] }) =>
	errors.length > 0 && (
		<Alert icon={<IconAlertCircle size={16} />} color='red' mb='lg'>
			{errors.map((error, index) => (
				<div key={index}>{error}</div>
			))}
		</Alert>
	);


