import { Box, Divider, Stack, Text } from '@mantine/core';
import { ConfirmModal, FormFieldProvider, FormStyleProvider } from '@nikkierp/ui/components';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { KioskDevice } from '@/features/kioskDevices/types';

import { KioskDeviceFormFields } from '../KioskDeviceFormFields/KioskDeviceFormFields';
import { useBasicInfoTab } from './hooks/useBasicInfoTab';


export interface KioskDeviceBasicInfoProps {
	kioskDevice: KioskDevice;
}

const KioskDeviceBasicInfoAuditDates: React.FC<{ kioskDevice: KioskDevice }> = ({ kioskDevice }) => {
	const { t: translate } = useTranslation();
	return (
		<React.Fragment>
			<Divider my={3} />
			<Box>
				<Text size='sm' c='dimmed' mb={3}>
					{translate('nikki.vendingMachine.device.fields.createdAt')}
				</Text>
				<Text size='sm'>{new Date(kioskDevice.createdAt).toLocaleString()}</Text>
			</Box>
		</React.Fragment>
	);
};

export const KioskDeviceBasicInfo: React.FC<KioskDeviceBasicInfoProps> = ({ kioskDevice }) => {
	const { t } = useTranslation();

	const {
		formId, isEditing, isSubmitting, modelSchema, modelValue, onFormSubmit,
		closeDeleteModal, confirmDelete, isOpenDeleteModal,
	} = useBasicInfoTab({ kioskDevice });

	return (
		<React.Fragment>
			<Stack gap='xs'>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider
						key={`${kioskDevice.id}-${kioskDevice.etag}-basic-info`}
						formVariant='update'
						modelSchema={modelSchema}
						modelValue={modelValue}
						modelLoading={isEditing && isSubmitting}
					>
						{({ handleSubmit }) => (
							<>
								{isEditing && (
									<form
										id={formId}
										onSubmit={handleSubmit(onFormSubmit)}
										noValidate
										style={{ display: 'contents' }}
									/>
								)}
								<KioskDeviceFormFields mode={isEditing ? 'edit' : 'view'} />
							</>
						)}
					</FormFieldProvider>
				</FormStyleProvider>

				<KioskDeviceBasicInfoAuditDates kioskDevice={kioskDevice} />
			</Stack>

			<ConfirmModal
				title={t('nikki.general.messages.delete_confirm')}
				opened={isOpenDeleteModal}
				onClose={closeDeleteModal}
				onConfirm={confirmDelete}
				message={<Trans i18nKey='nikki.vendingMachine.device.messages.delete_confirm'
					values={{ name: kioskDevice?.name || '' }}
					components={{ strong: <strong /> }}
				/>}
				confirmLabel={t('nikki.general.actions.delete')}
				confirmColor='red'
			/>
		</React.Fragment>
	);
};
