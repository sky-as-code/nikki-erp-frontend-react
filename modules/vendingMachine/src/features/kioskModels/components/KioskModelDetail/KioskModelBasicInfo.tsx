import { Box, Divider, Stack, Text } from '@mantine/core';
import { FormFieldProvider, FormStyleProvider } from '@nikkierp/ui/components';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ArchiveKioskModelModal, DeleteKioskModelModal } from '@/features/kioskModels';
import { KioskModel } from '@/features/kioskModels/types';

import { KioskModelFormFields } from '../KioskModelFormFields/KioskModelFormFields';
import { useBasicInfoTab } from './hooks/useBasicInfoTab';


export interface KioskModelBasicInfoProps {
	model: KioskModel;
}

const KioskModelBasicInfoAuditDates: React.FC<{ model: KioskModel }> = ({ model }) => {
	const { t: translate } = useTranslation();
	return (
		<React.Fragment>
			<Divider my={3} />
			<Box>
				<Text size='sm' c='dimmed' mb={3}>
					{translate('nikki.vendingMachine.kioskModels.fields.createdAt')}
				</Text>
				<Text size='sm'>{new Date(model.createdAt).toLocaleString()}</Text>
			</Box>
		</React.Fragment>
	);
};

export const KioskModelBasicInfo: React.FC<KioskModelBasicInfoProps> = ({ model }) => {
	const {
		formId, isEditing, isSubmitting, modelSchema, onFormSubmit,
		closeDeleteModal, confirmDelete, isOpenDeleteModal,
		isOpenArchiveModal, pendingArchive, handleConfirmArchive, handleCloseArchiveModal,
	} = useBasicInfoTab({ model });

	return (
		<React.Fragment>
			<Stack gap='xs'>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider
						key={`${model.id}-${model.etag}-basic-info`}
						formVariant='update'
						modelSchema={modelSchema}
						modelValue={model}
						modelLoading={isEditing && isSubmitting}
					>
						{({ handleSubmit }) => (
							<>
								{isEditing && (
									<form
										id={formId}
										noValidate
										onSubmit={handleSubmit(onFormSubmit)}
										style={{ display: 'contents' }}
									/>
								)}
								<KioskModelFormFields mode={isEditing ? 'edit' : 'view'} />
							</>
						)}
					</FormFieldProvider>
				</FormStyleProvider>

				<KioskModelBasicInfoAuditDates model={model} />
			</Stack>

			<DeleteKioskModelModal
				opened={isOpenDeleteModal}
				onClose={closeDeleteModal}
				onConfirm={confirmDelete}
				name={model.name ?? ''}
			/>

			<ArchiveKioskModelModal
				opened={isOpenArchiveModal}
				onClose={handleCloseArchiveModal}
				onConfirm={handleConfirmArchive}
				type={pendingArchive?.targetArchived ? 'archive' : 'restore'}
				name={pendingArchive?.model?.name ?? ''}
			/>
		</React.Fragment>
	);
};
