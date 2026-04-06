import { Box, Divider, Stack, Text } from '@mantine/core';
import { ConfirmModal, FormFieldProvider, FormStyleProvider } from '@nikkierp/ui/components';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Setting } from '@/features/settings/types';

import { SettingFormFields } from '../SettingFormFields/SettingFormFields';

import type { SettingFormProps } from './hooks/types';


export interface SettingBasicInfoProps {
	setting: Setting;
	formProps: SettingFormProps;
}

const SettingBasicInfoAuditDates: React.FC<{ setting: Setting }> = ({ setting }) => {
	const { t: translate } = useTranslation();
	return (
		<React.Fragment>
			<Divider my={3} />
			<Box>
				<Text size='sm' c='dimmed' mb={3}>
					{translate('nikki.vendingMachine.settings.fields.createdAt')}
				</Text>
				<Text size='sm'>{new Date(setting.createdAt).toLocaleString()}</Text>
			</Box>
		</React.Fragment>
	);
};

export const SettingBasicInfo: React.FC<SettingBasicInfoProps> = ({ setting, formProps }) => {
	const { t } = useTranslation();
	const {
		formId, isEditing, isSubmitting, modelSchema, modelValue, onFormSubmit,
		closeDeleteModal, confirmDelete, isOpenDeleteModal,
	} = formProps;

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
								<SettingFormFields mode={isEditing ? 'edit' : 'view'} />
							</>
						)}
					</FormFieldProvider>
				</FormStyleProvider>

				<SettingBasicInfoAuditDates setting={setting} />
			</Stack>

			<ConfirmModal
				title={t('nikki.general.messages.delete_confirm')}
				opened={isOpenDeleteModal}
				onClose={closeDeleteModal}
				onConfirm={confirmDelete}
				message={<Trans i18nKey='nikki.vendingMachine.settings.messages.delete_confirm'
					values={{ name: setting?.name || '' }}
					components={{ strong: <strong /> }}
				/>}
				confirmLabel={t('nikki.general.actions.delete')}
				confirmColor='red'
			/>
		</React.Fragment>
	);
};
