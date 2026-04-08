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
				<Text size='sm'>{new Date(kiosk.createdAt).toLocaleString()}</Text>
			</Box>
		</React.Fragment>
	);
};

export const KioskBasicInfo: React.FC<KioskBasicInfoProps> = ({ kiosk }) => {
	const { t } = useTranslation();

	const { formId, isEditing, isSubmitting, modelSchema, modelValue, onFormSubmit,
		closeDeleteModal, confirmDelete, isOpenDeleteModal } = useBasicInfoTab({ kiosk });


	return (
		<React.Fragment>
			<Stack gap='xs'>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider
						key={`${kiosk.id}-${kiosk.etag}-basic-info`}
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
								<KioskFormFields mode={isEditing ? 'edit' : 'view'} />
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

		</React.Fragment>
	);
};
