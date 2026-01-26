import { ActionIcon, Badge, Box, Group, Stack, Text, Tooltip } from '@mantine/core';
import { AutoTable, AutoTableProps } from '@nikkierp/ui/components';
import {
	IconEdit,
	IconEye,
	IconMapPin,
	IconTrash,
	IconWifi,
	IconWifiOff,
} from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ConnectionHistory, ConnectionStatus, KioskMode, KioskStatus } from '../../types';


export interface KioskTableProps extends AutoTableProps {
	onViewDetail: (kioskId: string) => void;
	onEdit?: (kioskId: string) => void;
	onDelete?: (kioskId: string) => void;
}

function renderCodeColumn(
	row: Record<string, unknown>,
) {
	return <Text fw={500}>{String(row.code || '')}</Text>;
}

function renderAddressColumn(
	row: Record<string, unknown>,
) {
	return (
		<Group gap='xs'>
			<IconMapPin size={14} />
			<Text size='sm' c='dimmed' lineClamp={1} style={{ maxWidth: 200 }}>
				{String(row.address || '')}
			</Text>
		</Group>
	);
}

function renderStatusColumn(
	row: Record<string, unknown>,
	translate: (key: string) => string,
) {
	const status = row.status as KioskStatus;
	const statusMap = {
		[KioskStatus.ACTIVATED]: { color: 'green', label: translate('nikki.vendingMachine.kiosk.status.activated') },
		[KioskStatus.DISABLED]: { color: 'gray', label: translate('nikki.vendingMachine.kiosk.status.disabled') },
		[KioskStatus.DELETED]: { color: 'red', label: translate('nikki.vendingMachine.kiosk.status.deleted') },
	};
	const statusInfo = statusMap[status];
	return <Badge color={statusInfo.color} size='sm'>{statusInfo.label}</Badge>;
}

function renderModeColumn(
	row: Record<string, unknown>,
	translate: (key: string) => string,
) {
	const mode = row.mode as KioskMode;
	const modeMap = {
		[KioskMode.PENDING]: { color: 'yellow', label: translate('nikki.vendingMachine.kiosk.mode.pending') },
		[KioskMode.SELLING]: { color: 'blue', label: translate('nikki.vendingMachine.kiosk.mode.selling') },
		[KioskMode.ADSONLY]: { color: 'purple', label: translate('nikki.vendingMachine.kiosk.mode.adsOnly') },
	};
	const modeInfo = modeMap[mode];
	return <Badge color={modeInfo.color} size='sm' variant='light'>{modeInfo.label}</Badge>;
}

function formatConnectionTime(
	dateString: string,
	translate: (key: string, options?: { count?: number }) => string,
): string {
	const date = new Date(dateString);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMins = Math.floor(diffMs / 60000);
	const diffHours = Math.floor(diffMs / 3600000);
	const diffDays = Math.floor(diffMs / 86400000);

	if (diffMins < 1) return translate('nikki.vendingMachine.kiosk.connectionHistory.just_now');
	if (diffMins < 60) return translate('nikki.vendingMachine.kiosk.connectionHistory.minutes_ago', { count: diffMins });
	if (diffHours < 24) return translate('nikki.vendingMachine.kiosk.connectionHistory.hours_ago', { count: diffHours });
	return translate('nikki.vendingMachine.kiosk.connectionHistory.days_ago', { count: diffDays });
}

