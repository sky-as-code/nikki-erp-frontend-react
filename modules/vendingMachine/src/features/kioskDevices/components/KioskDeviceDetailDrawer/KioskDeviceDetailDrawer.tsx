import { Badge, Button, Divider, Group, Stack, Table, Text, TextInput } from '@mantine/core';
import { IconDeviceDesktop, IconPlus, IconTrash } from '@tabler/icons-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { PreviewDrawer } from '@/components/PreviewDrawer';

import { KioskDevice, KioskDeviceSpecification } from '../../types';


export interface KioskDeviceDetailDrawerProps {
	opened: boolean;
	onClose: () => void;
	kioskDevice: KioskDevice | undefined;
	isLoading?: boolean;
}

// eslint-disable-next-line max-lines-per-function
export const KioskDeviceDetailDrawer: React.FC<KioskDeviceDetailDrawerProps> = ({
	opened,
	onClose,
	kioskDevice,
	isLoading = false,
}) => {
	const { t: translate } = useTranslation();
	const navigate = useNavigate();
	const [specifications, setSpecifications] = useState<KioskDeviceSpecification[]>(kioskDevice?.specifications || []);
	const [newSpecKey, setNewSpecKey] = useState('');
	const [newSpecValue, setNewSpecValue] = useState('');

	React.useEffect(() => {
		if (kioskDevice) {
			setSpecifications(kioskDevice.specifications || []);
		}
	}, [kioskDevice]);

	const getStatusBadge = (status: string) => {
		const statusMap: Record<string, { color: string; label: string }> = {
			active: { color: 'green', label: translate('nikki.general.status.active') },
			inactive: { color: 'gray', label: translate('nikki.general.status.inactive') },
		};
		const statusInfo = statusMap[status] || { color: 'gray', label: status };
		return <Badge color={statusInfo.color}>{statusInfo.label}</Badge>;
	};

	const getDeviceTypeBadge = (deviceType: string) => {
		const typeMap: Record<string, { color: string; label: string }> = {
			motor: { color: 'blue', label: translate('nikki.vendingMachine.device.deviceType.motor') },
			pos: { color: 'cyan', label: translate('nikki.vendingMachine.device.deviceType.pos') },
			screen: { color: 'purple', label: translate('nikki.vendingMachine.device.deviceType.screen') },
			cpu: { color: 'orange', label: translate('nikki.vendingMachine.device.deviceType.cpu') },
			router: { color: 'teal', label: translate('nikki.vendingMachine.device.deviceType.router') },
		};
		const typeInfo = typeMap[deviceType] || { color: 'gray', label: deviceType };
		return <Badge color={typeInfo.color} variant='light'>{typeInfo.label}</Badge>;
	};

	const handleAddSpecification = () => {
		if (newSpecKey.trim() && newSpecValue.trim()) {
			setSpecifications([...specifications, { key: newSpecKey.trim(), value: newSpecValue.trim() }]);
			setNewSpecKey('');
			setNewSpecValue('');
		}
	};

	const handleRemoveSpecification = (index: number) => {
		setSpecifications(specifications.filter((_, i) => i !== index));
	};

	return (
		<PreviewDrawer
			opened={opened}
			onClose={onClose}
			header={{
				title: kioskDevice?.name,
				subtitle: kioskDevice?.code,
				avatar: <IconDeviceDesktop size={20} />,
			}}
			onViewDetails={() => {
				if (kioskDevice?.id) {
					navigate(`../kiosk-devices/${kioskDevice.id}`);
				}
				onClose();
			}}
			isLoading={isLoading}
			isNotFound={!kioskDevice && !isLoading}
			drawerProps={{ size: 'lg', opened, onClose }}
		>
			<Stack gap='md'>
				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.device.fields.code')}
					</Text>
					<Text size='sm' fw={500}>{kioskDevice?.code}</Text>
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.device.fields.name')}
					</Text>
					<Text size='sm'>{kioskDevice?.name}</Text>
				</div>

				{kioskDevice?.description && (
					<>
						<Divider />
						<div>
							<Text size='sm' c='dimmed' mb='xs'>
								{translate('nikki.vendingMachine.device.fields.description')}
							</Text>
							<Text size='sm'>{kioskDevice.description}</Text>
						</div>
					</>
				)}

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.device.fields.status')}
					</Text>
					{kioskDevice?.status ? getStatusBadge(kioskDevice.status) : null}
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.device.fields.deviceType')}
					</Text>
					{kioskDevice?.deviceType ? getDeviceTypeBadge(kioskDevice.deviceType) : null}
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs' fw={500}>
						{translate('nikki.vendingMachine.device.fields.specifications')}
					</Text>
					{specifications.length > 0 ? (
						<Table striped highlightOnHover>
							<Table.Thead>
								<Table.Tr>
									<Table.Th>{translate('nikki.vendingMachine.device.fields.specKey')}</Table.Th>
									<Table.Th>{translate('nikki.vendingMachine.device.fields.specValue')}</Table.Th>
									<Table.Th style={{ width: 50 }}></Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{specifications.map((spec, index) => (
									<Table.Tr key={index}>
										<Table.Td>{spec.key}</Table.Td>
										<Table.Td>{spec.value}</Table.Td>
										<Table.Td>
											<Button
												variant='subtle'
												color='red'
												size='xs'
												onClick={() => handleRemoveSpecification(index)}
											>
												<IconTrash size={14} />
											</Button>
										</Table.Td>
									</Table.Tr>
								))}
							</Table.Tbody>
						</Table>
					) : (
						<Text size='sm' c='dimmed'>{translate('nikki.vendingMachine.device.messages.no_specifications')}</Text>
					)}

					<Stack gap='xs' mt='md'>
						<Group gap='xs' align='flex-end'>
							<TextInput
								placeholder={translate('nikki.vendingMachine.device.fields.specKey')}
								value={newSpecKey}
								onChange={(e) => setNewSpecKey(e.currentTarget.value)}
								style={{ flex: 1 }}
							/>
							<TextInput
								placeholder={translate('nikki.vendingMachine.device.fields.specValue')}
								value={newSpecValue}
								onChange={(e) => setNewSpecValue(e.currentTarget.value)}
								style={{ flex: 1 }}
							/>
							<Button
								leftSection={<IconPlus size={16} />}
								onClick={handleAddSpecification}
								disabled={!newSpecKey.trim() || !newSpecValue.trim()}
							>
								{translate('nikki.general.actions.add')}
							</Button>
						</Group>
					</Stack>
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.device.fields.createdAt')}
					</Text>
					<Text size='sm'>{kioskDevice?.createdAt ? new Date(kioskDevice.createdAt).toLocaleString() : '—'}</Text>
				</div>
			</Stack>
		</PreviewDrawer>
	);
};
