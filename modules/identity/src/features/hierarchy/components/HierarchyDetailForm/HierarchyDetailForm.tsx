import {
	Paper,
	Stack,
	TextInput,
	Text,
} from '@mantine/core';
import {
	FormStyleProvider,
	FormFieldProvider,
	AutoField,
} from '@nikkierp/ui/components/form';
import { FieldConstraint, FieldDefinition } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ButtonDetailPage } from '../../../../components/ButtonDetailPage';


type HierarchySchema = {
	name: string;
	fields: Record<string, FieldDefinition>;
	constraints?: FieldConstraint[];
};

interface HierarchyDetailFormProps {
	schema: HierarchySchema;
	hierarchyDetail: any;
	isLoading: boolean;
	onSubmit: (data: any) => void;
	onDelete: () => void;
}

export function HierarchyDetailForm({
	schema, hierarchyDetail, isLoading, onSubmit, onDelete,
}: HierarchyDetailFormProps): React.ReactElement {
	const { t } = useTranslation();
	return (
		<Paper className='p-4' shadow='sm'>
			<FormStyleProvider layout='onecol'>
				<FormFieldProvider
					formVariant='update'
					modelSchema={schema}
					modelValue={hierarchyDetail}
					modelLoading={isLoading}
				>
					{({ handleSubmit, form }) => (
						<form onSubmit={handleSubmit(onSubmit)} noValidate>
							<Stack gap='md'>
								<ButtonDetailPage
									onDelete={onDelete}
									isLoading={isLoading}
									disableSave={!form.formState.isDirty}
								/>
								<AutoField
									name='name'
									autoFocused
									inputProps={{
										size: 'lg',
										disabled: isLoading,
									}}
								/>
								<div>
									<Text size='sm' fw={500} mb='xs'>
										{t('nikki.identity.hierarchy.fields.createdAt')}
									</Text>
									<TextInput
										value={hierarchyDetail?.createdAt ? new Date(hierarchyDetail.createdAt).toLocaleString() : ''}
										size='md'
										variant='filled'
										readOnly
									/>
								</div>
								<div>
									<Text size='sm' fw={500} mb='xs'>
										{t('nikki.identity.hierarchy.fields.updatedAt')}
									</Text>
									<TextInput
										value={hierarchyDetail?.updatedAt ? new Date(hierarchyDetail.updatedAt).toLocaleString() : ''}
										size='md'
										variant='filled'
										readOnly
									/>
								</div>
							</Stack>
						</form>
					)}
				</FormFieldProvider>
			</FormStyleProvider>
		</Paper>
	);
}
