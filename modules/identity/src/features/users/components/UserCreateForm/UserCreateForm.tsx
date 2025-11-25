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

import { ButtonCreatePage } from '../../../../components/ButtonCreatePage/ButtonCreatePage';


type UserSchema = {
	name: string;
	fields: Record<string, FieldDefinition>;
	constraints?: FieldConstraint[];
};

interface UserCreateFormProps {
	isCreatingUser: boolean;
	schema: UserSchema;
	onSubmit: (data: any) => void;
}

export function UserCreateForm({ schema, isCreatingUser, onSubmit }: UserCreateFormProps): React.ReactElement {

	return (
		<FormStyleProvider layout='onecol'>
			<FormFieldProvider
				formVariant='create'
				modelSchema={schema}
			>
				{({ handleSubmit }) => (
					<form onSubmit={handleSubmit(onSubmit)}>
						<Paper withBorder>
							<Stack gap='md' p='md'>
								<Stack gap='md'>
									<AutoField name='email' autoFocused inputProps={{ disabled: isCreatingUser }} />
									<AutoField name='displayName' inputProps={{ disabled: isCreatingUser }} />
									<AutoField name='password' inputProps={{ disabled: isCreatingUser }} />
									<AutoField name='confirmPassword' inputProps={{ disabled: isCreatingUser }} />
								</Stack>

								<ButtonCreatePage
									isLoading={isCreatingUser}
								/>
							</Stack>
						</Paper>
					</form>
				)}
			</FormFieldProvider>
		</FormStyleProvider >
	);
}
