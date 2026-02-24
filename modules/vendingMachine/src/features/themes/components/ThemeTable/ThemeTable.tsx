import { ActionIcon, Badge, Box, Group, Text, Tooltip } from '@mantine/core';
import { AutoTable, AutoTableProps } from '@nikkierp/ui/components';
import { IconEdit, IconEye, IconTrash } from '@tabler/icons-react';
import React from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';



export interface ThemeTableProps extends AutoTableProps {
	onViewDetail: (themeId: string) => void;
	onEdit?: (themeId: string) => void;
	onDelete?: (themeId: string) => void;
}

function renderCodeColumn(row: Record<string, unknown>) {
	return <Text fw={500}>{String(row.code || '')}</Text>;
}

const NameColumn: React.FC<{ row: Record<string, unknown> }> = ({ row }) => {
	const navigate = useNavigate();
	const themeId = row.id as string;
	const name = String(row.name || '');

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (themeId) {
			navigate(`../themes/${themeId}`);
		}
	};

	return (
		<Text
			c='light-dark(var(--mantine-color-blue-8), var(--mantine-color-blue-2))'
			fw={500}
			style={{ cursor: 'pointer' }}
			onClick={handleClick}
			td='underline'
		>
			{name}
		</Text>
	);
};

function renderNameColumn(row: Record<string, unknown>) {
	return <NameColumn row={row} />;
}

function renderDescriptionColumn(row: Record<string, unknown>) {
	return <span style={{ maxWidth: 300, display: 'block' }}>{String(row.description || '-')}</span>;
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

function renderPrimaryColorColumn(row: Record<string, unknown>) {
	const color = String(row.primaryColor || '#000000');
	return (
		<Group gap='xs'>
			<Box
				style={{
					width: 24,
					height: 24,
					borderRadius: 4,
					backgroundColor: color,
					border: '1px solid #ddd',
				}}
			/>
			<Text size='sm'>{color}</Text>
		</Group>
	);
}

function renderActionsColumn(
	row: Record<string, unknown>,
	onView?: (themeId: string) => void,
	onEdit?: (themeId: string) => void,
	onDelete?: (themeId: string) => void,
	translate?: (key: string) => string,
) {
	const themeId = row.id as string;
	if (!translate) return null;

	return (
		<Box style={{ minWidth: 120 }}>
			<Group gap='xs' justify='flex-end' onClick={(e) => e.stopPropagation()}>
				{onView && (
					<Tooltip label={translate('nikki.general.actions.view')}>
						<ActionIcon variant='subtle' color='blue' onClick={() => onView(themeId)}>
							<IconEye size={16} />
						</ActionIcon>
					</Tooltip>
				)}
				{onEdit && (
					<Tooltip label={translate('nikki.general.actions.edit')}>
						<ActionIcon variant='subtle' color='gray' onClick={() => onEdit(themeId)}>
							<IconEdit size={16} />
						</ActionIcon>
					</Tooltip>
				)}
				{onDelete && (
					<Tooltip label={translate('nikki.general.actions.delete')}>
						<ActionIcon variant='subtle' color='red' onClick={() => onDelete(themeId)}>
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

export const ThemeTable: React.FC<ThemeTableProps> = ({
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
					primaryColor: renderPrimaryColorColumn,
					actions: (row) => renderActionsColumn(row, onViewDetail, onEdit, onDelete, translate),
				}}
				headerRenderers={{
					actions: (columnName, schema) => renderActionsHeader(columnName, schema, translate),
				}}
				columnAsLink='code'
				columnAsLinkHref={(row) => {
					const themeId = row.id as string;
					onViewDetail(themeId);
					return '#';
				}}
			/>
		</div>
	);
};
