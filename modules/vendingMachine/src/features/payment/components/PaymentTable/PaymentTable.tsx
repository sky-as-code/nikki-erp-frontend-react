import { ActionIcon, Box, Group, Image, Text, Tooltip } from '@mantine/core';
import { AutoTable, AutoTableProps } from '@nikkierp/ui/components';
import { IconArchive, IconArchiveOff, IconCreditCard, IconEdit, IconEye, IconTrash } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { ArchivedStatusBadge } from '@/components/ArchivedStatusBadge';

import { PaymentMethod } from '../../types';


export interface PaymentTableProps extends AutoTableProps {
	onViewDetail: (payment: PaymentMethod) => void;
	onEdit?: (payment: PaymentMethod) => void;
	onDelete?: (payment: PaymentMethod) => void;
	onArchive?: (payment: PaymentMethod) => void;
	onRestore?: (payment: PaymentMethod) => void;
}

function renderMethodColumn(row: Record<string, unknown>) {
	return <Text fw={500}>{String(row.method || '')}</Text>;
}

const NameColumn: React.FC<{ row: Record<string, unknown> }> = ({ row }) => {
	const navigate = useNavigate();
	const paymentId = row.id as string;
	const name = String(row.name || '');

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (paymentId) {
			navigate(`../payment/${paymentId}`);
		}
	};

	return (
		<Group gap='xs' align='center' justify='flex-start'>
			{row.image ? (
				<Box w={32} h={32}>
					<Image
						src={row.image as string}
						alt={String(row.name || '')}
						width={32}
						height={32}
						radius='sm'
						style={{ objectFit: 'contain' }}
					/>
				</Box>
			)
				: (
					<IconCreditCard size={26} stroke={1.5} />
				)}
			<Text
				c='light-dark(var(--mantine-color-blue-8), var(--mantine-color-blue-2))'
				style={{ cursor: 'pointer' }}
				onClick={handleClick}
				td='underline'
			>
				{name}
			</Text>
		</Group>
	);
};

function renderNameColumn(row: Record<string, unknown>) {
	return <NameColumn row={row} />;
}


function renderArchivedColumn(row: Record<string, unknown>) {
	return <ArchivedStatusBadge isArchived={Boolean(row.isArchived)} />;
}

function renderTransactionRangeColumn(row: Record<string, unknown>) {
	const min = row.minTransactionValue as number | undefined;
	const max = row.maxTransactionValue as number | undefined;
	if (min === undefined && max === undefined) {
		return <Text c='dimmed'>-</Text>;
	}
	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
	};
	return (
		<Text size='sm'>
			{min !== undefined ? formatCurrency(min) : '0'} - {max !== undefined ? formatCurrency(max) : '∞'}
		</Text>
	);
}

function renderActionsColumn(
	row: Record<string, unknown>,
	handlers: {
		onView?: (payment: PaymentMethod) => void,
		onEdit?: (payment: PaymentMethod) => void,
		onDelete?: (payment: PaymentMethod) => void,
		onArchive?: (payment: PaymentMethod) => void,
		onRestore?: (payment: PaymentMethod) => void,
	},
	translate: (key: string) => string,
) {
	const payment = row as unknown as PaymentMethod;
	const { onView, onEdit, onDelete, onArchive, onRestore } = handlers;

	return (
		<Box style={{ minWidth: 120 }}>
			<Group gap='xs' justify='flex-end' onClick={(e) => e.stopPropagation()}>
				{onView && (
					<Tooltip label={translate('nikki.general.actions.view')}>
						<ActionIcon variant='subtle' color='blue' onClick={() => onView(payment)}>
							<IconEye size={16} />
						</ActionIcon>
					</Tooltip>
				)}
				{onEdit && (
					<Tooltip label={translate('nikki.general.actions.edit')}>
						<ActionIcon variant='subtle' color='gray' onClick={() => onEdit(payment)}>
							<IconEdit size={16} />
						</ActionIcon>
					</Tooltip>
				)}
				{!row.isArchived && onArchive && (
					<Tooltip label={translate('nikki.general.actions.archive')}>
						<ActionIcon variant='subtle' color='orange' onClick={() => onArchive(payment)}>
							<IconArchive size={16} />
						</ActionIcon>
					</Tooltip>
				)}
				{!!row.isArchived && onRestore && (
					<Tooltip label={translate('nikki.general.actions.restore')}>
						<ActionIcon variant='subtle' color='blue' onClick={() => onRestore(payment)}>
							<IconArchiveOff size={16} />
						</ActionIcon>
					</Tooltip>
				)}
				{onDelete && (
					<Tooltip label={translate('nikki.general.actions.delete')}>
						<ActionIcon variant='subtle' color='red' onClick={() => onDelete(payment)}>
							<IconTrash size={16} />
						</ActionIcon>
					</Tooltip>
				)}
			</Group>
		</Box>
	);
}

function renderActionsHeader(
	_columnName: string,
	_schema: unknown,
	translate: (key: string) => string,
) {
	return <Text fw={600} fz='sm' ta={'end'}>{translate('nikki.general.actions.title')}</Text>;
}

export const PaymentTable: React.FC<PaymentTableProps> = ({
	columns,
	data,
	schema,
	isLoading,
	onViewDetail,
	onArchive,
	onRestore,
	onEdit,
	onDelete,
}) => {
	const { t: translate } = useTranslation();

	return (
		<div style={{ position: 'relative' }}>
			<style>
				{`
					table th:last-child,
					table td:last-child {
						min-width: 120px;
						width: 120px;
					}
				`}
			</style>
			<AutoTable
				columns={columns}
				data={data}
				schema={schema}
				isLoading={isLoading}
				columnRenderers={{
					method: renderMethodColumn,
					name: renderNameColumn,
					isArchived: (row) => renderArchivedColumn(row),
					transactionRange: renderTransactionRangeColumn,
					actions: (row) => renderActionsColumn(row,
						{ onView: onViewDetail, onEdit, onDelete, onArchive, onRestore },
						translate,
					),
				}}
				headerRenderers={{
					actions: (columnName, schema) => renderActionsHeader(columnName, schema, translate),
				}}
			/>
		</div>
	);
};
