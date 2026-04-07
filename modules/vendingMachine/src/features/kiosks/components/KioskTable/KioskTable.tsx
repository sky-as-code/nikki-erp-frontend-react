import { ActionIcon, Badge, Box, Button, Group, Popover, Stack, Text, Tooltip } from '@mantine/core';
import { AutoTable, AutoTableProps, TablePagination } from '@nikkierp/ui/components';
import {
	IconEdit,
	IconEye,
	IconMapPin,
	IconTrash,
	IconWifi,
	IconWifiOff,
	IconAlertTriangle,
} from '@tabler/icons-react';
import { TFunction } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { ConnectionHistory, ConnectionStatus, Kiosk, KioskMode, KioskStatus, KioskWarning } from '../../types';


export interface KioskTableProps extends AutoTableProps {
	onPreview: (kiosk: Kiosk) => void;
	onEdit?: (kiosk: Kiosk) => void;
	onDelete?: (kiosk: Kiosk) => void;
	isFetching?: boolean;
	page?: number;
	totalPages?: number;
	onPageChange?: (page: number) => void;
	pageSize?: number;
	pageSizeOptions?: { value: string; label: string }[];
	onPageSizeChange?: (value: string | null) => void;
}

function renderCodeColumn(
	row: Record<string, unknown>,
) {
	return <Text c='light-dark(var(--mantine-color-gray-8), var(--mantine-color-dark))' fw={500}>{String(row.code || '')}</Text>;
}

