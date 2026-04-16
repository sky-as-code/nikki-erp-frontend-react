import { Box, Divider, Stack, Text } from '@mantine/core';
import { FormFieldProvider, FormStyleProvider } from '@nikkierp/ui/components';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ArchiveKioskModal, DeleteKioskModal  } from '@/features/kiosks';
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

			<DeleteKioskModal
				opened={isOpenDeleteModal}
				onClose={closeDeleteModal}
				onConfirm={confirmDelete}
				name={kiosk.name || ''}
			/>

			<ArchiveKioskModal
				opened={isOpenArchiveModal}
				onClose={handleCloseArchiveModal}
				onConfirm={handleConfirmArchive}
				type={pendingArchive?.targetArchived ? 'archive' : 'restore'}
				name={pendingArchive?.kiosk?.name ?? ''}
			/>

		</React.Fragment>
	);
};
