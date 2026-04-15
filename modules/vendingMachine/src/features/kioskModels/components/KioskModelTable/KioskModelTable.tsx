import { ActionIcon, Box, Divider, Group, Text, Tooltip } from '@mantine/core';
import { AutoTable, AutoTableProps, TablePagination } from '@nikkierp/ui/components';
import { IconArchive, IconEdit, IconEye, IconArchiveOff } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { ArchivedStatusBadge } from '@/components/ArchivedStatusBadge';

import { KioskModel } from '../../types';


export interface KioskModelTableProps extends AutoTableProps {
	totalItems?: number;
	onPreview: (kioskModel: KioskModel) => void;
	onEdit?: (kioskModel: KioskModel) => void;
	onArchive?: (kioskModel: KioskModel) => void;
	onRestore?: (kioskModel: KioskModel) => void;
	isFetching?: boolean;
	page?: number;
	totalPages?: number;
	onPageChange?: (page: number) => void;
	pageSize?: number;
	pageSizeOptions?: { value: string; label: string }[];
	onPageSizeChange?: (value: string | null) => void;
}

function renderReferenceCodeColumn(row: Record<string, unknown>) {
	if (row.isArchived) {
		return <Text c='var(--mantine-color-gray-7)' fw={500} td='none'>{String(row.referenceCode || '')}</Text>;
	}
	return <Text fw={500}>{String(row.referenceCode || '')}</Text>;
}

const NameColumn: React.FC<{ row: Record<string, unknown> }> = ({ row }) => {
	const navigate = useNavigate();
	const modelId = row.id as string;
	const name = String(row.name || '');

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!row.isArchived && modelId) {
			navigate(`../kiosk-models/${modelId}`);
		}
	};

	if (row.isArchived) {
		return <Text c='var(--mantine-color-gray-7)' fw={500} td='none'>{name}</Text>;
	}

	return (
		<Text
			c={'light-dark(var(--mantine-color-blue-8), var(--mantine-color-blue-2))'}
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
	if (row.isArchived) {
		return <Text c='var(--mantine-color-gray-7)' fw={500} td='none'>{String(row.description || '-')}</Text>;
	}
	return <Text fw={500} td='none'>{String(row.description || '-')}</Text>;
}

function renderStatusColumn(
	row: Record<string, unknown>,
) {
	return <ArchivedStatusBadge isArchived={(row.isArchived as boolean) ?? false} />;
}

function renderActionsColumn(
	row: KioskModel,
	onView?: (kioskModel: KioskModel) => void,
	onEdit?: (kioskModel: KioskModel) => void,
	onArchive?: (kioskModel: KioskModel) => void,
	onRestore?: (kioskModel: KioskModel) => void,
	translate?: (key: string) => string,
) {
	if (!translate) return null;

	if (row.isArchived) {
		return (
			<Box style={{ minWidth: 120 }}>
				<Group gap='xs' justify='flex-end' onClick={(e) => e.stopPropagation()}>
					{onRestore && (
						<Tooltip label={translate('nikki.general.actions.restore')}>
							<ActionIcon variant='subtle' color='blue' onClick={() => onRestore(row)}>
								<IconArchiveOff size={16} />
							</ActionIcon>
						</Tooltip>
					)}
				</Group>
			</Box>
		);
	}

	return (
		<Box style={{ minWidth: 120 }}>
			<Group gap='xs' justify='flex-end' onClick={(e) => e.stopPropagation()}>
				{onView && (
					<Tooltip label={translate('nikki.general.actions.view')}>
						<ActionIcon variant='subtle' color='blue' onClick={() => onView(row)}>
							<IconEye size={16} />
						</ActionIcon>
					</Tooltip>
				)}
				{onEdit && (
					<Tooltip label={translate('nikki.general.actions.edit')}>
						<ActionIcon variant='subtle' color='gray' onClick={() => onEdit(row)}>
							<IconEdit size={16} />
						</ActionIcon>
					</Tooltip>
				)}
				{onArchive && (
					<Tooltip label={translate('nikki.general.actions.archive')}>
						<ActionIcon variant='subtle' color='orange' onClick={() => onArchive(row)}>
							<IconArchive size={16} />
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

export const KioskModelTable: React.FC<KioskModelTableProps> = ({
	columns,
	data,
	schema,
	isLoading,
	onPreview,
	onEdit,
	onArchive,
	onRestore,
	isFetching,
	page,
	totalPages,
	totalItems,
	onPageChange,
	pageSize,
	pageSizeOptions,
	onPageSizeChange,
}) => {
	const { t: translate } = useTranslation();

	return (
		<Box pos='relative' mih={200}>
			<Box mih={200}>
				<AutoTable
					data={data}
					schema={schema}
					isLoading={isLoading && !isFetching}
					columns={columns}
					columnSizes={{
						referenceCode: { flex: 1, minWidth: 160 },
						name: { flex: 2, minWidth: 200 },
						description: { flex: 2, minWidth: 300 },
						status: { flex: 1, minWidth: 100 },
						actions: { flex: 1, minWidth: 120 },
					}}
					columnRenderers={{
						referenceCode: renderReferenceCodeColumn,
						name: renderNameColumn,
						description: renderDescriptionColumn,
						status: renderStatusColumn,
						actions: (row) =>
							renderActionsColumn(row as unknown as KioskModel,
								onPreview,
								onEdit,
								onArchive,
								onRestore,
								translate,
							),
					}}
					headerRenderers={{
						actions: (columnName, schema) => renderActionsHeader(columnName, schema, translate),
					}}
				/>
			</Box>
			<Divider my='xs' />
			<TablePagination
				totalItems={totalItems}
				totalPages={totalPages}
				page={page}
				onPageChange={onPageChange}
				pageSize={pageSize}
				pageSizeOptions={pageSizeOptions}
				onPageSizeChange={onPageSizeChange}
			/>
		</Box>
	);
};
