import { Anchor, Button, Group, Stack } from '@mantine/core';
import { AppDispatch } from '@nikkierp/shell/appState';
import { useContinueSignIn, useStartSignIn } from '@nikkierp/shell/authenticate';
import { AdhocFormProvider, AutoField, FormStyleProvider } from '@nikkierp/ui/components/form';
import { IconLock } from '@tabler/icons-react';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { passwordSchema } from './passwordSchema';
import { BaseFormContentProps, SignInStepProps } from './SignInStep.types';


type PasswordStepFormContentProps = BaseFormContentProps & {
	onBack: () => void;
};

export function PasswordStep({ onBack, ref, isActive = false }: SignInStepProps): React.ReactNode {
	const formRef = useRef<HTMLFormElement>(null);
	const dispatch = useDispatch<AppDispatch>();
	const { data: startSignInData } = useStartSignIn();
	const { isError, isLoading, action: continueSignIn } = useContinueSignIn();

	const handleSubmit = async (data: { password: string }) => {
		// This would be passed as a prop in a real implementation
		dispatch(continueSignIn({
			attemptId: startSignInData!.attemptId,
			passwords: {
				password: data.password,
			},
		}));
	};

	return (
		<FormStyleProvider layout='onecol'>
			<AdhocFormProvider formVariant='create' modelSchema={passwordSchema}>
				{({ handleSubmit: formHandleSubmit }) => (
					<form ref={formRef} onSubmit={formHandleSubmit(handleSubmit)} noValidate>
						<PasswordStepFormContent
							onBack={onBack!} ref={ref}
							isActive={isActive} isLoading={isLoading}
						/>
					</form>
				)}
			</AdhocFormProvider>
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
							{t('nikki.shell.signIn.forgotPassword')}?
						</Anchor>
					</Group>

					<Group gap='md'>
						<Button
							type='submit' fullWidth size='lg'
							className='bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors'
							loading={props.isLoading}
							disabled={props.isLoading}
						>
							{t('nikki.shell.signIn.signIn')}
						</Button>
						<Button
							type='button' variant='outline' fullWidth size='lg'
							className='rounded-lg font-medium'
							onClick={props.onBack}
							disabled={props.isLoading}
						>
							{t('nikki.shell.signIn.back')}
						</Button>
					</Group>
				</>
			)}
		</Stack>
	);
}

