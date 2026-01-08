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


interface HierarchyFieldsProps {
	hierarchyDetail: any;
	isLoading: boolean;
}

function HierarchyFields({ hierarchyDetail, isLoading }: HierarchyFieldsProps) {
	const { t } = useTranslation();

	return (
		<Stack gap='md'>
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
					value={
						hierarchyDetail?.createdAt
							? new Date(hierarchyDetail.createdAt).toLocaleString()
							: ''
					}
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
					value={
						hierarchyDetail?.updatedAt
							? new Date(hierarchyDetail.updatedAt).toLocaleString()
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
			<Paper className='p-4'>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider
						formVariant='update'
						modelSchema={schema}
						modelValue={hierarchyDetail}
						modelLoading={isLoading}
					>
						{({ handleSubmit, form }) => (
							<form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
								<Stack gap='md'>
									<ListActionDetailPage
										onDelete={onDelete}
										isLoading={isLoading}
										disableSave={!form.formState.isDirty}
										titleDelete={t('nikki.identity.hierarchy.actions.confirmDelete')}
										titleConfirmDelete={t('nikki.identity.hierarchy.actions.delete')}
										messageConfirmDelete={t('nikki.identity.hierarchy.messages.confirmDeleteMessage')}
									/>
									<HierarchyFields
										hierarchyDetail={hierarchyDetail}
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
				title={t('nikki.identity.hierarchy.actions.confirmUpdate')}
				message={t('nikki.identity.hierarchy.messages.confirmUpdateMessage')}
				confirmLabel={t('nikki.identity.hierarchy.actions.save')}
			/>
		</>
	);
}
