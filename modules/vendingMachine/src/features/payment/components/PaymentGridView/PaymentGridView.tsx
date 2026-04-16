import { Box, Card, Group, Image, SimpleGrid, Stack, Text } from '@mantine/core';
import { TablePaginationProps } from '@nikkierp/ui/components';
import { IconCreditCard } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { PaymentMethod } from '../../types';
import { getPaymentTableActions, PaymentTableActions } from '../PaymentTable';

import { ArchivedStatusBadge } from '@/components/ArchivedStatusBadge';
import { TableAction } from '@/components/Table';



export interface PaymentGridViewProps {
	payments: PaymentMethod[];
	isLoading?: boolean;
	actions?: PaymentTableActions;
	pagination?: TablePaginationProps;
}

export const PaymentGridView: React.FC<PaymentGridViewProps> = ({
	payments,
	isLoading = false,
	actions = {},
}) => {
	const { t: translate } = useTranslation();
	const { view: onViewDetail, ...cardActions } = actions;

	if (isLoading) {
		return <Text c='dimmed'>{translate('nikki.general.messages.loading')}</Text>;
	}

	if (payments.length === 0) {
		return <Text c='dimmed'>{translate('nikki.vendingMachine.payment.messages.no_payments')}</Text>;
	}

	return (
		<SimpleGrid
			cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
			spacing={{ base: 'sm', sm: 'md', lg: 'lg' }}
		>
			{payments.map((payment) => (
				<Card
					key={payment.id}
					shadow='sm'
					padding='lg'
					radius='md'
					withBorder
					style={{ cursor: 'pointer' }}
					onClick={() => onViewDetail?.(payment)}
				>
					<Stack gap='sm'>
						<Group justify='space-between' align='flex-start'>
							<Group gap='xs'>
								{payment.image ? (
									<Box w={48} h={48}>
										<Image
											src={payment.image as string}
											alt={String(payment.name || '')}
											width={48}
											height={48}
											radius='sm'
											style={{ objectFit: 'contain' }}
										/>
									</Box>
								) : (
									<IconCreditCard size={36} stroke={1.5} />
								)}
								<Stack gap={0}>
									<Text fw={600} size='sm'>{payment.method}</Text>
									<Text size='xs' c='dimmed'>{payment.name}</Text>
								</Stack>
							</Group>
							<TableAction
								actions={getPaymentTableActions(payment, cardActions, translate)}
								overflowMenuLabel={translate('nikki.general.actions.title')}
							/>
						</Group>

						<Group gap='xs' wrap='nowrap'>
							<ArchivedStatusBadge isArchived={payment.isArchived} />
						</Group>

						<Text size='xs' c='dimmed'>
							{translate('nikki.vendingMachine.payment.fields.createdAt')}: {new Date(payment.createdAt).toLocaleDateString()}
						</Text>
					</Stack>
				</Card>
			))}
		</SimpleGrid>
	);
};
