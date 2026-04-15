import { Box, Divider, Stack, Text } from '@mantine/core';
import { ConfirmModal, FormFieldProvider, FormStyleProvider } from '@nikkierp/ui/components';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';


import { Kiosk } from '@/features/kiosks/types';

import { KioskFormFields } from '../KioskFormFields/KioskFormFields';
import { useBasicInfoTab } from './hooks/useBasicInfoTab';



export interface KioskBasicInfoProps {
	kiosk: Kiosk;
}

const KioskBasicInfoAuditDates: React.FC<{ kiosk: Kiosk }> = ({ kiosk }) => {
	const { t: translate } = useTranslation();
	return (
		<React.Fragment>
			<Divider my={3} />
			<Box>
				<Text size='sm' c='dimmed' mb={3}>
					{translate('nikki.vendingMachine.kiosk.fields.createdAt')}
				</Text>
				<Text size='sm'>{kiosk.createdAt ? new Date(kiosk.createdAt).toLocaleString() : '—'	}</Text>
			</Box>
		</React.Fragment>
	);
};

export const KioskBasicInfo: React.FC<KioskBasicInfoProps> = ({ kiosk }) => {
	const { t } = useTranslation();

	const {
		formId, isEditing, isSubmitting, modelSchema, formValues, onFormSubmit,
		closeDeleteModal, confirmDelete, isOpenDeleteModal,
		isOpenArchiveModal, pendingArchive, handleConfirmArchive, handleCloseArchiveModal,
	} = useBasicInfoTab({ kiosk });

	return (
		<React.Fragment>
			<Stack gap='xs'>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider
						key={`${kiosk.id}-${kiosk.etag}-basic-info`}
						formVariant='update'
						modelSchema={modelSchema}
						modelValue={formValues}
						modelLoading={isEditing && isSubmitting}
					>
						{({ handleSubmit }) => (
							<>
								<form
									id={formId}
									onSubmit={isEditing ? handleSubmit(onFormSubmit) : undefined}
									noValidate
									style={{ display: 'contents' }}
								>
									<KioskFormFields mode={isEditing ? 'edit' : 'view'} kiosk={kiosk} isSubmitting={isSubmitting} />
								</form>
							</>
						)}
					</FormFieldProvider>
				</FormStyleProvider>

				<KioskBasicInfoAuditDates kiosk={kiosk} />
			</Stack>

			<ConfirmModal
				title={t('nikki.general.messages.delete_confirm')}
				opened={isOpenDeleteModal}
				onClose={closeDeleteModal}
				onConfirm={confirmDelete}
				message={<Trans i18nKey='nikki.vendingMachine.kiosk.messages.delete_confirm'
					values={{ name: kiosk?.name || '' }}
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
					? t('nikki.vendingMachine.kiosk.messages.archive_modal_title')
					: t('nikki.vendingMachine.kiosk.messages.restore_modal_title')}
				message={
					<Trans
						i18nKey={pendingArchive?.targetArchived
							? 'nikki.vendingMachine.kiosk.messages.archive_confirm'
							: 'nikki.vendingMachine.kiosk.messages.restore_confirm'}
						values={{ name: pendingArchive?.kiosk?.name || '' }}
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
