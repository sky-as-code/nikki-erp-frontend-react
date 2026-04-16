import { Box, Group, Stack, Text, Tooltip } from '@mantine/core';
import { IconWifi, IconWifiOff } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ConnectionHistory, ConnectionStatus } from '@/features/kiosks';
import { formatRelativeTime } from '@/helpers';


export type KioskConnectionStatusTranslate = (key: string, options?: { count?: number }) => string;

export type KioskConnectionStatusProps = {
	connections?: ConnectionHistory[] | null;
};


export const KioskConnectionStatus: React.FC<KioskConnectionStatusProps> = ({ connections }) => {
	const { t: translate } = useTranslation();
	const connectionHistory = connections ?? [];
	const connectionStatus = connectionHistory.length > 0
		? connectionHistory[0].status
		: ConnectionStatus.DISCONNECTED;

	const statusMap = {
		[ConnectionStatus.FAST]: {
			label: translate('nikki.vendingMachine.kiosk.connectionStatus.fast'),
			icon: <IconWifi size={20} color='#51cf66' />,
		},
		[ConnectionStatus.SLOW]: {
			label: translate('nikki.vendingMachine.kiosk.connectionStatus.slow'),
			icon: <IconWifi size={20} color='#ffd43b' />,
		},
		[ConnectionStatus.DISCONNECTED]: {
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
				if (!historyStatus) return null;
				return (
					<Group key={index} gap='xs' align='center'>
						{historyStatus.icon}
						<Text size='xs'>{historyStatus.label}</Text>
						<Text size='xs' c='dimmed' ml='auto'>
							{formatRelativeTime(history.createdAt ?? '', translate)}
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
};
