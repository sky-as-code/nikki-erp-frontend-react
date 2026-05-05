import { Card, Container, Stack, Text, Title } from '@mantine/core';
import { useIsAuthenticated, useStartSignIn, useContinueSignIn } from '@nikkierp/shell/authenticate';
import { actions as routingActions } from '@nikkierp/ui/appState/routingSlice';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router';

import { EmailStep } from './EmailStep';
import { PasswordStep } from './PasswordStep';
import { SignInStepProps } from './SignInStep.types';


type SignInStep = {
	name: string;
	component: React.ComponentType<SignInStepProps>;
};

const SIGNIN_STEPS: SignInStep[] = [
	{ name: 'email', component: EmailStep },
	{ name: 'password', component: PasswordStep },
];

export function SignInPage(): React.ReactNode {
	const [currentStepIdx, setCurrentStepIdx] = React.useState(0);
	const { isDone: isSignInStarted, data: startSignInData } = useStartSignIn();
	const { isDone: isSignInInProgress, data: continueSignInData } = useContinueSignIn();
	const isAuthenticated = useIsAuthenticated();
	const dispatch = useDispatch();

	const [searchParams] = useSearchParams();
	const returnTo = searchParams.get('returnTo');

	React.useEffect(() => {
		if (isAuthenticated) {
			dispatch(routingActions.navigateReturnTo(returnTo));
		}
	}, [isAuthenticated]);

	const handleNext = () => {
		let stepName: string;
		if (isSignInInProgress && continueSignInData!.nextStep) {
			stepName = continueSignInData!.nextStep;
		}
		else if (isSignInStarted) {
			stepName = startSignInData!.currentMethod;
		}
		const stepIdx = SIGNIN_STEPS.findIndex((step) => step.name === stepName);
		if (stepIdx !== -1) {
			setCurrentStepIdx(stepIdx);
		}
	};

	const handleBack = () => {
		if (currentStepIdx > 0) {
			setCurrentStepIdx(currentStepIdx - 1);
		}
	};

	return (
		<div className='h-full flex items-center justify-center p-4 bg-transparent'>
			<Container size='sm' className='w-full'>
				<SignInCard
					steps={SIGNIN_STEPS}
					currentStepIndex={currentStepIdx}
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
	const {t} = useTranslation();

	return (
		<Card
			shadow='xl'
			radius='lg'
			p='xl'
			className='bg-white/80 backdrop-blur-sm border-0'
		>
			<Stack gap='lg'>
				<div className='text-center'>
					<Title order={1} className='text-3xl font-bold text-gray-800 mb-2'>
						{t('nikki.shell.signIn.title')}
					</Title>
					<Text c='dimmed' size='lg'>
						{t('nikki.shell.signIn.description')}
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
						key={step.name}
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