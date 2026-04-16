import { Box, Divider, Text } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { PaymentMethod } from '@/features/payment/types';


export interface PaymentDetailAuditDatesProps {
	payment: PaymentMethod;
}

export const PaymentDetailAuditDates: React.FC<PaymentDetailAuditDatesProps> = ({ payment }) => {
	const { t: translate } = useTranslation();

	return (
		<>
			<Divider my={3} />
			<Box>
				<Text size='sm' c='dimmed' mb={3}>
					{translate('nikki.vendingMachine.payment.fields.createdAt')}
				</Text>
				<Text size='sm'>{new Date(payment.createdAt).toLocaleString()}</Text>
			</Box>
		</>
	);
};
