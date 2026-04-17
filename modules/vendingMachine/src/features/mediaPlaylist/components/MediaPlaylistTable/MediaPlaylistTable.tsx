import { Box, Text } from '@mantine/core';
import { AutoTable, AutoTableProps, TablePagination, TablePaginationProps } from '@nikkierp/ui/components';
import { IconEdit, IconEye, IconTrash } from '@tabler/icons-react';
import { TFunction } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';


import { ArchivedStatusBadge } from '@/components/ArchivedStatusBadge';
import { NameCell, TableAction, TextCell, type TableActionItem } from '@/components/Table';

import type { Playlist } from '../../types';


const MEDIA_PLAYLIST_ACTIONS = {
	VIEW: 'view',
	EDIT: 'edit',
	DELETE: 'delete',
} as const;
type MediaPlaylistActionType = (typeof MEDIA_PLAYLIST_ACTIONS)[keyof typeof MEDIA_PLAYLIST_ACTIONS];

export type MediaPlaylistTableActions = {
	[key in MediaPlaylistActionType]?: (playlist: Playlist, ...args: unknown[]) => void;
};

export function getMediaPlaylistTableActions(
	playlist: Playlist,
	actions: MediaPlaylistTableActions,
	translate: TFunction,
): TableActionItem[] {
	if (Object.keys(actions).length === 0) return [];

	const defaultActions: (TableActionItem & { active?: boolean })[] = [
		{
			key: MEDIA_PLAYLIST_ACTIONS.VIEW,
			label: translate('nikki.general.actions.view'),
			icon: <IconEye size={16} />,
			onClick: () => actions[MEDIA_PLAYLIST_ACTIONS.VIEW]?.(playlist),
			color: 'blue',
			active: !!actions[MEDIA_PLAYLIST_ACTIONS.VIEW],
		},
		{
			key: MEDIA_PLAYLIST_ACTIONS.EDIT,
			label: translate('nikki.general.actions.edit'),
			icon: <IconEdit size={16} />,
			onClick: () => actions[MEDIA_PLAYLIST_ACTIONS.EDIT]?.(playlist),
			color: 'gray',
			active: !!actions[MEDIA_PLAYLIST_ACTIONS.EDIT],
		},
		{
			key: MEDIA_PLAYLIST_ACTIONS.DELETE,
			label: translate('nikki.general.actions.delete'),
			icon: <IconTrash size={16} />,
			onClick: () => actions[MEDIA_PLAYLIST_ACTIONS.DELETE]?.(playlist),
			color: 'red',
			active: !!actions[MEDIA_PLAYLIST_ACTIONS.DELETE],
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

export interface MediaPlaylistTableProps extends AutoTableProps {
	actions: MediaPlaylistTableActions;
	pagination: TablePaginationProps;
}

export const MediaPlaylistTable: React.FC<MediaPlaylistTableProps> = ({
	data,
	schema,
	columns,
	isLoading,
	actions,
	pagination,
}) => {
	const { t: translate } = useTranslation();

	const colSizes: React.ComponentProps<typeof AutoTable>['columnSizes'] = {
		name: { flex: 2, minWidth: 180 },
		isArchived: { flex: 1, minWidth: 120 },
		mediaItems: { flex: 1, minWidth: 200 },
		actions: { width: 120 },
	};

	const colRenderers: React.ComponentProps<typeof AutoTable>['columnRenderers'] = {
		name: (row) => (
			<NameCell
				content={row.name as string}
				link={row.id ? `../media-playlist/playlists/${row.id as string}` : undefined}
			/>
		),
		isArchived: (row) => <ArchivedStatusBadge isArchived={!!row.isArchived} />,
		mediaItems: (row) => {
			const n = row.mediaItems;
			const text = n === undefined || n === null ? '—' : String(n);
			return <TextCell content={text} />;
		},
		actions: (row) => (
			<TableAction
				actions={getMediaPlaylistTableActions(row as unknown as Playlist, actions, translate)}
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
