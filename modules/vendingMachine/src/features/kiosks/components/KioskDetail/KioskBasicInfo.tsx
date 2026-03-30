import { Box, Divider, Stack, Text } from '@mantine/core';
import { FormFieldProvider, FormStyleProvider } from '@nikkierp/ui/components';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { kioskToCreateFormValues } from '@/features/kiosks/hooks/useKioskCreate';
import { Kiosk } from '@/features/kiosks/types';

import { KioskFormFields } from '../KioskFormFields/KioskFormFields';

import type { BasicInfoTabState } from './hooks/types';


export interface KioskBasicInfoProps {
	kiosk: Kiosk;
	tabState: BasicInfoTabState;
}

export const KioskBasicInfo: React.FC<KioskBasicInfoProps> = ({ kiosk, tabState }) => {
	const { isEditing, formId, modelSchema, isSubmitting, onFormSubmit } = tabState;

	const { t: translate } = useTranslation();

	const formModelValue = useMemo(
		() => kioskToCreateFormValues(kiosk),
		[kiosk.id, kiosk.etag],
	);

	return (
		<Stack gap='xs'>
			<FormStyleProvider layout='onecol'>
				<FormFieldProvider
					key={`${kiosk.id}-${kiosk.etag}-basic-info`}
					formVariant='update'
					modelSchema={modelSchema}
					modelValue={formModelValue}
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
		</Stack>
	);
};
