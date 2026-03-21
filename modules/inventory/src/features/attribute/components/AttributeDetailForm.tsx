import { Paper, Stack, Text, TextInput } from '@mantine/core';
import { ConfirmModal } from '@nikkierp/ui/components';
import {
	AutoField,
	FormStyleProvider,
	FormFieldProvider,
} from '@nikkierp/ui/components/form';
import React from 'react';

import type { FieldConstraint, FieldDefinition, ModelSchema } from '@nikkierp/ui/model';
import { JsonToString } from '../../../utils/serializer';


interface AttributeFieldsProps {
	attributeDetail: Record<string, unknown> | undefined;
	isLoading: boolean;
}

function AttributeFields({ attributeDetail, isLoading }: AttributeFieldsProps) {
	return (
		<Stack gap='md'>
			<AutoField name='displayName' autoFocused inputProps={{ size: 'lg', disabled: isLoading }} />
			<AutoField name='codeName' inputProps={{ disabled: isLoading }} />
			<AutoField name='dataType' inputProps={{ disabled: isLoading }} />
			<AutoField name='isEnum' inputProps={{ disabled: isLoading }} />
			<AutoField name='isRequired' inputProps={{ disabled: isLoading }} />
			<AutoField name='sortIndex' inputProps={{ disabled: isLoading }} />
			<div>
				<Text size='sm' fw={500} mb='xs'>Created At</Text>
				<TextInput
					value={attributeDetail?.createdAt ? new Date(String(attributeDetail.createdAt)).toLocaleString() : ''}
					size='md'
					variant='filled'
					readOnly
				/>
			</div>
			<div>
				<Text size='sm' fw={500} mb='xs'>Updated At</Text>
				<TextInput
					value={attributeDetail?.updatedAt ? new Date(String(attributeDetail.updatedAt)).toLocaleString() : ''}
					size='md'
					variant='filled'
					readOnly
				/>
			</div>
		</Stack>
	);
}

type AttributeSchema = {
	name: string;
	fields: Record<string, FieldDefinition>;
	constraints?: FieldConstraint[];
};

interface AttributeDetailFormProps {
	schema: ModelSchema | AttributeSchema;
	attributeDetail: Record<string, unknown> | undefined;
	isLoading: boolean;
	onSubmit: (data: Record<string, unknown>) => void | Promise<void>;
	onDelete: () => void | Promise<void>;
}

export function AttributeDetailForm({
	schema,
	attributeDetail,
	isLoading,
	onSubmit,
	onDelete,
}: AttributeDetailFormProps): React.ReactElement {
	const [showSaveConfirm, setShowSaveConfirm] = React.useState(false);
	const [pendingData, setPendingData] = React.useState<Record<string, unknown> | null>(null);
	const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

	const handleFormSubmit = (data: Record<string, unknown>) => {
		setPendingData(data);
		setShowSaveConfirm(true);
	};

	const handleConfirmSave = () => {
		setShowSaveConfirm(false);
		if (pendingData) {
			void onSubmit(pendingData);
			setPendingData(null);
		}
	};

	const handleConfirmDelete = () => {
		setShowDeleteConfirm(false);
		void onDelete();
	};

	const modelValue = {
		...attributeDetail,
		displayName: JsonToString(attributeDetail?.displayName),
	};

	return (
		<>
			<Paper className='p-4'>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider
						formVariant='update'
						modelSchema={schema}
						modelValue={modelValue}
						modelLoading={isLoading}
					>
						{({ handleSubmit }) => (
							<form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
									<AttributeFields
										attributeDetail={attributeDetail}
										isLoading={isLoading}
									/>
							</form>
						)}
					</FormFieldProvider>
				</FormStyleProvider>
			</Paper>

			<ConfirmModal
				opened={showSaveConfirm}
				onClose={() => setShowSaveConfirm(false)}
				onConfirm={handleConfirmSave}
				title='Confirm Update'
				message='Are you sure you want to save these attribute changes?'
				confirmLabel='Save'
			/>

			<ConfirmModal
				opened={showDeleteConfirm}
				onClose={() => setShowDeleteConfirm(false)}
				onConfirm={handleConfirmDelete}
				title='Confirm Delete'
				message='Are you sure you want to delete this attribute?'
				confirmLabel='Delete'
				confirmColor='red'
			/>
		</>
	);
}