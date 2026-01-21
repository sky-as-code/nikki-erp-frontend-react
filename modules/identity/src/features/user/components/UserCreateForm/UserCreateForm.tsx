import {
	Paper,
	Stack,
} from '@mantine/core';
import {
	FormFieldProvider,
	FormStyleProvider,
	AutoField,
} from '@nikkierp/ui/components';
import { FieldConstraint, FieldDefinition } from '@nikkierp/ui/model';
import React from 'react';

import { ListActionCreatePage } from '../../../../components/ListActionBar';

import type { UseFormReturn } from 'react-hook-form';


type UserSchema = {
	name: string;
	fields: Record<string, FieldDefinition>;
	constraints?: FieldConstraint[];
};

interface UserCreateFormProps {
	isLoading: boolean;
	schema: UserSchema;
	onSubmit: (data: any) => void;
}

function validateAndGetPasswords(form: UseFormReturn<any>): { password: string; confirmPassword: string } | null {
	const { password, confirmPassword } = form.getValues() as {
		password?: string;
		confirmPassword?: string;
	};

	let hasError = false;
	form.clearErrors(['password', 'confirmPassword']);

	if (!password) {
		hasError = true;
		form.setError('password', { type: 'manual', message: 'nikki.identity.user.errors.password_required' });
	}
	else if (password.length < 8) {
		hasError = true;
		form.setError('password', { type: 'manual', message: 'nikki.identity.user.errors.password_min_length_8' });
	}

	if (!confirmPassword) {
		hasError = true;
		form.setError('confirmPassword', { type: 'manual', message: 'nikki.identity.user.errors.confirm_password_required' });
	}
	else if (password && confirmPassword !== password) {
		hasError = true;
		form.setError('confirmPassword', { type: 'manual', message: 'nikki.identity.user.errors.passwords_do_not_match' });
	}

	if (hasError || !password || !confirmPassword) {
		return null;
	}

	return { password, confirmPassword };
}

export function UserCreateForm({ schema, isLoading, onSubmit }: UserCreateFormProps): React.ReactElement {

	return (
		<FormStyleProvider layout='onecol'>
			<FormFieldProvider
				formVariant='create'
				modelSchema={schema}
			>
				{({ handleSubmit, form }) => (
					<form
						onSubmit={handleSubmit((data) => {
							const passwords = validateAndGetPasswords(form);
							if (!passwords) return;

							onSubmit({
								...data,
								...passwords,
							});
						})}
					>
						<Paper withBorder>
							<Stack gap='md' p='md'>
								<Stack gap='md'>
									<AutoField name='email' autoFocused inputProps={{ disabled: isLoading }} />
									<AutoField name='displayName' inputProps={{ disabled: isLoading }} />
									<AutoField name='password' inputProps={{ disabled: isLoading }} />
									<AutoField name='confirmPassword' inputProps={{ disabled: isLoading }} />
								</Stack>

								<ListActionCreatePage
									isLoading={isLoading}
								/>
							</Stack>
						</Paper>
					</form>
				)}
			</FormFieldProvider>
		</FormStyleProvider >
	);
}