function renderConnectionStatusColumn(
	row: Record<string, unknown>,
	translate: (key: string) => string,
) {
	const connectionStatus = row.connectionStatus as ConnectionStatus;
	const connectionHistory = (row.connectionHistory as ConnectionHistory[]) || [];

	const statusMap = {
		[ConnectionStatus.FAST]: {
			color: '#51cf66',
			label: translate('nikki.vendingMachine.kiosk.connectionStatus.fast'),
			icon: <IconWifi size={20} color='#51cf66' />,
		},
		[ConnectionStatus.SLOW]: {
			color: '#ffd43b',
			label: translate('nikki.vendingMachine.kiosk.connectionStatus.slow'),
			icon: <IconWifi size={20} color='#ffd43b' />,
		},
		[ConnectionStatus.DISCONNECTED]: {
			color: '#ff6b6b',
			label: translate('nikki.vendingMachine.kiosk.connectionStatus.disconnected'),
			icon: <IconWifiOff size={20} color='#ff6b6b' />,
		},
	};

	const currentStatus = statusMap[connectionStatus] || statusMap[ConnectionStatus.DISCONNECTED];

	const tooltipContent = connectionHistory.length > 0 ? (
		<Stack gap='xs' style={{ maxWidth: 300 }}>
			<Text size='sm' fw={500}>
				{translate('nikki.vendingMachine.kiosk.connectionHistory.title')}
			</Text>
			{connectionHistory.slice(0, 5).map((history, index) => {
				const historyStatus = statusMap[history.status];
				return (
					<Group key={index} gap='xs' align='center'>
						{historyStatus.icon}
						<Text size='xs'>{historyStatus.label}</Text>
						<Text size='xs' c='dimmed' ml='auto'>
							{formatConnectionTime(history.reportedAt, translate)}
						</Text>
					</Group>
				);
			})}
		</Stack>
	) : (
		<Text size='sm'>{translate('nikki.vendingMachine.kiosk.connectionHistory.no_history')}</Text>
	);

	return (
		<Tooltip label={tooltipContent} withArrow position='left' multiline>
			<Box style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
				{currentStatus.icon}
			</Box>
		</Tooltip>
	);
}

function renderActionsColumn(
	row: Record<string, unknown>,
	onView?: (kioskId: string) => void,
	onEdit?: (kioskId: string) => void,
	onDelete?: (kioskId: string) => void,
	translate?: (key: string) => string,
) {
	const kioskId = row.id as string;
	if (!translate) return null;

	return (
		<Box style={{ minWidth: 120 }}>
			<Group gap='xs' justify='flex-end' onClick={(e) => e.stopPropagation()}>
				{onView && (
					<Tooltip label={translate('nikki.general.actions.view')}>
						<ActionIcon variant='subtle' color='blue' onClick={() => onView(kioskId)}>
							<IconEye size={16} />
						</ActionIcon>
					</Tooltip>
				)}
				{onEdit && (
					<Tooltip label={translate('nikki.general.actions.edit')}>
						<ActionIcon variant='subtle' color='gray' onClick={() => onEdit(kioskId)}>
							<IconEdit size={16} />
						</ActionIcon>
					</Tooltip>
				)}
				{onDelete && (
					<Tooltip label={translate('nikki.general.actions.delete')}>
						<ActionIcon variant='subtle' color='red' onClick={() => onDelete(kioskId)}>
							<IconTrash size={16} />
						</ActionIcon>
					</Tooltip>
				)}
			</Group>
		</Box>
	);
}

function renderActionsHeader(
	_: Record<string, unknown>,
	translate: (key: string) => string,
) {
	return <Text fw={600} fz='sm' ta={'end'}>{translate('nikki.general.actions.title')}</Text>;
}

export const KioskTable: React.FC<KioskTableProps> = ({
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
					table th:has(+ th:last-child),
					table th:last-child,
					table td:has(+ td:last-child),
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
					address: renderAddressColumn,
					status: (row) => renderStatusColumn(row, translate),
					mode: (row) => renderModeColumn(row, translate),
					connectionStatus: (row) => renderConnectionStatusColumn(row, translate),
					actions: (row) => renderActionsColumn(row, onViewDetail, onEdit, onDelete, translate),
				}}
				headerRenderers={{
					actions: (row) => renderActionsHeader(row, translate),
				}}
				columnAsLink='code'
				columnAsLinkHref={(row) => {
					const kioskId = row.id as string;
					onViewDetail(kioskId);
					return '#';
				}}
			/>
		</div>
	);
};

