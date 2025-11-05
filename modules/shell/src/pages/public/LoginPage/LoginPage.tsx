import {
	Alert,
	Anchor,
	Button,
	Card,
	Container,
	Group,
	Stack,
	Text,
	Title,
} from '@mantine/core';
import {
	AutoField,
	FormFieldProvider,
	FormStyleProvider,
} from '@nikkierp/ui/components/form';
import { ModelSchema } from '@nikkierp/ui/model';
import { useState, useEffect, useRef } from 'react';

// Import schemas for each step
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - JSON import
import emailSchema from './email-schema.json';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - JSON import
import passwordSchema from './password-schema.json';


interface LoginStepProps {
	loading: boolean;
	onNext?: () => void;
	onBack?: () => void;
}

type LoginStepId = 'email' | 'password';

interface LoginStep {
	id: LoginStepId;
	component: React.ComponentType<LoginStepProps>;
	fieldName: string;
}

const emailSchemaTyped = emailSchema as ModelSchema;
const passwordSchemaTyped = passwordSchema as ModelSchema;

const EmailStep = ({ onNext }: LoginStepProps) => {
	const formRef = useRef<HTMLFormElement>(null);

	// Handle Enter key to trigger Next button
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
			e.preventDefault();
			const submitButton = formRef.current?.querySelector('button[type="submit"]') as HTMLButtonElement;
			submitButton?.click();
		}
	};

	const handleNext = async (_data: { email: string }) => {
		if (onNext) {
			onNext();
		}
	};

	return (
		<FormStyleProvider layout='onecol'>
			<FormFieldProvider
				formVariant='create'
				modelSchema={emailSchemaTyped}
			>
				{({ handleSubmit }) => (
					<form
						ref={formRef}
						onSubmit={handleSubmit(handleNext)}
						onKeyDown={handleKeyDown}
						noValidate
					>
						<EmailStepFormContent />
					</form>
				)}
			</FormFieldProvider>
		</FormStyleProvider>
	);
};

const EmailStepFormContent = () => (
	<Stack gap='md'>
		<AutoField name='email' />

		<Group justify='flex-end'>
			<Anchor
				href='#'
				size='sm'
				className='text-blue-600 hover:text-blue-800 transition-colors'
			>
				Forgot Email?
			</Anchor>
		</Group>

		<Button
			type='submit'
			fullWidth
			size='lg'
			className='bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors'
		>
			Next
		</Button>

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
);

const PasswordStep = ({ loading, onBack }: LoginStepProps) => {
	const formRef = useRef<HTMLFormElement>(null);

	// Handle Enter key to trigger Submit button
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
			e.preventDefault();
			const submitButton = formRef.current?.querySelector('button[type="submit"]') as HTMLButtonElement;
			submitButton?.click();
		}
	};

	const handleSubmit = async (data: { password: string }) => {
		// This would be passed as a prop in a real implementation
		console.log('Login attempt:', data);
	};

	return (
		<FormStyleProvider layout='onecol'>
			<FormFieldProvider
				formVariant='create'
				modelSchema={passwordSchemaTyped}
			>
				{({ handleSubmit: formHandleSubmit }) => (
					<form
						ref={formRef}
						onSubmit={formHandleSubmit(handleSubmit)}
						onKeyDown={handleKeyDown}
						noValidate
					>
						<PasswordStepFormContent loading={loading} onBack={onBack} />
					</form>
				)}
			</FormFieldProvider>
		</FormStyleProvider>
	);
};

interface PasswordStepFormContentProps {
	loading: boolean;
	onBack?: () => void;
}

