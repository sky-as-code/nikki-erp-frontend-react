/* eslint-disable max-lines-per-function */
import { Badge, Box, Divider, Group, Select, Stack, Text } from '@mantine/core';
import { IconBox } from '@tabler/icons-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { DetailControlPanel } from '@/components/ControlPanel';
import { PageContainer } from '@/components/PageContainer';
import { useKioskModelDetail } from '@/features/kioskModels';
import { TrayConfiguration } from '@/features/kioskModels/components/KioskModelDetailDrawer/TrayConfiguration';
import { KioskType, TrayConfiguration as TrayConfigurationType } from '@/features/kioskModels/types';


export const KioskModelDetailPage: React.FC = () => {
	const { t: translate } = useTranslation();
	const { id } = useParams<{ id: string }>();
	const { model, isLoading } = useKioskModelDetail(id);
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

	const getStatusBadge = (status: string) => {
		const statusMap: Record<string, { color: string; label: string }> = {
			active: { color: 'green', label: translate('nikki.general.status.active') },
			inactive: { color: 'gray', label: translate('nikki.general.status.inactive') },
		};
		const statusInfo = statusMap[status] || { color: 'gray', label: status };
		return <Badge color={statusInfo.color}>{statusInfo.label}</Badge>;
	};

	const breadcrumbs = [
		{ title: translate('nikki.vendingMachine.title'), href: '../overview' },
		{ title: translate('nikki.vendingMachine.kioskModels.title'), href: '../kiosk-model' },
		{ title: model?.name || translate('nikki.vendingMachine.kioskModels.detail.title'), href: '#' },
	];

	if (isLoading || !model) {
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
			actionBar={<DetailControlPanel
				onSave={() => {}}
				onGoBack={() => {}}
				onDelete={() => {}}
			/>}
		>
			<Stack gap='lg'>
				<Group gap='xs' mb='md'>
					<IconBox size={24} />
					<Text fw={600} size='xl'>{model.name}</Text>
				</Group>

				{/* Basic Information Section */}
				<Stack gap='md'>
					<Text size='md' fw={600} c='dimmed'>
						{translate('nikki.vendingMachine.kioskModels.sections.basicInfo')}
					</Text>

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
				</Stack>

				<Divider />

				{/* Configuration Section */}
				<Stack gap='md'>
					<Text size='md' fw={600} c='dimmed'>
						{translate('nikki.vendingMachine.kioskModels.sections.configuration')}
					</Text>

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
				</Stack>

				<Divider />

				{/* Tray Configuration Section */}
				<Stack gap='md'>
					<Text size='md' fw={600} c='dimmed'>
						{translate('nikki.vendingMachine.kioskModels.sections.trayConfiguration')}
					</Text>
					<TrayConfiguration
						numberOfTrays={numberOfTrays}
						trayConfigurations={trayConfigurations}
						onNumberOfTraysChange={setNumberOfTrays}
						onTrayConfigurationsChange={setTrayConfigurations}
					/>
				</Stack>

				<Divider />

				{/* Metadata Section */}
				<Stack gap='md'>
					<Text size='md' fw={600} c='dimmed'>
						{translate('nikki.vendingMachine.kioskModels.sections.metadata')}
					</Text>
					<div>
						<Text size='sm' c='dimmed' mb='xs'>
							{translate('nikki.vendingMachine.kioskModels.fields.createdAt')}
						</Text>
						<Text size='sm'>{new Date(model.createdAt).toLocaleString()}</Text>
					</div>
				</Stack>

				<Box h={50}></Box>
			</Stack>
		</PageContainer>
	);
};
