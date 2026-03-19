import { Paper, Stack, Text, TextInput } from '@mantine/core';
import { ConfirmModal } from '@nikkierp/ui/components';
import {
	FormStyleProvider,
	FormFieldProvider,
	AutoField,
} from '@nikkierp/ui/components/form';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { DetailActionBar } from '../../../../components/ActionBar/DetailActionBar';

import type { FieldConstraint, FieldDefinition } from '@nikkierp/ui/model';


interface VariantFieldsProps {
	variantDetail: Record<string, unknown> | undefined;
	isLoading: boolean;
}

function VariantFields({ variantDetail, isLoading }: VariantFieldsProps) {
	const { t } = useTranslation();

	return (
		<Stack gap='md'>
			<AutoField name='sku' autoFocused inputProps={{ size: 'lg', disabled: isLoading }} />
			<AutoField name='barcode' inputProps={{ disabled: isLoading }} />
			<AutoField name='proposedPrice' inputProps={{ disabled: isLoading }} />
			<AutoField name='status' inputProps={{ disabled: isLoading }} />
			<div>
				<Text size='sm' fw={500} mb='xs'>
					{t('nikki.inventory.variant.fields.createdAt')}
				</Text>
				<TextInput
					value={
						variantDetail?.createdAt
							? new Date(variantDetail.createdAt as number).toLocaleString()
							: ''
					}
					size='md'
					variant='filled'
					readOnly
				/>
			</div>
			<div>
				<Text size='sm' fw={500} mb='xs'>
					{t('nikki.inventory.variant.fields.updatedAt')}
				</Text>
				<TextInput
					value={
						variantDetail?.updatedAt
							? new Date(variantDetail.updatedAt as number).toLocaleString()
							: ''
					}
					size='md'
					variant='filled'
					readOnly
				/>
			</div>
		</Stack>
	);
}

type VariantSchema = {
	name: string;
	fields: Record<string, FieldDefinition>;
	constraints?: FieldConstraint[];
};

interface VariantDetailFormProps {
	schema: VariantSchema;
	variantDetail: Record<string, unknown> | undefined;
	isLoading: boolean;
	onSubmit: (data: Record<string, unknown>) => void;
	onDelete: () => void;
}

export function VariantDetailForm({
	schema,
	variantDetail,
	isLoading,
	onSubmit,
	onDelete,
}: VariantDetailFormProps): React.ReactElement {
	const { t } = useTranslation();
	const navigate = useNavigate();
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
			onSubmit(pendingData);
			setPendingData(null);
		}
	};

	const handleGoBack = () => {
		navigate(-1);
	};

	const handleDeleteClick = () => {
		setShowDeleteConfirm(true);
	};

	const handleConfirmDelete = () => {
		setShowDeleteConfirm(false);
		onDelete();
	};

	return (
		<>
			<Paper className='p-4'>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider
						formVariant='update'
						modelSchema={schema}
						modelValue={variantDetail}
						modelLoading={isLoading}
					>
						{({ handleSubmit }) => (
							<form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
								<Stack gap='md'>
									<DetailActionBar
										onSave={() => void handleSubmit(handleFormSubmit)()}
										onGoBack={handleGoBack}
										onDelete={handleDeleteClick}
									/>

									<VariantFields
										variantDetail={variantDetail}
										isLoading={isLoading}
									/>
								</Stack>
							</form>
						)}
					</FormFieldProvider>
				</FormStyleProvider>
			</Paper>

			<ConfirmModal
				opened={showSaveConfirm}
				onClose={() => setShowSaveConfirm(false)}
				onConfirm={handleConfirmSave}
				title={t('nikki.inventory.variant.actions.confirmUpdate')}
				message={t('nikki.inventory.variant.messages.confirmUpdateMessage')}
				confirmLabel={t('nikki.inventory.variant.actions.save')}
			/>

			<ConfirmModal
				opened={showDeleteConfirm}
				onClose={() => setShowDeleteConfirm(false)}
				onConfirm={handleConfirmDelete}
				title={t('nikki.inventory.variant.actions.confirmDelete')}
				message={t('nikki.inventory.variant.messages.confirmDeleteMessage')}
				confirmLabel={t('nikki.inventory.variant.actions.delete')}
				confirmColor='red'
			/>
		</>
	);
}
