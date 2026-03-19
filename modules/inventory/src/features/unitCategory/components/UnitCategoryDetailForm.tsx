import {
	Paper,
	Stack,
	Text,
	TextInput,
	Title,
} from '@mantine/core';
import {
	AutoField,
	FormFieldProvider,
	FormStyleProvider,
} from '@nikkierp/ui/components/form';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';

import { DetailActionBar } from '../../../components/ActionBar/DetailActionBar';
import { JsonToString } from '../../../utils/serializer';
import { useTranslation } from 'react-i18next';

import type { UnitCategory } from '../types';
import type { UnitCategoryDetailFormValues } from '../hooks/useUnitCategoryDetail';


interface UnitCategoryDetailFormProps {
	schema: ModelSchema;
	category: UnitCategory | undefined;
	isLoading: boolean;
	onSave: (values: UnitCategoryDetailFormValues) => void | Promise<void>;
	onDelete: () => void;
	onGoBack: () => void;
}

export function UnitCategoryDetailForm({
	schema,
	category,
	isLoading,
	onSave,
	onDelete,
	onGoBack,
}: UnitCategoryDetailFormProps): React.ReactElement {
	const { t } = useTranslation();
	const modelCategory = {
		...category,
		name: JsonToString(category?.name),
	};

	return (
		<FormStyleProvider layout='onecol'>
			<FormFieldProvider
				formVariant='update'
				modelSchema={schema}
				modelLoading={isLoading}
				modelValue={modelCategory}
			>
				{({ handleSubmit }) => (
					<form onSubmit={handleSubmit(onSave)} noValidate>
						<DetailActionBar
							onSave={() => void handleSubmit(onSave)()}
							onGoBack={onGoBack}
							onDelete={() => void onDelete()}
						/>
						<Stack gap='md'>
							<Title order={2}>Unit Category Details</Title>
							<AutoField name='name' inputProps={{ disabled: isLoading }} />
							<div>
								<Text size='sm' fw={500} mb='xs'>
									{t('nikki.identity.user.fields.createdAt')}
								</Text>
								<TextInput
									value={
										category?.createdAt
											? new Date(category.createdAt).toLocaleString()
											: ''
									}
									size='md'
									variant='filled'
									readOnly
								/>
							</div>
							<div>
								<Text size='sm' fw={500} mb='xs'>
									{t('nikki.identity.user.fields.updatedAt')}
								</Text>
								<TextInput
									value={
										category?.updatedAt
											? new Date(category.updatedAt).toLocaleString()
											: ''
									}
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
	);
}
