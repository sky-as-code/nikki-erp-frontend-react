import { Box, Divider, Stack, Text } from '@mantine/core';
import { ConfirmModal, FormFieldProvider, FormStyleProvider } from '@nikkierp/ui/components';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { KioskSetting } from '../../types';
import { KioskSettingFormFields } from '../KioskSettingFormFields';
import { useKioskSettingBasicInfoTab } from './hooks/useKioskSettingBasicInfoTab';


export interface KioskSettingDetailBasicInfoProps {
	setting: KioskSetting;
}

const KioskSettingBasicInfoAuditDates: React.FC<{ setting: KioskSetting }> = ({ setting }) => {
	const { t: translate } = useTranslation();
	return (
		<React.Fragment>
			<Divider my={3} />
			<Box>
				<Text size='sm' c='dimmed' mb={3}>
					{translate('nikki.vendingMachine.kioskSettings.fields.createdAt')}
				</Text>
				<Text size='sm'>{new Date(setting.createdAt).toLocaleString()}</Text>
			</Box>
		</React.Fragment>
	);
};

export const KioskSettingDetailBasicInfo: React.FC<KioskSettingDetailBasicInfoProps> = ({ setting }) => {
	const { t } = useTranslation();

	const {
		formId,
		isEditing,
		isSubmitting,
		modelSchema,
		modelValue,
		onFormSubmit,
		closeDeleteModal,
		confirmDelete,
		isOpenDeleteModal,
	} = useKioskSettingBasicInfoTab({ setting });

	return (
		<React.Fragment>
			<Stack gap='xs'>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider
						key={`${setting.id}-${setting.etag}-basic-info`}
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
								<KioskSettingFormFields mode={isEditing ? 'edit' : 'view'} />
							</>
						)}
					</FormFieldProvider>
				</FormStyleProvider>

				<KioskSettingBasicInfoAuditDates setting={setting} />
			</Stack>

			<ConfirmModal
				title={t('nikki.general.messages.delete_confirm')}
				opened={isOpenDeleteModal}
				onClose={closeDeleteModal}
				onConfirm={confirmDelete}
				message={t('nikki.general.messages.delete_confirm_name', { name: setting?.name || '' })}
				confirmLabel={t('nikki.general.actions.delete')}
				confirmColor='red'
			/>

		</React.Fragment>
	);
};
