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

export function UserCreateForm({ schema, isLoading, onSubmit }: UserCreateFormProps): React.ReactElement {

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
