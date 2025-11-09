import { Anchor, Button, Group, Loader, Stack, Text } from '@mantine/core';
import { AppDispatch } from '@nikkierp/shell/appState';
import { startSignInAction, useAuthState, useSignInProgress } from '@nikkierp/shell/auth';
import { AutoField, FormFieldProvider, FormStyleProvider } from '@nikkierp/ui/components/form';
import { ModelSchema } from '@nikkierp/ui/model';
import { IconLoader2 } from '@tabler/icons-react';
import React from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - JSON import
import { useDispatch } from 'react-redux';

import emailSchema from './email-schema.json';
import { BaseFormContentProps, SignInStepProps } from './SignInStep.types';


const emailSchemaTyped = emailSchema as ModelSchema;

export function EmailStep({ onNext, ref, isActive = false }: SignInStepProps) {
	const formRef = React.useRef<HTMLFormElement>(null);
	const dispatch = useDispatch<AppDispatch>();
	const { isLoading } = useAuthState();
	const signInProgress = useSignInProgress();

	React.useEffect(() => {
		if (!isLoading && signInProgress?.nextStep === 'password' && onNext) {
			onNext();
		}
	}, [isLoading, signInProgress?.nextStep]);

	const handleNext = async (data: { email: string }) => {
		dispatch(startSignInAction({ email: data.email }));
	};

	return (
		<FormStyleProvider layout='onecol'>
			<FormFieldProvider formVariant='create' modelSchema={emailSchemaTyped}>
				{({ handleSubmit }) => (
					<form ref={formRef} onSubmit={handleSubmit(handleNext)} noValidate>
						<EmailStepFormContent ref={ref} isActive={isActive} isLoading={isLoading} />
					</form>
				)}
			</FormFieldProvider>
		</FormStyleProvider>
	);
}

function EmailStepFormContent(props: BaseFormContentProps): React.ReactNode {
	return (
		<Stack gap='md'>
			<AutoField
				name='email'
				ref={props.ref}
				inputProps={{
					disabled: !props.isActive || props.isLoading,
				}}
			/>

			{props.isActive && (
				<>
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
						type='submit' fullWidth size='lg'
						className='bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors'
						loading={props.isLoading}
						disabled={props.isLoading}
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
				</>
			)}
		</Stack>
	);
}

