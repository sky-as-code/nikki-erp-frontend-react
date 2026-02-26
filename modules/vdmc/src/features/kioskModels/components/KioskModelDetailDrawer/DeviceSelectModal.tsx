/* eslint-disable max-lines-per-function */
import { Badge, Button, Card, Group, Modal, ScrollArea, SimpleGrid, Stack, Text, TextInput } from '@mantine/core';
import { IconSearch, IconSettings } from '@tabler/icons-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { kioskDeviceService } from '../../../kioskDevices/kioskDeviceService';
import { KioskDevice } from '../../../kioskDevices/types';


export interface DeviceSelectModalProps {
	opened: boolean;
	onClose: () => void;
	onSelectDevice: (device: KioskDevice) => void;
	selectedDeviceId?: string;
}

export const DeviceSelectModal: React.FC<DeviceSelectModalProps> = ({
	opened,
	onClose,
	onSelectDevice,
}) => {
	const { t: translate } = useTranslation();
	const [devices, setDevices] = useState<KioskDevice[]>([]);
	const [selectedDevice, setSelectedDevice] = useState<KioskDevice | undefined>();
	const [searchQuery, setSearchQuery] = useState('');

	useEffect(() => {
		if (opened) {
			kioskDeviceService.listKioskDevices().then((allDevices) => {
				// Filter only devices with type 'motor'
				const motorDevices = allDevices.filter((d) => d.deviceType === 'motor');
				setDevices(motorDevices);
			});
		}
	}, [opened]);

	const filteredDevices = useMemo(() => {
		if (!searchQuery.trim()) return devices;
		const query = searchQuery.toLowerCase();
		return devices.filter(
			(device) =>
				device.code.toLowerCase().includes(query) ||
				device.name.toLowerCase().includes(query) ||
				device.description?.toLowerCase().includes(query),
		);
	}, [devices, searchQuery]);

	const handleSelectDevice = (device: KioskDevice) => {
		setSelectedDevice(device);
	};

	const handleConfirm = () => {
		if (selectedDevice) {
			onSelectDevice(selectedDevice);
		}
		setSelectedDevice(undefined);
		setSearchQuery('');
		onClose();
	};

	const handleCancel = () => {
		setSelectedDevice(undefined);
		setSearchQuery('');
		onClose();
	};

	return (
		<Modal
			opened={opened}
			onClose={handleCancel}
			title={translate('nikki.vendingMachine.kioskModels.selectDevice.title')}
			size='xl'
		>
			<Stack gap='md'>
				{/* Search */}
				<TextInput
					placeholder={translate('nikki.vendingMachine.kioskModels.selectDevice.searchPlaceholder')}
					leftSection={<IconSearch size={16} />}
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.currentTarget.value)}
				/>

				{/* Devices Grid */}
				<ScrollArea h={400}>
					{filteredDevices.length === 0 ? (
						<Text size='sm' c='dimmed' ta='center' py='md'>
							{translate('nikki.vendingMachine.kioskModels.selectDevice.noDevices')}
						</Text>
					) : (
						<SimpleGrid cols={2} spacing='md'>
							{filteredDevices.map((device) => {
								const isSelected = selectedDevice?.id === device.id;
								return (
									<Card
										key={device.id}
										withBorder
										p='sm'
										radius='md'
										style={{
											cursor: 'pointer',
											borderColor: isSelected ? 'var(--mantine-color-blue-6)' : undefined,
											backgroundColor: isSelected ? 'var(--mantine-color-blue-0)' : undefined,
										}}
										onClick={() => handleSelectDevice(device)}
									>
										<Stack gap='xs'>
											<Group gap='xs' justify='space-between'>
												<Group gap='xs'>
													<IconSettings size={20} />
													<Text size='sm' fw={500}>{device.name}</Text>
												</Group>
												<Badge size='sm'>{device.code}</Badge>
											</Group>
											{device.description && (
												<Text size='xs' c='dimmed' lineClamp={2}>
													{device.description}
												</Text>
											)}
											<Group gap='xs'>
												<Badge size='sm' variant='light' color={device.status === 'active' ? 'green' : 'gray'}>
													{device.status}
												</Badge>
												<Badge size='sm' variant='light' color='blue'>
													{translate('nikki.vendingMachine.device.deviceType.motor')}
												</Badge>
											</Group>
											{device.specifications && device.specifications.length > 0 && (
												<Stack gap={4}>
													<Text size='xs' fw={500} c='dimmed'>
														{translate('nikki.vendingMachine.device.fields.specifications')}:
													</Text>
													{device.specifications.slice(0, 3).map((spec, idx) => (
														<Text key={idx} size='xs' c='dimmed'>
															{spec.key}: {spec.value}
														</Text>
													))}
												</Stack>
											)}
										</Stack>
									</Card>
								);
							})}
						</SimpleGrid>
					)}
				</ScrollArea>

				{/* Actions */}
				<Group justify='flex-end' gap='xs'>
					<Button variant='subtle' onClick={handleCancel}>
						{translate('nikki.general.actions.cancel')}
					</Button>
					<Button onClick={handleConfirm} disabled={!selectedDevice}>
						{translate('nikki.general.actions.confirm')}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
};
