import { ActionIcon, Badge, Box, Group, Text, Tooltip } from '@mantine/core';
import { AutoTable, AutoTableProps } from '@nikkierp/ui/components';
import { IconEdit, IconEye, IconTrash } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';



export interface KioskTemplateTableProps extends AutoTableProps {
	onViewDetail: (templateId: string) => void;
	onEdit?: (templateId: string) => void;
	onDelete?: (templateId: string) => void;
}

function renderCodeColumn(row: Record<string, unknown>) {
	return <Text fw={500}>{String(row.code || '')}</Text>;
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

function renderActionsColumn(
	row: Record<string, unknown>,
	onView?: (templateId: string) => void,
	onEdit?: (templateId: string) => void,
	onDelete?: (templateId: string) => void,
	translate?: (key: string) => string,
) {
	const templateId = row.id as string;
	if (!translate) return null;

	return (
		<Box style={{ minWidth: 120 }}>
			<Group gap='xs' justify='flex-end' onClick={(e) => e.stopPropagation()}>
				{onView && (
					<Tooltip label={translate('nikki.general.actions.view')}>
						<ActionIcon variant='subtle' color='blue' onClick={() => onView(templateId)}>
							<IconEye size={16} />
						</ActionIcon>
					</Tooltip>
				)}
				{onEdit && (
					<Tooltip label={translate('nikki.general.actions.edit')}>
						<ActionIcon variant='subtle' color='gray' onClick={() => onEdit(templateId)}>
							<IconEdit size={16} />
						</ActionIcon>
					</Tooltip>
				)}
				{onDelete && (
					<Tooltip label={translate('nikki.general.actions.delete')}>
						<ActionIcon variant='subtle' color='red' onClick={() => onDelete(templateId)}>
							<IconTrash size={16} />
						</ActionIcon>
					</Tooltip>
				)}
			</Group>
		</Box>
	);
}

export const KioskTemplateTable: React.FC<KioskTemplateTableProps> = ({
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
					description: renderDescriptionColumn,
					status: (row) => renderStatusColumn(row, translate),
					actions: (row) => renderActionsColumn(row, onViewDetail, onEdit, onDelete, translate),
				}}
				columnAsLink='code'
				columnAsLinkHref={(row) => {
					const templateId = row.id as string;
					onViewDetail(templateId);
					return '#';
				}}
			/>
		</div>
	);
};

