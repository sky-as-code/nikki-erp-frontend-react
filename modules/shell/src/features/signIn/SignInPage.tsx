import { Anchor, Button, Card, Container, Group, Stack, Text, Title } from '@mantine/core';
import { AutoField, FormFieldProvider, FormStyleProvider } from '@nikkierp/ui/components/form';
import { ModelSchema } from '@nikkierp/ui/model';
import React, { useState, useEffect, useRef } from 'react';

// Import schemas for each step
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - JSON import
import emailSchema from './email-schema.json';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - JSON import
import passwordSchema from './password-schema.json';


const emailSchemaTyped = emailSchema as ModelSchema;
const passwordSchemaTyped = passwordSchema as ModelSchema;

type SignInStepProps = {
	ref?: React.RefObject<HTMLInputElement | null>;
	isActive?: boolean;
	onNext?: () => void;
	onBack?: () => void;
};

type SignInStep = {
	id: SignInStepId;
	component: React.ComponentType<SignInStepProps>;
	fieldName: string;
};

const SIGNIN_STEPS: SignInStep[] = [
	{ id: 'email', component: EmailStep, fieldName: 'email' },
	{ id: 'password', component: PasswordStep, fieldName: 'password' },
];

export function SignInPage(): React.ReactNode {
	const [currentStepIndex, setCurrentStepIndex] = useState(0);

	const handleNext = () => {
		if (currentStepIndex < SIGNIN_STEPS.length - 1) {
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
				<SignInCard
					steps={SIGNIN_STEPS}
					currentStepIndex={currentStepIndex}
					onNext={handleNext}
					onBack={handleBack}
				/>
			</Container>
		</div>
	);
}

type SignInStepId = 'email' | 'password';

function EmailStep({ onNext, ref, isActive = false }: SignInStepProps) {
	const formRef = useRef<HTMLFormElement>(null);

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
						noValidate
					>
						<EmailStepFormContent ref={ref} isActive={isActive} />
					</form>
				)}
			</FormFieldProvider>
		</FormStyleProvider>
	);
}

type BaseFormContentProps = {
	ref?: React.RefObject<HTMLInputElement | null>;
	isActive: boolean;
};

function EmailStepFormContent({ ref, isActive }: BaseFormContentProps): React.ReactNode {
	return (
		<Stack gap='md'>
			<AutoField name='email' ref={ref} inputProps={{
				disabled: !isActive,
			}} />

			{isActive && (<>

				<Group justify='flex-end'>
					<Anchor
						href='#'
						size='md'
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

				<div className='text-center pt-4 border-t border-gray-200'>
					<Text size='md' c='dimmed'>
						Don't have an account?{' '}
						<Anchor
							href='#'
							className='text-blue-600 hover:text-blue-800 font-medium'
						>
							Sign up here
						</Anchor>
					</Text>
				</div>
			</>)}
		</Stack>
	);
}

function PasswordStep({ onBack, ref, isActive = false }: SignInStepProps): React.ReactNode {
	const formRef = useRef<HTMLFormElement>(null);
	const handleSubmit = async (data: { password: string }) => {
		// This would be passed as a prop in a real implementation
		console.log('SignIn attempt:', data);
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
						noValidate
					>
						<PasswordStepFormContent
							onBack={onBack!} ref={ref} isActive={isActive}
						/>
					</form>
				)}
			</FormFieldProvider>
		</FormStyleProvider>
	);
}

type PasswordStepFormContentProps = BaseFormContentProps & {
	onBack: () => void;
};

function PasswordStepFormContent(props: PasswordStepFormContentProps): React.ReactNode {
	const [loading, _] = useState(false);

	return (
		<Stack gap='md'>
			<AutoField name='password' ref={props.ref} inputProps={{
				disabled: !props.isActive,
			}} />

			{props.isActive && (<>

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
					<Button
						type='button'
						variant='outline'
						fullWidth
						size='lg'
						onClick={props.onBack}
						className='rounded-lg font-medium'
					>
						Back
					</Button>
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
			</>)}
		</Stack>
	);
}

type SignInCardProps = {
	steps: SignInStep[];
	currentStepIndex: number;
	onNext: () => void;
	onBack: () => void;
};

function SignInCard(props: SignInCardProps): React.ReactNode {
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

				<MultiStepFormContainer
					steps={props.steps}
					currentStepIndex={props.currentStepIndex}
					onNext={props.onNext}
					onBack={props.onBack}
				/>
			</Stack>
		</Card>
	);
}

type MultiStepFormContainerProps = {
	steps: SignInStep[];
	currentStepIndex: number;
	onNext: () => void;
	onBack: () => void;
};

function MultiStepFormContainer({
	steps,
	currentStepIndex,
	onNext,
	onBack,
}: MultiStepFormContainerProps): React.ReactNode {
	const childRefs = useFocusActiveStep(steps, currentStepIndex);

	return (
		<ExposedArea>
			<SlidingArea steps={steps} currentStepIndex={currentStepIndex}>
				{(index, StepComponent) => {
					return (
						<StepComponent
							ref={childRefs[index]}
							isActive={index === currentStepIndex}
							onNext={index < steps.length - 1 ? onNext : undefined}
							onBack={index > 0 ? onBack : undefined}
						/>
					);
				}}
			</SlidingArea>
		</ExposedArea>
	);
}

function ExposedArea({ children }: React.PropsWithChildren) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (ref.current) {
			ref.current.scrollLeft = 0;
		}
	}, [ref.current]);

	return (
		<div
			ref={ref}
			onScroll={(e) => {
				e.currentTarget.scrollLeft = 0;
			}}
			style={{
				overflow: 'hidden',
				scrollBehavior: 'auto', // Disable smooth scrolling
			}}
			className='relative w-full'
		>
			{children}
		</div>
	);
}

type SlidingAreaProps = {
	children: (index: number, StepComponent: React.ComponentType<SignInStepProps>, step: SignInStep) => React.ReactNode;
	steps: SignInStep[];
	currentStepIndex: number;
};

function SlidingArea({ children, steps, currentStepIndex }: SlidingAreaProps) {
	return (
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
						{children(index, StepComponent, step)}
					</div>
				);
			})}
		</div>
	);
}

function useFocusActiveStep(steps: SignInStep[], currentStepIndex: number) {
	const ref = React.useMemo(
		() => steps.map(() => React.createRef<HTMLInputElement | null>()),
		[steps.length],
	);

	useEffect(
		() => {
			ref[currentStepIndex].current?.focus();
		},
		[currentStepIndex, ...ref.map((ref) => ref.current)]);

	return ref;
}