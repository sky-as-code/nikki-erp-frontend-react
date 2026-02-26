/* eslint-disable max-lines-per-function */
import { Badge, Box, Button, Divider, Drawer, Group, Select, Stack, Text } from '@mantine/core';
import { IconBox, IconExternalLink } from '@tabler/icons-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { TrayConfiguration } from './TrayConfiguration';
import { KioskModel, KioskType, TrayConfiguration as TrayConfigurationType } from '../../types';


export interface KioskModelDetailDrawerProps {
	opened: boolean;
	onClose: () => void;
	model: KioskModel | undefined;
	isLoading?: boolean;
}

export const KioskModelDetailDrawer: React.FC<KioskModelDetailDrawerProps> = ({
	opened,
	onClose,
	model,
	isLoading = false,
}) => {
	const { t: translate } = useTranslation();
	const navigate = useNavigate();
	const [selectedKioskType, setSelectedKioskType] = useState<KioskType | undefined>(model?.kioskType);
	const [numberOfTrays, setNumberOfTrays] = useState<number>(model?.numberOfTrays || 0);
	const [trayConfigurations, setTrayConfigurations] =
		useState<TrayConfigurationType[]>(model?.trayConfigurations || []);

	React.useEffect(() => {
		if (model) {
			setSelectedKioskType(model.kioskType);
			setNumberOfTrays(model.numberOfTrays || 0);
			setTrayConfigurations(model.trayConfigurations || []);
		}
	}, [model]);

	if (isLoading || !model) {
		return (
			<Drawer
				opened={opened}
				onClose={onClose}
				position='right'
				size='lg'
				title={<Text fw={600} size='lg'>{translate('nikki.vendingMachine.kioskModels.detail.title')}</Text>}
			>
				<Text c='dimmed'>{translate('nikki.general.messages.loading')}</Text>
			</Drawer>
		);
	}

	const getStatusBadge = (status: string) => {
		const statusMap: Record<string, { color: string; label: string }> = {
			active: { color: 'green', label: translate('nikki.general.status.active') },
			inactive: { color: 'gray', label: translate('nikki.general.status.inactive') },
		};
		const statusInfo = statusMap[status] || { color: 'gray', label: status };
		return <Badge color={statusInfo.color}>{statusInfo.label}</Badge>;
	};


	return (
		<Drawer
			opened={opened}
			onClose={onClose}
			position='right'
			size='xl'
			title={
				<Group gap='lg' justify='space-between' style={{ flex: 1 }} wrap='wrap'>
					<Group gap='xs'>
						<IconBox size={20} />
						<Text fw={600} size='lg'>{model.name}</Text>
					</Group>
					<Button
						size='xs'
						variant='light'
						leftSection={<IconExternalLink size={16} />}
						onClick={() => {
							navigate(`../kiosk-model/${model.id}`);
							onClose();
						}}
					>
						{translate('nikki.general.actions.viewDetails')}
					</Button>
				</Group>
			}
			overlayProps={{ opacity: 0.5, blur: 4 }}
		>
			<Stack gap='md'>
				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.kioskModels.fields.code')}
					</Text>
					<Text size='sm' fw={500}>{model.code}</Text>
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.kioskModels.fields.name')}
					</Text>
					<Text size='sm'>{model.name}</Text>
				</div>

				{model.description && (
					<>
						<Divider />
						<div>
							<Text size='sm' c='dimmed' mb='xs'>
								{translate('nikki.vendingMachine.kioskModels.fields.description')}
							</Text>
							<Text size='sm'>{model.description}</Text>
						</div>
					</>
				)}

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.kioskModels.fields.status')}
					</Text>
					{getStatusBadge(model.status)}
				</div>

				<Divider />

				{/* Kiosk Type */}
				<div>
					<Text size='sm' c='dimmed' mb='xs' fw={500}>
						{translate('nikki.vendingMachine.kioskModels.fields.kioskType')}
					</Text>
					<Select
						value={selectedKioskType || null}
						onChange={(value) => setSelectedKioskType(value as KioskType | undefined)}
						placeholder={translate('nikki.vendingMachine.kioskModels.fields.kioskType')}
						data={[
							{ value: 'withoutElevator', label: translate('nikki.vendingMachine.kioskModels.kioskType.withoutElevator') },
							{ value: 'elevatorWithConveyor', label: translate('nikki.vendingMachine.kioskModels.kioskType.elevatorWithConveyor') },
							{ value: 'elevatorWithoutConveyor', label: translate('nikki.vendingMachine.kioskModels.kioskType.elevatorWithoutConveyor') },
						]}
						clearable
					/>
				</div>

				<Divider />

				{/* Tray Configuration */}
				<div>
					<TrayConfiguration
						numberOfTrays={numberOfTrays}
						trayConfigurations={trayConfigurations}
						onNumberOfTraysChange={setNumberOfTrays}
						onTrayConfigurationsChange={setTrayConfigurations}
					/>
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.kioskModels.fields.createdAt')}
					</Text>
					<Text size='sm'>{new Date(model.createdAt).toLocaleString()}</Text>
				</div>

				<Box h={50}></Box>
			</Stack>
		</Drawer>
	);
};

