import { Box, Divider, Stack, Text } from '@mantine/core';
import { ConfirmModal, FormFieldProvider, FormStyleProvider } from '@nikkierp/ui/components';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';


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
	const { t } = useTranslation();
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

			<ConfirmModal
				title={t('nikki.general.messages.delete_confirm')}
				opened={isOpenDeleteModal}
				onClose={closeDeleteModal}
				onConfirm={confirmDelete}
				message={<Trans i18nKey='nikki.vendingMachine.kioskModels.messages.delete_confirm'
					values={{ name: model?.name || '' }}
					components={{ strong: <strong /> }}
				/>}
				confirmLabel={t('nikki.general.actions.delete')}
				confirmColor='red'
			/>

			<ConfirmModal
				opened={isOpenArchiveModal}
				onClose={handleCloseArchiveModal}
				onConfirm={handleConfirmArchive}
				title={pendingArchive?.targetArchived
					? t('nikki.vendingMachine.kioskModels.messages.archive_modal_title')
					: t('nikki.vendingMachine.kioskModels.messages.restore_modal_title')}
				message={
					<Trans
						i18nKey={pendingArchive?.targetArchived
							? 'nikki.vendingMachine.kioskModels.messages.archive_confirm'
							: 'nikki.vendingMachine.kioskModels.messages.restore_confirm'}
						values={{ name: pendingArchive?.model?.name || '' }}
						components={{ strong: <strong /> }}
					/>
				}
				confirmLabel={pendingArchive?.targetArchived
					? t('nikki.general.actions.archive')
					: t('nikki.general.actions.restore')}
				confirmColor={pendingArchive?.targetArchived ? 'orange' : 'blue'}
			/>
		</React.Fragment>
	);
};
