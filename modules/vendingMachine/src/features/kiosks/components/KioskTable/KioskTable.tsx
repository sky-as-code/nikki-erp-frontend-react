import { Box, Text } from '@mantine/core';
import { AutoTable, AutoTableProps, TablePagination, TablePaginationProps } from '@nikkierp/ui/components';
import {
	IconEye,
	IconTrash,
	IconRestore,
	IconArchive,
} from '@tabler/icons-react';
import { TFunction } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ArchivedStatusBadge } from '@/components/ArchivedStatusBadge';
import { KioskConnectionStatus } from '@/components/KioskConnectionStatus';
import { KioskModeStatusBadge } from '@/components/KioskModeStatusBadge';
import { KioskWarning } from '@/components/KioskWarning';
import { PopoverAddress } from '@/components/PopoverAddress';
import { NameCell, TableAction, TextCell, type TableActionItem } from '@/components/Table';

import { Kiosk, KioskMode } from '../../types';


const KIOSK_ACTIONS = {
	VIEW: 'view',
	EDIT: 'edit',
	ARCHIVE: 'archive',
	RESTORE: 'restore',
	DELETE: 'delete',
} as const;
type KioskActionType = (typeof KIOSK_ACTIONS)[keyof typeof KIOSK_ACTIONS];

export type KioskTableActions = {
	[key in KioskActionType]?: (kiosk: Kiosk, ...args: unknown[]) => void;
};
export interface KioskTableProps extends AutoTableProps {
	actions: KioskTableActions;
	pagination: TablePaginationProps;
}

export function getKioskTableActions(
	kiosk: Kiosk,
	actions: KioskTableActions,
	translate: TFunction,
): TableActionItem[] {
	if (Object.keys(actions).length === 0) return [];

	const defaultActions: (TableActionItem & { active?: boolean })[] = [
		{
			key: KIOSK_ACTIONS.VIEW,
			label: translate('nikki.general.actions.view'),
			icon: <IconEye size={16} />,
			onClick: () => actions[KIOSK_ACTIONS.VIEW]?.(kiosk),
			color: 'blue',
			active: !!actions[KIOSK_ACTIONS.VIEW],
		},
		{
			key: KIOSK_ACTIONS.ARCHIVE,
			label: translate('nikki.general.actions.archive'),
			icon: <IconArchive size={16} />,
			onClick: () => actions[KIOSK_ACTIONS.ARCHIVE]?.(kiosk),
			color: 'orange',
			active: !kiosk.isArchived && !!actions[KIOSK_ACTIONS.ARCHIVE],
		},
		{
			key: KIOSK_ACTIONS.RESTORE,
			label: translate('nikki.general.actions.restore'),
			icon: <IconRestore size={16} />,
			onClick: () => actions[KIOSK_ACTIONS.RESTORE]?.(kiosk),
			color: 'blue',
			active: !!kiosk.isArchived && !!actions[KIOSK_ACTIONS.RESTORE],
		},
		{
			key: KIOSK_ACTIONS.DELETE,
			label: translate('nikki.general.actions.delete'),
			icon: <IconTrash size={16} />,
			onClick: () => actions[KIOSK_ACTIONS.DELETE]?.(kiosk),
			color: 'red',
			active: !!actions[KIOSK_ACTIONS.DELETE],
		},
	];
	return defaultActions.filter((action) => action.active);
}

function renderActionsHeader(
	_columnName: string,
	_schema: unknown,
	translate: (key: string) => string,
) {
	return <Text fw={600} fz='sm' ta={'end'}>{translate('nikki.general.actions.title')}</Text>;
}

export const KioskTable: React.FC<KioskTableProps> = ({
	data,
	schema,
	columns,
	isLoading,
	actions,
	pagination,
}) => {
	const { t: translate } = useTranslation();

	const colSizes: React.ComponentProps<typeof AutoTable>['columnSizes'] = {
		code: { flex: 1, minWidth: 120 },
		name: { flex: 2, minWidth: 180 },
		connectionStatus: { width: 120 },
		address: { flex: 2, minWidth: 200 },
		isArchived: { flex: 1, minWidth: 120 },
		mode: { flex: 1, minWidth: 120 },
		warnings: { width: 120 },
		actions: { width: 120 },
	};

	const colRenderers: React.ComponentProps<typeof AutoTable>['columnRenderers'] = {
		code: (row) => <TextCell content={row.code as string} />,
		name: (row) => <NameCell content={row.name as string} link={row.id ? `../kiosks/${row.id}` : undefined} />,
		locationAddress: (row) => <PopoverAddress
			address={row.locationAddress as string}
			latitude={String(row.latitude) || undefined}
			longitude={String(row.longitude) || undefined}
		/>,
		isArchived: (row) => <ArchivedStatusBadge isArchived={!!row.isArchived} />,
		mode: (row) => <KioskModeStatusBadge mode={row.mode as KioskMode} />,
		connectionStatus: (row) => <KioskConnectionStatus connections={row.connections as Kiosk['connections']} />,
		warnings: (row) => <KioskWarning warnings={row.warnings as Kiosk['warnings']} />,
		actions: (row) => (
			<TableAction
				actions={getKioskTableActions( row as unknown as Kiosk, actions, translate)}
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
