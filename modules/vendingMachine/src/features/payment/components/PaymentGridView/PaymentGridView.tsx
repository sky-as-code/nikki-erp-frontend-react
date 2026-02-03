/* eslint-disable max-lines-per-function */
import { ActionIcon, Badge, Box, Card, Group, Image, SimpleGrid, Stack, Text, Tooltip } from '@mantine/core';
import { IconCreditCard, IconEdit, IconTrash } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { PaymentMethod } from '../../types';


export interface PaymentGridViewProps {
	payments: PaymentMethod[];
	isLoading?: boolean;
	onViewDetail: (paymentId: string) => void;
	onEdit?: (paymentId: string) => void;
	onDelete?: (paymentId: string) => void;
}

export const PaymentGridView: React.FC<PaymentGridViewProps> = ({
	payments,
	isLoading = false,
	onViewDetail,
	onEdit,
	onDelete,
}) => {
	const { t: translate } = useTranslation();

	const getStatusBadge = (status: 'active' | 'inactive') => {
		const statusMap = {
			active: { color: 'green', label: translate('nikki.general.status.active') },
			inactive: { color: 'gray', label: translate('nikki.general.status.inactive') },
		};
		const statusInfo = statusMap[status];
		return <Badge color={statusInfo.color} size='sm'>{statusInfo.label}</Badge>;
	};

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
	};

	const stripHtml = (html: string) => {
		return html.replace(/<[^>]*>/g, '').substring(0, 100);
	};

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
					style={{
						cursor: 'pointer',
					}}
					onClick={() => onViewDetail(payment.id)}
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
									<Text fw={600} size='sm'>{payment.code}</Text>
									<Text size='xs' c='dimmed'>{payment.name}</Text>
								</Stack>
							</Group>
							<Group gap='xs' onClick={(e) => e.stopPropagation()}>
								{onEdit && (
									<Tooltip label={translate('nikki.general.actions.edit')}>
										<ActionIcon variant='subtle' color='gray' size='sm' onClick={() => onEdit(payment.id)}>
											<IconEdit size={14} />
										</ActionIcon>
									</Tooltip>
								)}
								{onDelete && (
									<Tooltip label={translate('nikki.general.actions.delete')}>
										<ActionIcon variant='subtle' color='red' size='sm' onClick={() => onDelete(payment.id)}>
											<IconTrash size={14} />
										</ActionIcon>
									</Tooltip>
								)}
							</Group>
						</Group>

						{payment.description && (
							<Text size='xs' c='dimmed' lineClamp={3}>
								{stripHtml(payment.description)}
							</Text>
						)}

						<Group gap='xs' wrap='nowrap'>
							{getStatusBadge(payment.status)}
						</Group>

						{(payment.minTransactionValue !== undefined || payment.maxTransactionValue !== undefined) && (
							<Text size='xs' c='dimmed'>
								{payment.minTransactionValue !== undefined
									? formatCurrency(payment.minTransactionValue)
									: '0'} - {payment.maxTransactionValue !== undefined
									? formatCurrency(payment.maxTransactionValue)
									: '∞'}
							</Text>
						)}

						{payment.customFields.length > 0 && (
							<Text size='xs' c='dimmed'>
								{translate('nikki.vendingMachine.payment.fields.customFields')}: {payment.customFields.length}
							</Text>
						)}

						<Text size='xs' c='dimmed'>
							{translate('nikki.vendingMachine.payment.fields.createdAt')}: {new Date(payment.createdAt).toLocaleDateString()}
						</Text>
					</Stack>
				</Card>
			))}
		</SimpleGrid>
	);
};
