import { Anchor, Button, Group, Stack } from '@mantine/core';
import { AppDispatch } from '@nikkierp/shell/appState';
import { useAuthState, useSignInProgress, continueSignInAction, actions } from '@nikkierp/shell/auth';
import { AutoField, FormFieldProvider, FormStyleProvider } from '@nikkierp/ui/components/form';
import { ModelSchema } from '@nikkierp/ui/model';
import { IconLock } from '@tabler/icons-react';
import { useUIState } from 'node_modules/@nikkierp/shell/src/contexts/UIProviders';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import passwordSchema from './password-schema.json';
import { BaseFormContentProps, SignInStepProps } from './SignInStep.types';


const passwordSchemaTyped = passwordSchema as ModelSchema;

type PasswordStepFormContentProps = BaseFormContentProps & {
	onBack: () => void;
};

export function PasswordStep({ onBack, ref, isActive = false }: SignInStepProps): React.ReactNode {
	const formRef = useRef<HTMLFormElement>(null);
	const dispatch = useDispatch<AppDispatch>();
	const { isLoading, errorContinueSignIn } = useAuthState();
	const signInProgress = useSignInProgress();
	const { notification } = useUIState();

	React.useEffect(() => {
		if (errorContinueSignIn) {
			if (typeof errorContinueSignIn === 'string') {
				notification.showError(errorContinueSignIn, 'Error');
			}
			else {
				notification.showError(errorContinueSignIn?.message || Object.values(errorContinueSignIn?.details || {})[0] || 'Start sign-in attempt failed', 'Error');
			}
			dispatch(actions.resetErrorsContinueSignIn());
		}
	}, [errorContinueSignIn]);

	const handleSubmit = async (data: { password: string }) => {
		// This would be passed as a prop in a real implementation
		dispatch(continueSignInAction({ passwords: {password :data.password},
			username: signInProgress?.email, attemptId: signInProgress?.attemptId }));
	};

	return (
		<FormStyleProvider layout='onecol'>
			<FormFieldProvider formVariant='create' modelSchema={passwordSchemaTyped}>
				{({ handleSubmit: formHandleSubmit }) => (
					<form ref={formRef} onSubmit={formHandleSubmit(handleSubmit)} noValidate>
						<PasswordStepFormContent
							onBack={onBack!} ref={ref}
							isActive={isActive} isLoading={isLoading}
						/>
					</form>
				)}
			</FormFieldProvider>
		</FormStyleProvider>
	);
}

function PasswordStepFormContent(props: PasswordStepFormContentProps): React.ReactNode {
	const {t} = useTranslation();

	return (
		<Stack gap='md'>
			<AutoField
				name='password'
				ref={props.ref}
				inputProps={{
					disabled: !props.isActive || props.isLoading,
					leftSection: <IconLock size={20} />,
				}}
			/>

			{props.isActive && (
				<>
					<Group justify='flex-end'>
						<Anchor
							href='#'
							size='sm'
							className='text-blue-600 hover:text-blue-800 transition-colors'
						>
							{t('signIn.forgotPassword')}?
						</Anchor>
					</Group>

					<Group gap='md'>
						<Button
							type='button' variant='outline' fullWidth size='lg'
							className='rounded-lg font-medium'
							onClick={props.onBack}
							disabled={props.isLoading}
						>
							{t('signIn.back')}
						</Button>
						<Button
							type='submit' fullWidth size='lg'
							className='bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors'
							loading={props.isLoading}
							disabled={props.isLoading}
						>
							{t('signIn.signIn')}
						</Button>
					</Group>
				</>
			)}
		</Stack>
	);
}

