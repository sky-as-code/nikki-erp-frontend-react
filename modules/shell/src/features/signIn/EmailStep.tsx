import { Anchor, Button, Group, Stack, Text } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { authService } from '@nikkierp/shell/authenticate';
import { useServiceLayer } from '@nikkierp/ui/appState/store';
import {
	AdhocFormProvider, AutoField, FormStyleProvider, FormTestIdProvider,
} from '@nikkierp/ui/components/form';
import { useLocalize, useTranslate } from '@nikkierp/ui/i18n';
import { IconMail } from '@tabler/icons-react';
import clsx from 'clsx';
import React from 'react';

import { emailSchema } from './emailSchema';
import classes from './SignIn.module.css';
import { SignInClientErrors } from './SignInClientErrors';
import { BaseFormContentProps, SignInStepProps } from './SignInStep.types';



const SIGN_IN_EMAIL_TEST_ID = 'shell.signInEmail';


export function EmailStep({ onNext, ref, isActive = false }: SignInStepProps) {
	const formRef = React.useRef<HTMLFormElement>(null);
	const { dispatchMethod: startSignIn, result } = useServiceLayer(authService.startSignIn);
	const { isSuccess, isPending: isLoading, clientErrors } = result;
	const localize = useLocalize('common');

	React.useEffect(() => {
		if (isSuccess && onNext) {
			onNext();
		}
	}, [isSuccess, onNext]);

	// React.useEffect(() => {
	// 	if (errorStartSignIn) {
	// 		if (typeof errorStartSignIn === 'string') {
	// 			notification.showError(errorStartSignIn, 'Error');
	// 		}
	// 		else {
	// 			notification.showError(errorStartSignIn?.message || Object.values(errorStartSignIn?.details || {})[0] || 'Start sign-in attempt failed', 'Error');
	// 		}
	// 		dispatch(actions.resetErrorsStartSignIn());
	// 	}
	// }, [errorStartSignIn]);

	const handleNext = async (data: { email: string }) => {
		startSignIn({ username: data.email });
	};

	return (
		<FormStyleProvider layout='onecol'>
			<FormTestIdProvider testId={SIGN_IN_EMAIL_TEST_ID}>
				<AdhocFormProvider formVariant='create' modelSchema={emailSchema} localize={localize}>
					{({ handleSubmit }) => (
						<form ref={formRef} onSubmit={handleSubmit(handleNext)} noValidate>
							<EmailStepFormContent
								ref={ref} isActive={isActive} isLoading={isLoading} clientErrors={clientErrors}
							/>
						</form>
					)}
				</AdhocFormProvider>
			</FormTestIdProvider>
		</FormStyleProvider>
	);
}

function EmailStepFormContent(props: BaseFormContentProps): React.ReactNode {
	const t = useTranslate('common');

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
			<SignInClientErrors errors={props.clientErrors ?? []} testId={SIGN_IN_EMAIL_TEST_ID} />
			<Text size='md' c='dimmed'>
				Domain admin: <code>nguyen.van.an@nikki.com</code><br/>
				Identity readonly: <code>tran.thi.binh@nikki.com</code>
			</Text>

			{props.isActive && (
				<>
					<Group justify='flex-end'>
						<Anchor
							href='#'
							size='md'
							className={clsx(classes.link, 'transition-colors')}
							{...testAttrs(SIGN_IN_EMAIL_TEST_ID, 'forgotEmail')}
						>
							{t('signIn.forgotEmail')}?
						</Anchor>
					</Group>

					<Button
						type='submit' fullWidth size='lg'
						className='bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors'
						loading={props.isLoading}
						disabled={props.isLoading}
						{...testAttrs(SIGN_IN_EMAIL_TEST_ID, 'next')}
					>
						{t('signIn.nextStep')}
					</Button>
				</>
			)}
		</Stack>
	);
}

