import { Badge, Box, Divider, Group, Stack, Text } from '@mantine/core';
import { IconMapPin, IconDeviceDesktop } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { ArchivedStatusBadge } from '@/components/ArchivedStatusBadge';
import { PreviewDrawer } from '@/components/PreviewDrawer';

import { Kiosk, KioskMode } from '../../types';


export interface KioskDetailDrawerProps {
	opened: boolean;
	onClose: () => void;
	kiosk: Kiosk | undefined;
	isLoading?: boolean;
}

// eslint-disable-next-line max-lines-per-function
export const KioskDetailDrawer: React.FC<KioskDetailDrawerProps> = ({
	opened,
	onClose,
	kiosk,
	isLoading = false,
}) => {
	const { t: translate } = useTranslation();
	const navigate = useNavigate();

	const getModeBadge = (mode?: KioskMode | null) => {
		if (!mode) return null;
		const modeMap: Partial<Record<KioskMode, { color: string; label: string }>> = {
			[KioskMode.PENDING]: { color: 'yellow', label: translate('nikki.vendingMachine.kiosk.mode.pending') },
			[KioskMode.SELLING]: { color: 'blue', label: translate('nikki.vendingMachine.kiosk.mode.selling') },
			[KioskMode.SLIDESHOW_ONLY]: { color: 'purple', label: translate('nikki.vendingMachine.kiosk.mode.slideshowOnly') },
		};
		const modeInfo = modeMap[mode];
		if (!modeInfo) return null;
		return <Badge color={modeInfo.color}>{modeInfo.label}</Badge>;
	};

	return (
		<PreviewDrawer
			opened={opened}
			onClose={onClose}
			header={{
				title: kiosk?.name,
				subtitle: kiosk?.code,
				avatar: <IconDeviceDesktop size={20} />,
			}}
			onViewDetails={() => {
				if (kiosk?.id) {
					navigate(`../kiosks/${kiosk.id}`);
				}
				onClose();
			}}
			isLoading={isLoading}
			isNotFound={!kiosk && !isLoading}
			drawerProps={{ size: 'lg', opened, onClose }}
		>
			<Stack gap='md'>
				<Box>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.kiosk.fields.code')}
					</Text>
					<Text size='sm' fw={500}>{kiosk?.code}</Text>
				</Box>

				<Divider />

				<Box>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.kiosk.fields.name')}
					</Text>
					<Text size='sm'>{kiosk?.name}</Text>
				</Box>

				<Divider />

				<Box>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.kiosk.fields.address')}
					</Text>
					<Group gap='xs'>
						<IconMapPin size={16} />
						<Text size='sm'>{kiosk?.locationAddress}</Text>
					</Group>
				</Box>

				<Divider />

				<Box>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.kiosk.fields.coordinates')}
					</Text>
					<Text size='sm'>
						{kiosk?.latitude != null && kiosk?.longitude != null
							? `${kiosk.latitude}, ${kiosk.longitude}`
							: '—'}
					</Text>
				</Box>

				<Divider />

				<Box>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.kiosk.fields.status')}
					</Text>
					{kiosk ? <ArchivedStatusBadge isArchived={Boolean(kiosk.isArchived)} /> : null}
				</Box>

				<Divider />

				<Box>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.kiosk.fields.mode')}
					</Text>
					{getModeBadge(kiosk?.mode)}
				</Box>

				<Divider />

				<Box>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.kiosk.fields.createdAt')}
					</Text>
					<Text size='sm'>{kiosk?.createdAt ? new Date(kiosk.createdAt).toLocaleString() : '—'}</Text>
				</Box>

			</Stack>
		</PreviewDrawer>
	);
};

