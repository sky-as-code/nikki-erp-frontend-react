import { Anchor, Button, Group, Stack, Text } from '@mantine/core';
import { authService, useStartSignIn } from '@nikkierp/shell/authenticate';
import { useServiceLayer } from '@nikkierp/ui/appState/store';
import { AdhocFormProvider, AutoField, FormStyleProvider } from '@nikkierp/ui/components/form';
import { useLocalize, useTranslate } from '@nikkierp/ui/i18n';
import { IconLock } from '@tabler/icons-react';
import React, { useRef } from 'react';

import { passwordSchema } from './passwordSchema';
import { BaseFormContentProps, SignInStepProps } from './SignInStep.types';


type PasswordStepFormContentProps = BaseFormContentProps & {
	onBack: () => void,
};

export function PasswordStep({ onBack, ref, isActive = false }: SignInStepProps): React.ReactNode {
	const formRef = useRef<HTMLFormElement>(null);
	const { data: startSignInData } = useStartSignIn();
	const { dispatchMethod: continueSignIn, result } = useServiceLayer(authService.continueSignIn);
	const { isPending: isLoading } = result;
	const localize = useLocalize('common');

	const handleSubmit = async (data: { password: string }) => {
		continueSignIn({
			attemptId: startSignInData!.attemptId,
			passwords: {
				password: data.password,
			},
		});
	};

	return (
		<FormStyleProvider layout='onecol'>
			<AdhocFormProvider formVariant='create' modelSchema={passwordSchema} localize={localize}>
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
	const t = useTranslate('common');
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
			<Text size='md' c='dimmed'>Test password: <code>Passwo0rd123</code></Text>

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
							type='submit' fullWidth size='lg'
							className='bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors'
							loading={props.isLoading}
							disabled={props.isLoading}
						>
							{t('action.signIn')}
						</Button>
						<Button
							type='button' variant='outline' fullWidth size='lg'
							className='rounded-lg font-medium'
							onClick={props.onBack}
							disabled={props.isLoading}
						>
							{t('action.back')}
						</Button>
					</Group>
				</>
			)}
		</Stack>
	);
}

