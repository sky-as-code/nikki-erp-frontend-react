import { Anchor, Button, Group, Stack } from '@mantine/core';
import { AppDispatch } from '@nikkierp/shell/appState';
import { useAuthData, useSignInProgress, signInAction } from '@nikkierp/shell/auth';
import { AutoField, FormFieldProvider, FormStyleProvider } from '@nikkierp/ui/components/form';
import { ModelSchema } from '@nikkierp/ui/model';
import React, { useRef } from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - JSON import
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
	const { isLoading } = useAuthData();
	const signInProgress = useSignInProgress();

	const handleSubmit = async (data: { password: string }) => {
		// This would be passed as a prop in a real implementation
		console.log('SignIn attempt:', data);
		dispatch(signInAction({ password: data.password }));
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
	return (
		<Stack gap='md'>
			<AutoField
				name='password'
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
							size='sm'
							className='text-blue-600 hover:text-blue-800 transition-colors'
						>
							Forgot password?
						</Anchor>
					</Group>

					<Group gap='md'>
						<Button
							type='button' variant='outline' fullWidth size='lg'
							className='rounded-lg font-medium'
							onClick={props.onBack}
							disabled={props.isLoading}
						>
							Back
						</Button>
						<Button
							type='submit' fullWidth size='lg'
							className='bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors'
							loading={props.isLoading}
							disabled={props.isLoading}
						>
							Sign In
						</Button>
					</Group>
				</>
			)}
		</Stack>
	);
}

