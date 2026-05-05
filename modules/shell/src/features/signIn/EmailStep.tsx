import { Anchor, Button, Group, Stack } from '@mantine/core';
import { AppDispatch } from '@nikkierp/shell/appState';
import { useStartSignIn } from '@nikkierp/shell/authenticate';
import { AdhocFormProvider, AutoField, FormStyleProvider } from '@nikkierp/ui/components/form';
import { IconMail } from '@tabler/icons-react';
// import { useUIState } from 'node_modules/@nikkierp/shell/src/contexts/UIProviders';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { emailSchema } from './emailSchema';
import { BaseFormContentProps, SignInStepProps } from './SignInStep.types';


export function EmailStep({ onNext, ref, isActive = false }: SignInStepProps) {
	const formRef = React.useRef<HTMLFormElement>(null);
	const dispatch = useDispatch<AppDispatch>();
	const { isDone: isSuccess, isLoading, action: startSignIn } = useStartSignIn();

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
		dispatch(startSignIn({ username: data.email }));
	};

	return (
		<FormStyleProvider layout='onecol'>
			<AdhocFormProvider formVariant='create' modelSchema={emailSchema}>
				{({ handleSubmit }) => (
					<form ref={formRef} onSubmit={handleSubmit(handleNext)} noValidate>
						<EmailStepFormContent ref={ref} isActive={isActive} isLoading={isLoading} />
					</form>
				)}
			</AdhocFormProvider>
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

