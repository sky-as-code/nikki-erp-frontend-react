import { Box, Divider, Stack, Text } from '@mantine/core';
import { FormFieldProvider, FormStyleProvider } from '@nikkierp/ui/components';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Kiosk } from '@/features/kiosks/types';

import { KioskFormFields } from '../KioskFormFields/KioskFormFields';
import { useBasicInfoTab } from './hooks/useBasicInfoTab';


export interface KioskBasicInfoProps {
	kiosk: Kiosk;
	/** Mở modal xóa kiosk (nút Delete trên control panel). */
	onOpenDeleteKiosk?: (kiosk: Kiosk) => void;
}

const KioskBasicInfoAuditDates: React.FC<{ kiosk: Kiosk }> = ({ kiosk }) => {
	const { t: translate } = useTranslation();
	return (
		<>
			<Divider my={3} />

			<Box>
				<Text size='sm' c='dimmed' mb={3}>
					{translate('nikki.vendingMachine.kiosk.fields.createdAt')}
				</Text>
				<Text size='sm'>{new Date(kiosk.createdAt).toLocaleString()}</Text>
			</Box>

			{kiosk.deletedAt && (
				<Box>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.kiosk.fields.deletedAt')}
					</Text>
					<Text size='sm'>{new Date(kiosk.deletedAt).toLocaleString()}</Text>
				</Box>
			)}
		</>
	);
};

export const KioskBasicInfo: React.FC<KioskBasicInfoProps> = ({ kiosk, onOpenDeleteKiosk }) => {
	const {
		formId,
		isEditing,
		isSubmitting,
		modelSchema,
		modelValue,
		onFormSubmit,
	} = useBasicInfoTab({ kiosk, onOpenDeleteKiosk });

	return (
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
	);
};
