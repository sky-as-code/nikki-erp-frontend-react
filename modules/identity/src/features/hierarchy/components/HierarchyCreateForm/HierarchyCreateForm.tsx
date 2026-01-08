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


type HierarchySchema = {
	name: string;
	fields: Record<string, FieldDefinition>;
	constraints?: FieldConstraint[];
};

interface HierarchyCreateFormProps {
	schema: HierarchySchema;
	isCreating: boolean;
	onSubmit: (data: any) => void;
}

export function HierarchyCreateForm({ schema, isCreating, onSubmit }: HierarchyCreateFormProps): React.ReactElement {
	return (
		<Paper className='p-4' shadow='sm'>
			<FormStyleProvider layout='onecol'>
				<FormFieldProvider
					formVariant='create'
					modelSchema={schema}
				>
					{({ handleSubmit }) => (
						<form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete='off'>
							<Stack gap='md'>
								<Stack gap='md'>
									<AutoField
										name='name'
										autoFocused
										inputProps={{
											disabled: isCreating,
										}}
									/>
									<AutoField
										name='parentId'
										inputProps={{
											disabled: isCreating,
										}}
									/>
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
