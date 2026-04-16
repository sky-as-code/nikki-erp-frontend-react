import { Box, Divider, Stack, Text } from '@mantine/core';
import { FormFieldProvider, FormStyleProvider } from '@nikkierp/ui/components';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ArchivedStatusBadge } from '@/components/ArchivedStatusBadge';


import { PaymentDetailAuditDates } from './PaymentDetailAuditDates';
import { PaymentDetailConfigSection } from './PaymentDetailConfigSection';
import { PaymentDetailFormFields } from './PaymentDetailFormFields';
import { PaymentDetailHeader } from './PaymentDetailHeader';

import type { PaymentMethod } from '@/features/payment/types';
import type { PaymentConfigRow } from '@/features/payment/utils/paymentConfigRows';
import type { ModelSchema } from '@nikkierp/ui/model';


export type PaymentDetailInnerProps = {
	payment: PaymentMethod;
	formId: string;
	formResetNonce: number;
	isEditing: boolean;
	isSubmitting: boolean;
	modelSchema: ModelSchema;
	handleMergedSubmit: (data: Record<string, unknown>) => void;
	configRows: PaymentConfigRow[];
	onConfigRowsChange: (rows: PaymentConfigRow[]) => void;
};

export const PaymentDetailInner: React.FC<PaymentDetailInnerProps> = ({
	payment,
	formId,
	formResetNonce,
	isEditing,
	isSubmitting,
	modelSchema,
	handleMergedSubmit,
	configRows,
	onConfigRowsChange,
}) => {
	const { t } = useTranslation();

	return (
		<Stack gap='md'>
			<PaymentDetailHeader payment={payment} />

			<FormStyleProvider layout='onecol'>
				<FormFieldProvider
					key={`${payment.id}-${payment.etag}-detail-${formResetNonce}`}
					formVariant='update'
					modelSchema={modelSchema}
					modelValue={payment}
					modelLoading={isEditing && isSubmitting}
				>
					{({ handleSubmit }) => (
						<>
							{isEditing && (
								<form
									id={formId}
									noValidate
									onSubmit={handleSubmit(handleMergedSubmit)}
									style={{ display: 'contents' }}
								/>
							)}
							<PaymentDetailFormFields mode={isEditing ? 'edit' : 'view'} />
						</>
					)}
				</FormFieldProvider>
			</FormStyleProvider>

			<Divider />

			<Box>
				<Text size='sm' c='dimmed' mb={3} fw={500}>
					{t('nikki.vendingMachine.payment.fields.status')}
				</Text>
				<ArchivedStatusBadge isArchived={payment.isArchived} />
			</Box>

			<Divider />

			<PaymentDetailConfigSection
				mode={isEditing ? 'edit' : 'view'}
				config={payment.config}
				configRows={configRows}
				onConfigRowsChange={onConfigRowsChange}
			/>

			<PaymentDetailAuditDates payment={payment} />
		</Stack>
	);
};