const PasswordStepFormContent = ({
	loading,
	onBack,
}: PasswordStepFormContentProps) => (
	<Stack gap='md'>
		<AutoField name='password' />

		<Group justify='flex-end'>
			<Anchor
				href='#'
				size='sm'
				className='text-blue-600 hover:text-blue-800 transition-colors'
			>
				Forgot password?
			</Anchor>
		</Group>

		<Group gap='md'>
			{onBack && (
				<Button
					type='button'
					variant='outline'
					fullWidth
					size='lg'
					onClick={onBack}
					className='rounded-lg font-medium'
				>
					Back
				</Button>
			)}
			<Button
				type='submit'
				fullWidth
				size='lg'
				loading={loading}
				className='bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors'
			>
				{loading ? 'Signing in...' : 'Sign In'}
			</Button>
		</Group>
	</Stack>
);

// Define steps array - easily extensible for future steps
const LOGIN_STEPS: LoginStep[] = [
	{ id: 'email', component: EmailStep, fieldName: 'email' },
	{ id: 'password', component: PasswordStep, fieldName: 'password' },
];

export const LoginPage = () => {
	const [loading] = useState(false);
	const [error] = useState<string | null>(null);
	const [currentStepIndex, setCurrentStepIndex] = useState(0);

	const handleNext = () => {
		if (currentStepIndex < LOGIN_STEPS.length - 1) {
			setCurrentStepIndex(currentStepIndex + 1);
		}
	};

	const handleBack = () => {
		if (currentStepIndex > 0) {
			setCurrentStepIndex(currentStepIndex - 1);
		}
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
			<Container size='sm' className='w-full'>
				<LoginCard
					error={error}
					steps={LOGIN_STEPS}
					currentStepIndex={currentStepIndex}
					loading={loading}
					onNext={handleNext}
					onBack={handleBack}
				/>
			</Container>
		</div>
	);
};

interface LoginCardProps {
	error: string | null;
	steps: LoginStep[];
	currentStepIndex: number;
	loading: boolean;
	onNext: () => void;
	onBack: () => void;
}

const LoginCard = ({
	error,
	steps,
	currentStepIndex,
	loading,
	onNext,
	onBack,
}: LoginCardProps) => {
	return (
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

				{/* Multi-step Form Container */}
				<MultiStepFormContainer
					steps={steps}
					currentStepIndex={currentStepIndex}
					loading={loading}
					onNext={onNext}
					onBack={onBack}
				/>
			</Stack>
		</Card>
	);
};

interface MultiStepFormContainerProps {
	steps: LoginStep[];
	currentStepIndex: number;
	loading: boolean;
	onNext: () => void;
	onBack: () => void;
}

const MultiStepFormContainer = ({
	steps,
	currentStepIndex,
	loading,
	onNext,
	onBack,
}: MultiStepFormContainerProps) => {
	const containerRef = useRef<HTMLDivElement>(null);

	// Ensure container scrolls to start position on mount and when step changes
	useEffect(() => {
		if (containerRef.current) {
			containerRef.current.scrollLeft = 0;
		}
	}, [currentStepIndex]);

	return (
		<div
			ref={containerRef}
			className='relative w-full'
			style={{
				overflow: 'hidden',
				overflowX: 'hidden',
				overflowY: 'hidden',
				scrollBehavior: 'auto', // Disable smooth scrolling
			}}
			onScroll={(e) => {
				// Prevent any scrolling
				e.currentTarget.scrollLeft = 0;
			}}
		>
			<div
				className='flex transition-transform duration-300 ease-in-out'
				style={{
					width: `${steps.length * 100}%`,
					transform: `translateX(-${currentStepIndex * (100 / steps.length)}%)`,
					willChange: 'transform',
				}}
			>
				{steps.map((step, index) => {
					const StepComponent = step.component;
					return (
						<div
							key={step.id}
							className='flex-shrink-0'
							style={{
								width: `${100 / steps.length}%`,
								pointerEvents: index === currentStepIndex ? 'auto' : 'none',
							}}
						>
							<StepComponent
								loading={loading}
								onNext={index < steps.length - 1 ? onNext : undefined}
								onBack={index > 0 ? onBack : undefined}
							/>
						</div>
					);
				})}
			</div>
		</div>
	);
};