/* eslint-disable max-lines-per-function */
import { Badge, Box, Button, Divider, Drawer, Group, Select, Stack, Text } from '@mantine/core';
import { IconBox, IconExternalLink } from '@tabler/icons-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { TrayConfiguration } from './TrayConfiguration';
import { useKioskModelDetail } from '../../hooks/useKioskModelDetail';
import { KioskType, TrayConfiguration as TrayConfigurationType } from '../../types';


export interface KioskModelDetailDrawerProps {
	opened: boolean;
	onClose: () => void;
	modelId: string;
}

function shelvesConfigToTrayConfigurations(config?: Record<string, any>): TrayConfigurationType[] {
	if (!config) return [];
	if (Array.isArray(config.trays)) return config.trays;
	return [];
}

export const KioskModelDetailDrawer: React.FC<KioskModelDetailDrawerProps> = ({
	opened,
	onClose,
	modelId,
}) => {
	const { t: translate } = useTranslation();
	const navigate = useNavigate();
	const { model, isLoading } = useKioskModelDetail(modelId);

	const [selectedKioskType, setSelectedKioskType] = useState<KioskType | undefined>(model?.kioskType);
	const [shelvesNumber, setShelvesNumber] = useState<number>(model?.shelvesNumber || 0);
	const [trayConfigurations, setTrayConfigurations] =
		useState<TrayConfigurationType[]>(shelvesConfigToTrayConfigurations(model?.shelvesConfig));

	React.useEffect(() => {
		if (model) {
			setSelectedKioskType(model.kioskType);
			setShelvesNumber(model.shelvesNumber || 0);
			setTrayConfigurations(shelvesConfigToTrayConfigurations(model.shelvesConfig));
		}
	}, [model]);

	if (isLoading || !model) {
		return (
			<Drawer
				opened={opened}
				onClose={onClose}
				position='right'
				size='xl'
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
			deleted: { color: 'red', label: translate('nikki.general.status.deleted') },
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
							navigate(`../kiosk-models/${model.id}`);
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
						{translate('nikki.vendingMachine.kioskModels.fields.referenceCode')}
					</Text>
					<Text size='sm' fw={500}>{model.referenceCode}</Text>
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

				<div>
					<Text size='sm' c='dimmed' mb='xs' fw={500}>
						{translate('nikki.vendingMachine.kioskModels.fields.kioskType')}
					</Text>
					<Select
						value={selectedKioskType || null}
						onChange={(value) => setSelectedKioskType(value as KioskType | undefined)}
						placeholder={translate('nikki.vendingMachine.kioskModels.fields.kioskType')}
						data={[
							{ value: 'non-elevator', label: translate('nikki.vendingMachine.kioskModels.kioskType.nonElevator') },
							{ value: 'elevator', label: translate('nikki.vendingMachine.kioskModels.kioskType.elevator') },
						]}
						clearable
					/>
				</div>

				<Divider />

				<div>
					<TrayConfiguration
						numberOfTrays={shelvesNumber}
						trayConfigurations={trayConfigurations}
						onNumberOfTraysChange={setShelvesNumber}
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
