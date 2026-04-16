import { Box, Text } from '@mantine/core';
import { AutoTable, AutoTableProps, TablePagination, TablePaginationProps } from '@nikkierp/ui/components';
import {
	IconArchive,
	IconEdit,
	IconEye,
	IconRestore,
	IconTrash,
} from '@tabler/icons-react';
import { TFunction } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ArchivedStatusBadge } from '@/components/ArchivedStatusBadge';
import { NameCell, TableAction, type TableActionItem } from '@/components/Table';

import { KioskModel } from '../../types';



const KIOSK_MODEL_ACTIONS = {
	VIEW: 'view',
	EDIT: 'edit',
	ARCHIVE: 'archive',
	RESTORE: 'restore',
	DELETE: 'delete',
} as const;
type KioskModelActionType = (typeof KIOSK_MODEL_ACTIONS)[keyof typeof KIOSK_MODEL_ACTIONS];

export type KioskModelTableActions = {
	[key in KioskModelActionType]?: (kioskModel: KioskModel, ...args: unknown[]) => void;
};

export function getKioskModelTableActions(
	model: KioskModel,
	actions: KioskModelTableActions,
	translate: TFunction,
): TableActionItem[] {
	if (Object.keys(actions).length === 0) return [];

	const defaultActions: (TableActionItem & { active?: boolean })[] = [
		{
			key: KIOSK_MODEL_ACTIONS.VIEW,
			label: translate('nikki.general.actions.view'),
			icon: <IconEye size={16} />,
			onClick: () => actions[KIOSK_MODEL_ACTIONS.VIEW]?.(model),
			color: 'blue',
			active: !!actions[KIOSK_MODEL_ACTIONS.VIEW],
		},
		{
			key: KIOSK_MODEL_ACTIONS.EDIT,
			label: translate('nikki.general.actions.edit'),
			icon: <IconEdit size={16} />,
			onClick: () => actions[KIOSK_MODEL_ACTIONS.EDIT]?.(model),
			color: 'gray',
			active: !!actions[KIOSK_MODEL_ACTIONS.EDIT],
		},
		{
			key: KIOSK_MODEL_ACTIONS.ARCHIVE,
			label: translate('nikki.general.actions.archive'),
			icon: <IconArchive size={16} />,
			onClick: () => actions[KIOSK_MODEL_ACTIONS.ARCHIVE]?.(model),
			color: 'orange',
			active: !model.isArchived && !!actions[KIOSK_MODEL_ACTIONS.ARCHIVE],
		},
		{
			key: KIOSK_MODEL_ACTIONS.RESTORE,
			label: translate('nikki.general.actions.restore'),
			icon: <IconRestore size={16} />,
			onClick: () => actions[KIOSK_MODEL_ACTIONS.RESTORE]?.(model),
			color: 'blue',
			active: !!model.isArchived && !!actions[KIOSK_MODEL_ACTIONS.RESTORE],
		},
		{
			key: KIOSK_MODEL_ACTIONS.DELETE,
			label: translate('nikki.general.actions.delete'),
			icon: <IconTrash size={16} />,
			onClick: () => actions[KIOSK_MODEL_ACTIONS.DELETE]?.(model),
			color: 'red',
			active: !!actions[KIOSK_MODEL_ACTIONS.DELETE],
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

export interface KioskModelTableProps extends AutoTableProps {
	actions: KioskModelTableActions;
	pagination: TablePaginationProps;
}

export const KioskModelTable: React.FC<KioskModelTableProps> = ({
	data,
	schema,
	columns,
	isLoading,
	actions,
	pagination,
}) => {
	const { t: translate } = useTranslation();

	const colSizes: React.ComponentProps<typeof AutoTable>['columnSizes'] = {
		referenceCode: { flex: 1, minWidth: 160 },
		name: { flex: 2, minWidth: 200 },
		description: { flex: 2, minWidth: 300 },
		status: { flex: 1, minWidth: 100 },
		actions: { width: 120 },
	};

	const colRenderers: React.ComponentProps<typeof AutoTable>['columnRenderers'] = {
		referenceCode: (row) => {
			const archived = !!row.isArchived;
			const code = String(row.referenceCode || '');
			return archived
				? <Text c='var(--mantine-color-gray-7)' fw={500} td='none'>{code}</Text>
				: <Text fw={500}>{code}</Text>;
		},
		name: (row) => (
			<NameCell
				content={row.name as string}
				link={row.id ? `../kiosk-models/${row.id}` : undefined}
			/>
		),
		description: (row) => {
			const archived = !!row.isArchived;
			const text = String(row.description || '-');
			return archived
				? <Text c='var(--mantine-color-gray-7)' fw={500} td='none'>{text}</Text>
				: <Text fw={500} td='none'>{text}</Text>;
		},
		status: (row) => <ArchivedStatusBadge isArchived={!!row.isArchived} />,
		actions: (row) => (
			<TableAction
				actions={getKioskModelTableActions(row as unknown as KioskModel, actions, translate)}
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
			<TablePagination {...pagination} />
		</Box>
	);
};
