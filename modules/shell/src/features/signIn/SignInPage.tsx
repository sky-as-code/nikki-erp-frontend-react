import { Card, Container, Stack, Text, Title } from '@mantine/core';
import { useIsAuthenticated } from '@nikkierp/shell/auth';
import { navigateReturnToAction } from '@nikkierp/ui/appState/routingSlice';
import React from 'react';
import { useDispatch } from 'react-redux';

import { EmailStep } from './EmailStep';
import { PasswordStep } from './PasswordStep';
import { SignInStepProps } from './SignInStep.types';


type SignInStep = {
	id: string;
	component: React.ComponentType<SignInStepProps>;
};

const SIGNIN_STEPS: SignInStep[] = [
	{ id: 'email', component: EmailStep },
	{ id: 'password', component: PasswordStep },
];

export function SignInPage(): React.ReactNode {
	const [currentStepIndex, setCurrentStepIndex] = React.useState(0);
	const isAuthenticated = useIsAuthenticated();
	const dispatch = useDispatch();
	// const navigate = useNavigate();
	// const [searchParams] = useSearchParams();
	// const returnTo = searchParams.get('returnTo');

	React.useEffect(() => {
		if (isAuthenticated) {
			dispatch(navigateReturnToAction());
		}
	}, [isAuthenticated]);

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
	const ref = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
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

	React.useEffect(
		() => {
			ref[currentStepIndex].current?.focus();
		},
		[currentStepIndex, ...ref.map((ref) => ref.current)]);

	return ref;
}