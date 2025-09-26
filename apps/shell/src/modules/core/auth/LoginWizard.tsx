import { zodResolver } from '@hookform/resolvers/zod';
import {
	Alert,
	Box,
	Button,
	Divider,
	TextInput,
	Text,
	Pill,
	Stack,
	PasswordInput,
} from '@mantine/core';
import { useAuth } from '@modules/core/auth/AuthProvider';
import { IconAlertCircle, IconArrowLeft } from '@tabler/icons-react';
import { useRouter } from '@tanstack/react-router';
import clsx from 'clsx';
import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { createLoginAttempt, loginUser } from './service';

export type AuthPayload = {
	attemptId: string;
	username: string;
	password?: string;
	currentMethod: string;
	methods: string[];
};

type LoginStepProps = {
	handleNextStep: () => void;
	setAuthPayload: (data: AuthPayload) => void;
	authPayload: AuthPayload;
};

export const LoginWizard = ({ returnUrl }: { returnUrl: string }) => {
	const router = useRouter();

	const [loginStep, setLoginStep] = useState(0);
	const [attemptId, setAttemptId] = useState<string | null>(null);
	const [authPayload, setAuthPayload] = useState<AuthPayload>({
		attemptId: '',
		username: '',
		currentMethod: 'password',
		methods: ['password', 'otpCode', 'captcha'],
	});

	const handleNextStep = (method?: string) => {
		if (loginStep < loginSteps.length - 1) {
			setLoginStep(loginStep + 1);
			if (method) {
				setAuthPayload({
					...authPayload,
					currentMethod: method,
				});
			}
		}
		else {
			router.navigate({ to: returnUrl });
		}
	};

	const handlePrevStep = () => {
		if (loginStep > 0) {
			setLoginStep(loginStep - 1);
		}
	};

	const loginSteps: {
		name: string;
		key: string;
		component: React.ComponentType<LoginStepProps>;
	}[] = [
		...loginCommonSteps,
		authPayload.currentMethod
			? loginMethodSteps[authPayload.currentMethod] ?? loginMethodSteps.Password
			: loginMethodSteps.Password,
	];

	const CurrentStep = loginSteps[loginStep]?.component || PasswordMethod;

	return (
		<Box>
			<Button
				className={clsx(
					{ hidden: loginStep <= 0 },
					'absolute',
					'top-6',
					'left-6'
				)}
				onClick={handlePrevStep}
				variant='subtle'
				color='gray'
			>
				<IconArrowLeft size={22} />
			</Button>
			<CurrentStep
				handleNextStep={handleNextStep}
				setAuthPayload={setAuthPayload}
				authPayload={authPayload}
			/>
		</Box>
	);
};

const EmailAttemptStep: FC<{
	handleNextStep: () => void;
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
			<Text size='xl' mb='md' className='text-center'>
				Login
			</Text>

			<ErrorAlert errors={apiErrors} />
			<form onSubmit={handleSubmit(onSubmit)}>
				<TextInput
					size='md'
					label='Email'
					labelProps={{ className: 'text-gray-600' }}
					placeholder='test@example.com'
					error={errors.email?.message}
					{...register('email')}
				/>

				<Button type='submit' fullWidth mt='xl' size='md'>
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
					size='md'
					onClick={() => router.navigate({ to: '/register' })}
				>
					Sign Up
				</Button>
			</Box>
		</Box>
	);
};

export const LoginMethods: FC<{
	handleNextStep: (method: string) => void;
	setAuthPayload: (data: AuthPayload) => void;
	authPayload: AuthPayload;
}> = ({ handleNextStep, authPayload }) => {
	return (
		<Box>
			<Stack gap='xs' mb='md' align='center'>
				<Pill className='px-5' bg={'var(--mantine-color-gray-3)'} size='lg'>
					{authPayload.username}
				</Pill>
			</Stack>
			<Text size='xl' my='xl' className='text-center'>
				Select Method
			</Text>

			<Stack align='stretch' justify='center' gap='md'>
				{authPayload?.methods
					.filter((m) => loginMethodSteps[m])
					.map((currentMethod) => {
						const detailMethod = loginMethodSteps[currentMethod];
						return (
							<Box key={currentMethod}>
								<Button
									fullWidth
									size='md'
									type='button'
									variant='default'
									onClick={() => handleNextStep(currentMethod)}
								>
									{detailMethod.name}
								</Button>
							</Box>
						);
					})}
			</Stack>
		</Box>
	);
};

const PasswordMethod: FC<{
	handleNextStep: (method?: string) => void;
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
			<Stack gap='xs' mb='md' align='center'>
				<Pill className='px-5' bg={'var(--mantine-color-gray-3)'} size='lg'>
					{authPayload.username}
				</Pill>
			</Stack>
			<Text size='xl' my='xl' className='text-center'>
				Enter Your Password
			</Text>

			<form onSubmit={handleSubmit(onSubmit)}>
				<PasswordInput
					label='Password'
					required
					size='md'
					placeholder='Your password'
					labelProps={{ className: 'text-gray-600' }}
					error={errors.password?.message}
					{...register('password')}
				/>

				<TextInput
					className='hidden'
					value={authPayload.username}
					{...register('email')}
				/>

				<Button type='submit' fullWidth mt='xl' size='md'>
					Sign In
				</Button>
			</form>
		</Box>
	);
};

const OtpMethod: FC<{
	handleNextStep: () => void;
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
			<Stack gap='xs' mb='md' align='center'>
				<Pill className='px-5' bg={'var(--mantine-color-gray-3)'} size='lg'>
					{authPayload.username}
				</Pill>
			</Stack>
			<Text size='xl' my='xl' className='text-center'>
				Login with OTP
			</Text>

			<form onSubmit={handleSubmit(onSubmit)}>
				<PasswordInput
					label='Otp Code'
					required
					size='md'
					placeholder='Enter Otp'
					labelProps={{ className: 'text-gray-600' }}
					error={errors.password?.message}
					{...register('password')}
				/>

				<TextInput
					className='hidden'
					value={authPayload.username}
					{...register('email')}
				/>

				<Button type='submit' fullWidth mt='xl' size='md'>
					Sign In
				</Button>
			</form>
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
	// const router = useRouter();
	// const { login } = useAuth();
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
		router.navigate({ to: returnUrl });
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

// Các step theo từng method
const loginMethodSteps: Record<
	string,
	{ key: string; name: string; component: React.ComponentType<LoginStepProps> }
> = {
	password: {
		name: 'Password',
		key: 'password',
		component: PasswordMethod,
	},
	otpCode: {
		key: 'otpCode',
		name: 'OTP Code',
		component: OtpMethod,
	},
};

const loginCommonSteps: {
	name: string;
	key: string;
	component: React.ComponentType<LoginStepProps>;
}[] = [
	{
		name: 'Email',
		key: 'email',
		component: EmailAttemptStep,
	},
	{
		name: 'Select Method',
		key: 'selectMethod',
		component: LoginMethods,
	},
];
