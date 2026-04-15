import { Box, Group, Image, Text } from '@mantine/core';
import { IconCreditCard } from '@tabler/icons-react';
import React from 'react';

import { PaymentMethod } from '@/features/payment/types';


export interface PaymentDetailHeaderProps {
	payment: PaymentMethod;
}

export const PaymentDetailHeader: React.FC<PaymentDetailHeaderProps> = ({ payment }) => {
	return (
		<Group gap='xs' mb='md'>
			{payment.image ? (
				<Box w={64} h={64}>
					<Image
						src={payment.image}
						alt={String(payment.name || '')}
						width={64}
						height={64}
						radius='sm'
						style={{ objectFit: 'contain' }}
					/>
				</Box>
			) : (
				<IconCreditCard size={26} stroke={1.5} />
			)}
			<Text fw={600} size='lg'>{payment.name}</Text>
		</Group>
	);
};
