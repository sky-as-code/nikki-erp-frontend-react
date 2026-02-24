import { ActionIcon, Badge, Box, Group, Text, Tooltip } from '@mantine/core';
import { AutoTable, AutoTableProps } from '@nikkierp/ui/components';
import { IconEdit, IconEye, IconTrash } from '@tabler/icons-react';
import React from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';



export interface KioskDeviceTableProps extends AutoTableProps {
	onViewDetail: (kioskDeviceId: string) => void;
	onEdit?: (kioskDeviceId: string) => void;
	onDelete?: (kioskDeviceId: string) => void;
}

function renderCodeColumn(row: Record<string, unknown>) {
	return <Text fw={500}>{String(row.code || '')}</Text>;
}

const NameColumn: React.FC<{ row: Record<string, unknown> }> = ({ row }) => {
	const navigate = useNavigate();
	const kioskDeviceId = row.id as string;
	const name = String(row.name || '');

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (kioskDeviceId) {
			navigate(`../kiosk-devices/${kioskDeviceId}`);
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

function renderDeviceTypeColumn(
	row: Record<string, unknown>,
	translate: (key: string) => string,
) {
	const deviceType = row.deviceType as string;
	const typeMap: Record<string, { color: string; label: string }> = {
		motor: { color: 'blue', label: translate('nikki.vendingMachine.device.deviceType.motor') },
		pos: { color: 'cyan', label: translate('nikki.vendingMachine.device.deviceType.pos') },
		screen: { color: 'purple', label: translate('nikki.vendingMachine.device.deviceType.screen') },
		cpu: { color: 'orange', label: translate('nikki.vendingMachine.device.deviceType.cpu') },
		router: { color: 'teal', label: translate('nikki.vendingMachine.device.deviceType.router') },
	};
	const typeInfo = typeMap[deviceType] || { color: 'gray', label: deviceType };
	return <Badge color={typeInfo.color} size='sm' variant='light'>{typeInfo.label}</Badge>;
}

function renderSpecificationsColumn(row: Record<string, unknown>) {
	const specifications = row.specifications as Array<{ key: string; value: string }> | undefined;
	if (!specifications || specifications.length === 0) {
		return <Text c='dimmed' size='sm'>-</Text>;
	}
	return (
		<Text size='sm'>{specifications.length} {specifications.length === 1 ? 'thông số' : 'thông số'}</Text>
	);
}

function renderActionsColumn(
	row: Record<string, unknown>,
	onView?: (kioskDeviceId: string) => void,
	onEdit?: (kioskDeviceId: string) => void,
	onDelete?: (kioskDeviceId: string) => void,
	translate?: (key: string) => string,
) {
	const kioskDeviceId = row.id as string;
	if (!translate) return null;

	return (
		<Box style={{ minWidth: 120 }}>
			<Group gap='xs' justify='flex-end' onClick={(e) => e.stopPropagation()}>
				{onView && (
					<Tooltip label={translate('nikki.general.actions.view')}>
						<ActionIcon variant='subtle' color='blue' onClick={() => onView(kioskDeviceId)}>
							<IconEye size={16} />
						</ActionIcon>
					</Tooltip>
				)}
				{onEdit && (
					<Tooltip label={translate('nikki.general.actions.edit')}>
						<ActionIcon variant='subtle' color='gray' onClick={() => onEdit(kioskDeviceId)}>
							<IconEdit size={16} />
						</ActionIcon>
					</Tooltip>
				)}
				{onDelete && (
					<Tooltip label={translate('nikki.general.actions.delete')}>
						<ActionIcon variant='subtle' color='red' onClick={() => onDelete(kioskDeviceId)}>
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

export const KioskDeviceTable: React.FC<KioskDeviceTableProps> = ({
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
					deviceType: (row) => renderDeviceTypeColumn(row, translate),
					specifications: renderSpecificationsColumn,
					actions: (row) => renderActionsColumn(row, onViewDetail, onEdit, onDelete, translate),
				}}
				headerRenderers={{
					actions: (columnName, schema) => renderActionsHeader(columnName, schema, translate),
				}}
				columnAsLink='code'
				columnAsLinkHref={(row) => {
					const kioskDeviceId = row.id as string;
					onViewDetail(kioskDeviceId);
					return '#';
				}}
			/>
		</div>
	);
};