const NameColumn: React.FC<{ row: Record<string, unknown> }> = ({ row }) => {
	const navigate = useNavigate();
	const kioskId = row.id as string;
	const name = String(row.name || '');

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (kioskId) {
			navigate(`../kiosks/${kioskId}`);
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

function renderNameColumn(
	row: Record<string, unknown>,
) {
	return <NameColumn row={row} />;
}

interface AddressColumnProps {
	row: Record<string, unknown>;
	translate?: (key: string) => string;
}

const AddressColumn: React.FC<AddressColumnProps> = ({ row, translate }) => {
	const kiosk = row as unknown as Kiosk;
	const address = kiosk.address || '';


	const handleOpenGoogleMaps = (e: React.MouseEvent) => {
		e.stopPropagation();
		let googleMapsUrl = '';

		// Prefer coordinates if available (more accurate)
		if (kiosk.coordinates?.latitude && kiosk.coordinates?.longitude) {
			googleMapsUrl = `https://www.google.com/maps?q=${kiosk.coordinates.latitude},${kiosk.coordinates.longitude}`;
		}
		else if (address) {
			// Fallback to address search
			googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
		}

		if (googleMapsUrl) {
			window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
		}
	};



	const popoverContent = (
		<Stack gap='xs' style={{ maxWidth: 300 }}>
			<Text size='sm' fw={500}>
				{address || translate?.('nikki.general.no_address') || 'No address'}
			</Text>
			<Button
				size='xs'
				variant='light'
				leftSection={<IconMapPin size={14} />}
				onClick={(e) => handleOpenGoogleMaps(e)}
			>
				{translate?.('nikki.general.actions.view_on_map') || 'View on map'}
			</Button>
		</Stack>
	);

	return (
		<Popover
			width={300}
			position='top-start'
			withArrow
			shadow='md'
			transitionProps={{
				transition: 'fade-up',
				duration: 150,
				timingFunction: 'ease-in-out',
			}}
		>
			<Popover.Target>
				<Button
					size='xs'
					variant='transparent'
					leftSection={<IconMapPin size={14} />}
				>
					<Text size='sm' c='dimmed' lineClamp={1} style={{ maxWidth: 200 }}>
						{address}
					</Text>
				</Button>
			</Popover.Target>
			<Popover.Dropdown>
				{popoverContent}
			</Popover.Dropdown>
		</Popover>
	);
};

function renderAddressColumn(
	row: Record<string, unknown>,
	translate?: (key: string) => string,
) {
	return <AddressColumn row={row} translate={translate} />;
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
		[KioskMode.SLIDESHOW_ONLY]: { color: 'purple', label: translate('nikki.vendingMachine.kiosk.mode.slideshowOnly') },
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



function renderWarningsColumn(
	row: Record<string, unknown>,
	translate: TFunction,
) {
	const warnings = (row.warnings as KioskWarning[]) || [];
	if (!warnings || warnings.length === 0) return '--';

	const warningCount = warnings.length;
	const severityColors = {
		low: 'yellow',
		medium: 'orange',
		high: 'red',
		critical: 'red',
	};

	const highestSeverity = warnings.reduce((highest, warning) => {
		const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
		return severityOrder[warning.severity] > severityOrder[highest.severity] ? warning : highest;
	}, warnings[0]);

	const tooltipContent = (
		<Stack gap='xs' style={{ maxWidth: 300 }}>
			<Text size='sm' fw={500}>
				{translate('nikki.vendingMachine.kiosk.warnings.title')} ({warningCount})
			</Text>
			{warnings.slice(0, 5).map((warning) => (
				<Group key={warning.id} gap='xs' align='flex-start'>
					<IconAlertTriangle size={16} color={`var(--mantine-color-${severityColors[warning.severity]}-6)`} />
					<Stack gap={2}>
						<Text size='xs' fw={500}>{warning.type}</Text>
						<Text size='xs' c='dimmed'>{warning.message}</Text>
					</Stack>
				</Group>
			))}
			{warnings.length > 5 && (
				<Text size='xs' c='dimmed' ta='center'>
					{translate('nikki.vendingMachine.kiosk.warnings.more', { count: warnings.length - 5 })}
				</Text>
			)}
		</Stack>
	);

	return (
		<Stack align='start' justify='center'>
			<Tooltip label={tooltipContent} withArrow position='top' multiline>
				<Box
					pos='relative'
					style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
					onClick={(e) => e.stopPropagation()}
				>
					<IconAlertTriangle
						size={22}
						color={`var(--mantine-color-${severityColors[highestSeverity.severity]}-6)`}
					/>
					<Badge
						color={severityColors[highestSeverity.severity]}
						size='xs'
						variant='filled'
						pos='absolute'
						top={-6}
						right={-8}
						h={14}
						w={14}
						p={0}
						fz={10}
					>
						{warningCount}
					</Badge>
				</Box>
			</Tooltip>
		</Stack>
	);
}

function renderActionsColumn(
	row: Record<string, unknown>,
	onView?: (kiosk: Kiosk) => void,
	onEdit?: (kiosk: Kiosk) => void,
	onDelete?: (kiosk: Kiosk) => void,
	translate?: (key: string) => string,
) {
	const kiosk = row as unknown as Kiosk;
	if (!translate) return null;

	return (
		<Box style={{ minWidth: 120 }}>
			<Group gap='xs' justify='flex-end' onClick={(e) => e.stopPropagation()}>
				{onView && (
					<Tooltip label={translate('nikki.general.actions.view')}>
						<ActionIcon variant='subtle' color='blue' onClick={() => onView(kiosk)}>
							<IconEye size={16} />
						</ActionIcon>
					</Tooltip>
				)}
				{onEdit && (
					<Tooltip label={translate('nikki.general.actions.edit')}>
						<ActionIcon variant='subtle' color='gray' onClick={() => onEdit(kiosk)}>
							<IconEdit size={16} />
						</ActionIcon>
					</Tooltip>
				)}
				{onDelete && (
					<Tooltip label={translate('nikki.general.actions.delete')}>
						<ActionIcon variant='subtle' color='red' onClick={() => onDelete(kiosk)}>
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

export const KioskTable: React.FC<KioskTableProps> = ({
	columns,
	data,
	schema,
	isLoading,
	onPreview,
	onEdit,
	onDelete,
	isFetching,
	page,
	totalPages,
	onPageChange,
	pageSize,
	pageSizeOptions,
	onPageSizeChange,
}) => {
	const { t: translate } = useTranslation();

	return (
		<Box pos='relative' mih={200}>
			<AutoTable
				columns={columns}
				columnSizes={{
					code: { flex: 1, minWidth: 120 },
					name: { flex: 2, minWidth: 180 },
					connectionStatus: { width: 120 },
					address: { flex: 2, minWidth: 200 },
					status: { flex: 1, minWidth: 120 },
					mode: { flex: 1, minWidth: 120 },
					warnings: { width: 120 },
					actions: { flex: 1, minWidth: 120 },
				}}
				data={data}
				schema={schema}
				isLoading={isLoading && !isFetching}
				columnRenderers={{
					code: renderCodeColumn,
					name: renderNameColumn,
					address: (row) => renderAddressColumn(row, translate),
					status: (row) => renderStatusColumn(row, translate),
					mode: (row) => renderModeColumn(row, translate),
					connectionStatus: (row) => renderConnectionStatusColumn(row, translate),
					warnings: (row) => renderWarningsColumn(row, translate),
					actions: (row) => renderActionsColumn(row, onPreview, onEdit, onDelete, translate),
				}}
				headerRenderers={{
					actions: (columnName, schema) => renderActionsHeader(columnName, schema, translate),
				}}
				columnAsLink='code'
				columnAsLinkHref={(row) => {
					onPreview(row as unknown as Kiosk);
					return '#';
				}}
			/>
			<TablePagination
				page={page}
				totalPages={totalPages}
				onPageChange={onPageChange}
				pageSize={pageSize}
				pageSizeOptions={pageSizeOptions}
				onPageSizeChange={onPageSizeChange}
			/>
		</Box>
	);
};

