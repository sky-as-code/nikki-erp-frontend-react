/* eslint-disable max-lines-per-function */
import { ActionIcon, Box, Card, Group, Image, SimpleGrid, Stack, Text, Tooltip } from '@mantine/core';
import { IconArchive, IconArchiveOff, IconCreditCard, IconEdit, IconTrash } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ArchivedStatusBadge } from '@/components/ArchivedStatusBadge';

import { PaymentMethod } from '../../types';


export interface PaymentGridViewProps {
	payments: PaymentMethod[];
	isLoading?: boolean;
	onViewDetail: (payment: PaymentMethod) => void;
	onEdit?: (payment: PaymentMethod) => void;
	onDelete?: (payment: PaymentMethod) => void;
	onArchive?: (payment: PaymentMethod) => void;
	onRestore?: (payment: PaymentMethod) => void;
}

export const PaymentGridView: React.FC<PaymentGridViewProps> = ({
	payments,
	isLoading = false,
	onViewDetail,
	onEdit,
	onDelete,
	onArchive,
	onRestore,
}) => {
	const { t: translate } = useTranslation();

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
					onClick={() => onViewDetail(payment)}
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
							<Group gap='xs' onClick={(e) => e.stopPropagation()}>
								{onEdit && (
									<Tooltip label={translate('nikki.general.actions.edit')}>
										<ActionIcon variant='subtle' color='gray' size='sm' onClick={() => onEdit(payment)}>
											<IconEdit size={14} />
										</ActionIcon>
									</Tooltip>
								)}
								{!payment.isArchived && onArchive && (
									<Tooltip label={translate('nikki.general.actions.archive')}>
										<ActionIcon variant='subtle' color='orange' size='sm' onClick={() => onArchive(payment)}>
											<IconArchive size={14} />
										</ActionIcon>
									</Tooltip>
								)}
								{payment.isArchived && onRestore && (
									<Tooltip label={translate('nikki.general.actions.restore')}>
										<ActionIcon variant='subtle' color='blue' size='sm' onClick={() => onRestore(payment)}>
											<IconArchiveOff size={14} />
										</ActionIcon>
									</Tooltip>
								)}
								{onDelete && (
									<Tooltip label={translate('nikki.general.actions.delete')}>
										<ActionIcon variant='subtle' color='red' size='sm' onClick={() => onDelete(payment)}>
											<IconTrash size={14} />
										</ActionIcon>
									</Tooltip>
								)}
							</Group>
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
