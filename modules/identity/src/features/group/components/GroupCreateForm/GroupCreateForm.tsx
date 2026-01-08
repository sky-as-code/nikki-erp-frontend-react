import {
	Button,
	Group as MantineGroup,
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


type GroupSchema = {
	name: string;
	fields: Record<string, FieldDefinition>;
	constraints?: FieldConstraint[];
};

interface GroupCreateFormProps {
	schema: GroupSchema;
	isCreating: boolean;
	onSubmit: (data: any) => void;
}

export function GroupCreateForm({ schema, isCreating, onSubmit }: GroupCreateFormProps): React.ReactElement {
	return (
		<Paper className='p-4' >
			<FormStyleProvider layout='onecol'>
				<FormFieldProvider
					formVariant='create'
					modelSchema={schema}
				>
					{({ handleSubmit }) => (
						<form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete='off'>
							<Stack gap='md'>
								<Stack gap='md'>
									<AutoField name='name' autoFocused inputProps={{ disabled: isCreating }} />
									<AutoField name='description' inputProps={{ disabled: isCreating }} />
								</Stack>

								<ListActionCreatePage
									isLoading={isCreating}
								/>
							</Stack>
						</form>
					)}
				</FormFieldProvider>
			</FormStyleProvider>
		</Paper>
	);
}
