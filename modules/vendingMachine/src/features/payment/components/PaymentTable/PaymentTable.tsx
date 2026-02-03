import { ActionIcon, Badge, Box, Group, Image, Text, Tooltip } from '@mantine/core';
import { AutoTable, AutoTableProps } from '@nikkierp/ui/components';
import { IconCreditCard, IconEdit, IconEye, IconTrash } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';



export interface PaymentTableProps extends AutoTableProps {
	onViewDetail: (paymentId: string) => void;
	onEdit?: (paymentId: string) => void;
	onDelete?: (paymentId: string) => void;
}

function renderCodeColumn(row: Record<string, unknown>) {
	return <Text fw={500}>{String(row.code || '')}</Text>;
}

function renderNameColumn(row: Record<string, unknown>) {
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
			<Text>{String(row.name || '')}</Text>
		</Group>
	);
}

function renderDescriptionColumn(row: Record<string, unknown>) {
	const description = String(row.description || '');
	// Strip HTML tags for table display
	const plainText = description.replace(/<[^>]*>/g, '').substring(0, 100);
	return <span style={{ maxWidth: 300, display: 'block' }}>{plainText || '-'}</span>;
}

function renderStatusColumn(
	row: Record<string, unknown>,
	translate: (key: string) => string,
) {
	const status = row.status as string;
	const statusMap: Record<string, { color: string; label: string }> = {
		active: { color: 'green', label: translate('nikki.general.status.active') },
		inactive: { color: 'gray', label: translate('nikki.general.status.inactive') },
	};
	const statusInfo = statusMap[status] || { color: 'gray', label: status };
	return <Badge color={statusInfo.color} size='sm'>{statusInfo.label}</Badge>;
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
	onView?: (paymentId: string) => void,
	onEdit?: (paymentId: string) => void,
	onDelete?: (paymentId: string) => void,
	translate?: (key: string) => string,
) {
	const paymentId = row.id as string;
	if (!translate) return null;

	return (
		<Box style={{ minWidth: 120 }}>
			<Group gap='xs' justify='flex-end' onClick={(e) => e.stopPropagation()}>
				{onView && (
					<Tooltip label={translate('nikki.general.actions.view')}>
						<ActionIcon variant='subtle' color='blue' onClick={() => onView(paymentId)}>
							<IconEye size={16} />
						</ActionIcon>
					</Tooltip>
				)}
				{onEdit && (
					<Tooltip label={translate('nikki.general.actions.edit')}>
						<ActionIcon variant='subtle' color='gray' onClick={() => onEdit(paymentId)}>
							<IconEdit size={16} />
						</ActionIcon>
					</Tooltip>
				)}
				{onDelete && (
					<Tooltip label={translate('nikki.general.actions.delete')}>
						<ActionIcon variant='subtle' color='red' onClick={() => onDelete(paymentId)}>
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
					code: renderCodeColumn,
					name: renderNameColumn,
					description: renderDescriptionColumn,
					status: (row) => renderStatusColumn(row, translate),
					transactionRange: renderTransactionRangeColumn,
					actions: (row) => renderActionsColumn(row, onViewDetail, onEdit, onDelete, translate),
				}}
				headerRenderers={{
					actions: (columnName, schema) => renderActionsHeader(columnName, schema, translate),
				}}
				columnAsLink='code'
				columnAsLinkHref={(row) => {
					const paymentId = row.id as string;
					onViewDetail(paymentId);
					return '#';
				}}
			/>
		</div>
	);
};
