import { Box, Group, Image, Text } from '@mantine/core';
import { AutoTable, AutoTableProps } from '@nikkierp/ui/components';
import {
	IconArchive,
	IconCreditCard,
	IconEdit,
	IconEye,
	IconRestore,
	IconTrash,
} from '@tabler/icons-react';
import { TFunction } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ArchivedStatusBadge } from '@/components/ArchivedStatusBadge';
import { NameCell, TableAction, TextCell, type TableActionItem } from '@/components/Table';

import { PaymentMethod } from '../../types';


const PAYMENT_TABLE_ACTIONS = {
	VIEW: 'view',
	EDIT: 'edit',
	ARCHIVE: 'archive',
	RESTORE: 'restore',
	DELETE: 'delete',
} as const;
type PaymentTableActionType = (typeof PAYMENT_TABLE_ACTIONS)[keyof typeof PAYMENT_TABLE_ACTIONS];

export type PaymentTableActions = {
	[key in PaymentTableActionType]?: (payment: PaymentMethod, ...args: unknown[]) => void;
};

export function getPaymentTableActions(
	payment: PaymentMethod,
	actions: PaymentTableActions,
	translate: TFunction,
): TableActionItem[] {
	if (Object.keys(actions).length === 0) return [];

	const defaultActions: (TableActionItem & { active?: boolean })[] = [
		{
			key: PAYMENT_TABLE_ACTIONS.VIEW,
			label: translate('nikki.general.actions.view'),
			icon: <IconEye size={16} />,
			onClick: () => actions[PAYMENT_TABLE_ACTIONS.VIEW]?.(payment),
			color: 'blue',
			active: !!actions[PAYMENT_TABLE_ACTIONS.VIEW],
		},
		{
			key: PAYMENT_TABLE_ACTIONS.EDIT,
			label: translate('nikki.general.actions.edit'),
			icon: <IconEdit size={16} />,
			onClick: () => actions[PAYMENT_TABLE_ACTIONS.EDIT]?.(payment),
			color: 'gray',
			active: !!actions[PAYMENT_TABLE_ACTIONS.EDIT],
		},
		{
			key: PAYMENT_TABLE_ACTIONS.ARCHIVE,
			label: translate('nikki.general.actions.archive'),
			icon: <IconArchive size={16} />,
			onClick: () => actions[PAYMENT_TABLE_ACTIONS.ARCHIVE]?.(payment),
			color: 'orange',
			active: !payment.isArchived && !!actions[PAYMENT_TABLE_ACTIONS.ARCHIVE],
		},
		{
			key: PAYMENT_TABLE_ACTIONS.RESTORE,
			label: translate('nikki.general.actions.restore'),
			icon: <IconRestore size={16} />,
			onClick: () => actions[PAYMENT_TABLE_ACTIONS.RESTORE]?.(payment),
			color: 'blue',
			active: !!payment.isArchived && !!actions[PAYMENT_TABLE_ACTIONS.RESTORE],
		},
		{
			key: PAYMENT_TABLE_ACTIONS.DELETE,
			label: translate('nikki.general.actions.delete'),
			icon: <IconTrash size={16} />,
			onClick: () => actions[PAYMENT_TABLE_ACTIONS.DELETE]?.(payment),
			color: 'red',
			active: !!actions[PAYMENT_TABLE_ACTIONS.DELETE],
		},
	];
	return defaultActions.filter((action) => action.active);
}

function renderActionsHeader(
	_columnName: string,
	_schema: unknown,
	translate: (key: string) => string,
) {
	return <Text fw={600} fz='sm' ta='end'>{translate('nikki.general.actions.title')}</Text>;
}

function formatTransactionRangeCell(row: Record<string, unknown>) {
	const min = row.minTransactionValue as number | undefined;
	const max = row.maxTransactionValue as number | undefined;
	if (min === undefined && max === undefined) {
		return <Text c='dimmed'>-</Text>;
	}
	const formatCurrency = (value: number) =>
		new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
	return (
		<Text size='sm'>
			{min !== undefined ? formatCurrency(min) : '0'} - {max !== undefined ? formatCurrency(max) : '∞'}
		</Text>
	);
}

export interface PaymentTableProps extends AutoTableProps {
	actions: PaymentTableActions;
}

export const PaymentTable: React.FC<PaymentTableProps> = ({
	columns,
	data,
	schema,
	isLoading,
	actions,
}) => {
	const { t: translate } = useTranslation();

	const colSizes: React.ComponentProps<typeof AutoTable>['columnSizes'] = {
		method: { flex: 1, minWidth: 120 },
		name: { flex: 2, minWidth: 200 },
		isArchived: { flex: 1, minWidth: 100 },
		transactionRange: { flex: 1, minWidth: 140 },
		createdAt: { flex: 1, minWidth: 120 },
		actions: { width: 120 },
	};

	const colRenderers: React.ComponentProps<typeof AutoTable>['columnRenderers'] = {
		method: (row) => <TextCell content={String(row.method || '')} />,
		name: (row) => (
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
				) : (
					<IconCreditCard size={26} stroke={1.5} />
				)}
				<NameCell
					content={row.name as string}
					link={row.id ? `../payment/${row.id}` : undefined}
				/>
			</Group>
		),
		isArchived: (row) => <ArchivedStatusBadge isArchived={!!row.isArchived} />,
		transactionRange: (row) => formatTransactionRangeCell(row),
		createdAt: (row) => (
			<TextCell
				content={
					row.createdAt
						? new Date(String(row.createdAt)).toLocaleDateString()
						: '-'
				}
			/>
		),
		actions: (row) => (
			<TableAction
				actions={getPaymentTableActions(row as unknown as PaymentMethod, actions, translate)}
				overflowMenuLabel={translate('nikki.general.actions.title')}
			/>
		),
	};

	const headerRenderers: React.ComponentProps<typeof AutoTable>['headerRenderers'] = {
		actions: (columnName, schema) => renderActionsHeader(columnName, schema, translate),
	};

	return (
		<Box pos='relative' mih={200}>
			<AutoTable
				columns={columns}
				columnSizes={colSizes}
				data={data}
				schema={schema}
				isLoading={isLoading}
				columnRenderers={colRenderers}
				headerRenderers={headerRenderers}
			/>
		</Box>
	);
};
