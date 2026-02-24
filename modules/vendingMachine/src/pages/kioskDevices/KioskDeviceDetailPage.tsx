/* eslint-disable max-lines-per-function */
import { Badge, Button, Divider, Group, Stack, Table, Text, TextInput } from '@mantine/core';
import { IconDeviceDesktop, IconPlus, IconTrash } from '@tabler/icons-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { DetailActionBar } from '@/components/ActionBar';
import { PageContainer } from '@/components/PageContainer';
import { useKioskDeviceDetail } from '@/features/kioskDevices';
import { KioskDeviceSpecification } from '@/features/kioskDevices/types';


export const KioskDeviceDetailPage: React.FC = () => {
	const { t: translate } = useTranslation();
	const { id } = useParams<{ id: string }>();
	const { kioskDevice, isLoading } = useKioskDeviceDetail(id);
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

	const breadcrumbs = [
		{ title: translate('nikki.vendingMachine.title'), href: '../overview' },
		{ title: translate('nikki.vendingMachine.menu.device'), href: '../kiosk-devices' },
		{ title: kioskDevice?.name || translate('nikki.vendingMachine.device.detail.title'), href: '#' },
	];

	if (isLoading || !kioskDevice) {
		return (
			<PageContainer
				breadcrumbs={breadcrumbs}
				actionBar={<div />}
			>
				<Text c='dimmed'>{translate('nikki.general.messages.loading')}</Text>
			</PageContainer>
		);
	}

	return (
		<PageContainer
			breadcrumbs={breadcrumbs}
			actionBar={<DetailActionBar
				onSave={() => {}}
				onGoBack={() => {}}
				onDelete={() => {}}
			/>}
		>
			<Stack gap='md'>
				<Group gap='xs' mb='md'>
					<IconDeviceDesktop size={20} />
					<Text fw={600} size='lg'>{kioskDevice.name}</Text>
				</Group>

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.device.fields.code')}
					</Text>
					<Text size='sm' fw={500}>{kioskDevice.code}</Text>
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.device.fields.name')}
					</Text>
					<Text size='sm'>{kioskDevice.name}</Text>
				</div>

				{kioskDevice.description && (
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
					{getStatusBadge(kioskDevice.status)}
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.device.fields.deviceType')}
					</Text>
					{getDeviceTypeBadge(kioskDevice.deviceType)}
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
					<Text size='sm'>{new Date(kioskDevice.createdAt).toLocaleString()}</Text>
				</div>
			</Stack>
		</PageContainer>
	);
};
