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
import { ConfirmModal } from 'node_modules/@nikkierp/ui/src/components/Modal/ConfirmModal';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ListActionDetailPage } from '../../../../components/ListActionBar';


interface OrganizationFieldsProps {
	organizationDetail: any;
	isLoading: boolean;
}

function OrganizationFields({
	organizationDetail,
	isLoading,
}: OrganizationFieldsProps) {
	const { t } = useTranslation();

	return (
		<Stack gap='md'>
			<div>
				<Text size='sm' fw={500} mb='xs'>
					{t('nikki.identity.organization.fields.slug')}
				</Text>
				<TextInput
					value={organizationDetail?.slug || ''}
					size='md'
					variant='filled'
					readOnly
				/>
			</div>
			<AutoField name='displayName' inputProps={{ disabled: isLoading }} />
			<AutoField name='legalName' inputProps={{ disabled: isLoading }} />
			<AutoField name='phoneNumber' inputProps={{ disabled: isLoading }} />
			<AutoField name='address' inputProps={{ disabled: isLoading }} />
			<AutoField name='status' inputProps={{ disabled: isLoading }} />
			<div>
				<Text size='sm' fw={500} mb='xs'>
					{t('nikki.identity.organization.fields.createdAt')}
				</Text>
				<TextInput
					value={
						organizationDetail?.createdAt
							? new Date(organizationDetail.createdAt).toLocaleString()
							: ''
					}
					size='md'
					variant='filled'
					readOnly
				/>
			</div>
			<div>
				<Text size='sm' fw={500} mb='xs'>
					{t('nikki.identity.organization.fields.updatedAt')}
				</Text>
				<TextInput
					value={
						organizationDetail?.updatedAt
							? new Date(organizationDetail.updatedAt).toLocaleString()
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

type OrganizationSchema = {
	name: string;
	fields: Record<string, FieldDefinition>;
	constraints?: FieldConstraint[];
};

interface OrganizationDetailFormProps {
	schema: OrganizationSchema;
	organizationDetail: any;
	isLoading: boolean;
	onSubmit: (data: any) => void;
	onDelete: () => void;
}

export function OrganizationDetailForm({
	schema,
	organizationDetail,
	isLoading,
	onSubmit,
	onDelete,
}: OrganizationDetailFormProps): React.ReactElement {
	const { t } = useTranslation();
	const [showSaveConfirm, setShowSaveConfirm] = React.useState(false);
	const [pendingData, setPendingData] = React.useState<any>(null);

	const handleFormSubmit = (data: any) => {
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

	return (
		<>
			<Paper withBorder p='xl'>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider
						formVariant='update'
						modelSchema={schema}
						modelValue={organizationDetail}
					>
						{({ handleSubmit, form }) => (
							<form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
								<Stack gap='xl'>
									<ListActionDetailPage
										onDelete={onDelete}
										isLoading={isLoading}
										disableSave={!form.formState.isDirty}
										titleDelete={t('nikki.identity.organization.actions.confirmDelete')}
										titleConfirmDelete={t('nikki.identity.organization.actions.delete')}
										messageConfirmDelete={t('nikki.identity.organization.messages.confirmDeleteMessage')}
									/>
									<OrganizationFields
										organizationDetail={organizationDetail}
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
				title={t('nikki.identity.organization.actions.confirmUpdate')}
				message={t('nikki.identity.organization.messages.confirmUpdateMessage')}
				confirmLabel={t('nikki.identity.organization.actions.save')}
			/>
		</>
	);
}
