import { Paper, Stack, TextInput, Text } from '@mantine/core';
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


interface GroupFieldsProps {
	groupDetail: any;
	isLoading: boolean;
}

function GroupFields({ groupDetail, isLoading }: GroupFieldsProps) {
	const { t } = useTranslation();

	return (
		<Stack gap='md'>
			<AutoField name='name' autoFocused inputProps={{ size: 'lg', disabled: isLoading }} />
			<AutoField name='description' inputProps={{ disabled: isLoading }} />
			<div>
				<Text size='sm' fw={500} mb='xs'>
					{t('nikki.identity.group.fields.createdAt')}
				</Text>
				<TextInput
					value={
						groupDetail?.createdAt
							? new Date(groupDetail.createdAt).toLocaleString()
							: ''
					}
					size='md'
					variant='filled'
					readOnly
				/>
			</div>
			<div>
				<Text size='sm' fw={500} mb='xs'>
					{t('nikki.identity.group.fields.updatedAt')}
				</Text>
				<TextInput
					value={
						groupDetail?.updatedAt
							? new Date(groupDetail.updatedAt).toLocaleString()
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

type GroupSchema = {
	name: string;
	fields: Record<string, FieldDefinition>;
	constraints?: FieldConstraint[];
};

interface GroupDetailFormProps {
	schema: GroupSchema;
	groupDetail: any;
	isLoading: boolean;
	onSubmit: (data: any) => void;
	onDelete: () => void;
}

export function GroupDetailForm({ schema, groupDetail, isLoading,
	onSubmit, onDelete }: GroupDetailFormProps): React.ReactElement {
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
						modelValue={groupDetail}
						modelLoading={isLoading}
					>
						{({ handleSubmit, form }) => (
							<form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
								<Stack gap='md'>
									<ListActionDetailPage
										onDelete={onDelete}
										isLoading={isLoading}
										disableSave={!form.formState.isDirty}
										titleDelete={t('nikki.identity.group.actions.confirmDelete')}
										titleConfirmDelete={t('nikki.identity.group.actions.delete')}
										messageConfirmDelete={t('nikki.identity.group.messages.confirmDeleteMessage')}
									/>

									<GroupFields
										groupDetail={groupDetail}
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
				title={t('nikki.identity.group.actions.confirmUpdate')}
				message={t('nikki.identity.group.messages.confirmUpdateMessage')}
				confirmLabel={t('nikki.identity.group.actions.save')}
			/>
		</>
	);
}
