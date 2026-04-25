import {
	Paper,
	Stack,
} from '@mantine/core';
import {
	CrudFormProvider,
	FormStyleProvider,
	AutoField,
} from '@nikkierp/ui/components';
import React from 'react';

import { ListActionCreatePage } from '../../../../components/ListActionBar';
import { USER_SCHEMA_NAME } from '../../../../constants';

import type { UseFormReturn } from 'react-hook-form';


// interface UserCreateFormProps {
// 	// isLoading: boolean;
// 	// onSubmit: (data: any) => void;
// 	canCreate?: boolean;
// 	submitAction: (data: any) => void,
// }

// export function UserCreateForm(
// 	{ canCreate = true, submitAction }: UserCreateFormProps,
// ): React.ReactElement {

// 	return (
// 		<FormStyleProvider layout='onecol'>
// 			<CrudFormProvider
// 				schemaName={USER_SCHEMA_NAME}
// 				submitAction={submitAction}
// 			>
// 				{({ handleSubmit, form, isLoading }) => (
// 					<form
// 						onSubmit={handleSubmit((data) => {
// 							const passwords = validateAndGetPasswords(form);
// 							if (!passwords) return;

// 							return {
// 								...data,
// 								...passwords,
// 							};
// 						})}
// 					>
// 						<Paper withBorder>
// 							<Stack gap='md' p='md'>
// 								<Stack gap='md'>
// 									<AutoField name='email' autoFocused inputProps={{ disabled: isLoading }} />
// 									<AutoField name='displayName' inputProps={{ disabled: isLoading }} />
// 									<AutoField name='password' inputProps={{ disabled: isLoading }} />
// 									<AutoField name='confirmPassword' inputProps={{ disabled: isLoading }} />
// 								</Stack>

// 								<ListActionCreatePage
// 									isLoading={isLoading}
// 									disableCreate={!canCreate}
// 								/>
// 							</Stack>
// 						</Paper>
// 					</form>
// 				)}
// 			</CrudFormProvider>
// 		</FormStyleProvider >
// 	);
// }

// function validateAndGetPasswords(form: UseFormReturn<any>): { password: string; confirmPassword: string } | null {
// 	const { password, confirmPassword } = form.getValues() as {
// 		password?: string;
// 		confirmPassword?: string;
// 	};

// 	let hasError = false;
// 	form.clearErrors(['password', 'confirmPassword']);

// 	if (!password) {
// 		hasError = true;
// 		form.setError('password', { type: 'manual', message: 'nikki.identity.user.errors.password_required' });
// 	}
// 	else if (password.length < 8) {
// 		hasError = true;
// 		form.setError('password', { type: 'manual', message: 'nikki.identity.user.errors.password_min_length_8' });
// 	}

// 	if (!confirmPassword) {
// 		hasError = true;
// 		form.setError('confirmPassword', { type: 'manual', message: 'nikki.identity.user.errors.confirm_password_required' });
// 	}
// 	else if (password && confirmPassword !== password) {
// 		hasError = true;
// 		form.setError('confirmPassword', { type: 'manual', message: 'nikki.identity.user.errors.passwords_do_not_match' });
// 	}

// 	if (hasError || !password || !confirmPassword) {
// 		return null;
// 	}

// 	return { password, confirmPassword };
// }
