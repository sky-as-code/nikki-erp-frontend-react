import { Anchor, Button, Group, Stack } from '@mantine/core';
import { AppDispatch } from '@nikkierp/shell/appState';
import { startSignInAction, useAuthState, useSignInProgress, actions } from '@nikkierp/shell/auth';
import { AutoField, FormFieldProvider, FormStyleProvider } from '@nikkierp/ui/components/form';
import { ModelSchema } from '@nikkierp/ui/model';
import { IconMail } from '@tabler/icons-react';
import { useUIState } from 'node_modules/@nikkierp/shell/src/contexts/UIProviders';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import emailSchema from './email-schema.json';
import { BaseFormContentProps, SignInStepProps } from './SignInStep.types';


const emailSchemaTyped = emailSchema as ModelSchema;

export function EmailStep({ onNext, ref, isActive = false }: SignInStepProps) {
	const formRef = React.useRef<HTMLFormElement>(null);
	const dispatch = useDispatch<AppDispatch>();
	const { isLoading, errorStartSignIn} = useAuthState();
	const { notification } = useUIState();
	const signInProgress = useSignInProgress();

	React.useEffect(() => {
		if (!isLoading && signInProgress?.nextStep === 'password' && onNext) {
			onNext();
		}
	}, [isLoading, signInProgress?.nextStep]);

	React.useEffect(() => {
		if (errorStartSignIn) {
			if (typeof errorStartSignIn === 'string') {
				notification.showError(errorStartSignIn, 'Error');
			}
			else {
				notification.showError(errorStartSignIn?.message || Object.values(errorStartSignIn?.details || {})[0] || 'Start sign-in attempt failed', 'Error');
			}
			dispatch(actions.resetErrorsStartSignIn());
		}
	}, [errorStartSignIn]);

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
	const {t} = useTranslation();

	return (
		<Stack gap='md'>
			<AutoField
				name='email'
				ref={props.ref}
				inputProps={{
					disabled: !props.isActive || props.isLoading,
					leftSection: <IconMail size={20} />,
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
							{t('nikki.shell.signIn.forgotEmail')}?
						</Anchor>
					</Group>

					<Button
						type='submit' fullWidth size='lg'
						className='bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors'
						loading={props.isLoading}
						disabled={props.isLoading}
					>
						{t('nikki.shell.signIn.nextStep')}
					</Button>
				</>
			)}
		</Stack>
	);
}

