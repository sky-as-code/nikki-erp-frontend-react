import { ActionIcon, Badge, Box, Group, Text, Tooltip } from '@mantine/core';
import { AutoTable, AutoTableProps } from '@nikkierp/ui/components';
import { IconDeviceGamepad, IconEdit, IconEye, IconTrash } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';



export interface GameTableProps extends AutoTableProps {
	onViewDetail: (gameId: string) => void;
	onEdit?: (gameId: string) => void;
	onDelete?: (gameId: string) => void;
}

function renderCodeColumn(row: Record<string, unknown>) {
	return <Text fw={500}>{String(row.code || '')}</Text>;
}

const NameColumn: React.FC<{ row: Record<string, unknown> }> = ({ row }) => {
	const navigate = useNavigate();
	const gameId = row.id as string;
	const name = String(row.name || '');

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (gameId) {
			navigate(`../games/${gameId}`);
		}
	};

	return (
		<Group gap='xs' align='center' justify='flex-start'>
			<IconDeviceGamepad size={26} stroke={1.5} />
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

function renderDescriptionColumn(row: Record<string, unknown>) {
	const description = String(row.description || '');
	const plainText = description.substring(0, 100);
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

function renderLatestVersionColumn(row: Record<string, unknown>) {
	const version = String(row.latestVersion || '-');
	return <Text size='sm'>{version}</Text>;
}

function renderMinAppVersionColumn(row: Record<string, unknown>) {
	const version = String(row.minAppVersion || '-');
	return <Text size='sm' c={version === '-' ? 'dimmed' : undefined}>{version}</Text>;
}

function renderActionsColumn(
	row: Record<string, unknown>,
	onView?: (gameId: string) => void,
	onEdit?: (gameId: string) => void,
	onDelete?: (gameId: string) => void,
	translate?: (key: string) => string,
) {
	const gameId = row.id as string;
	if (!translate) return null;

	return (
		<Box style={{ minWidth: 120 }}>
			<Group gap='xs' justify='flex-end' onClick={(e) => e.stopPropagation()}>
				{onView && (
					<Tooltip label={translate('nikki.general.actions.view')}>
						<ActionIcon variant='subtle' color='blue' onClick={() => onView(gameId)}>
							<IconEye size={16} />
						</ActionIcon>
					</Tooltip>
				)}
				{onEdit && (
					<Tooltip label={translate('nikki.general.actions.edit')}>
						<ActionIcon variant='subtle' color='gray' onClick={() => onEdit(gameId)}>
							<IconEdit size={16} />
						</ActionIcon>
					</Tooltip>
				)}
				{onDelete && (
					<Tooltip label={translate('nikki.general.actions.delete')}>
						<ActionIcon variant='subtle' color='red' onClick={() => onDelete(gameId)}>
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

export const GameTable: React.FC<GameTableProps> = ({
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
					latestVersion: renderLatestVersionColumn,
					minAppVersion: renderMinAppVersionColumn,
					actions: (row) => renderActionsColumn(row, onViewDetail, onEdit, onDelete, translate),
				}}
				headerRenderers={{
					actions: (columnName, schema) => renderActionsHeader(columnName, schema, translate),
				}}
				columnAsLink='code'
				columnAsLinkHref={(row) => {
					const gameId = row.id as string;
					onViewDetail(gameId);
					return '#';
				}}
			/>
		</div>
	);
};
