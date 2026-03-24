import { Badge, Box, Divider, Stack, Text } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { type KioskModel } from '../../types';


export interface KioskModelBasicInfoProps {
	model: KioskModel;
}

export const KioskModelBasicInfo: React.FC<KioskModelBasicInfoProps> = ({ model }) => {
	const { t: translate } = useTranslation();

	const getStatusBadge = (status: string) => {
		const statusMap: Record<string, { color: string; label: string }> = {
			active: { color: 'green', label: translate('nikki.general.status.active') },
			inactive: { color: 'gray', label: translate('nikki.general.status.inactive') },
		};
		const statusInfo = statusMap[status] || { color: 'gray', label: status };
		return <Badge color={statusInfo.color}>{statusInfo.label}</Badge>;
	};

	return (
		<Stack gap='md'>
			<div>
				<Text size='sm' c='dimmed' mb='xs'>
					{translate('nikki.vendingMachine.kioskModels.fields.code')}
				</Text>
				<Box p='xs' style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 'var(--mantine-radius-sm)' }}>
					<Text size='sm' fw={500}>{model.code}</Text>
				</Box>
			</div>

			<Divider />

			<div>
				<Text size='sm' c='dimmed' mb='xs'>
					{translate('nikki.vendingMachine.kioskModels.fields.name')}
				</Text>
				<Box p='xs' style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 'var(--mantine-radius-sm)' }}>
					<Text size='sm'>{model.name}</Text>
				</Box>
			</div>

			{model.description && (
				<>
					<Divider />
					<div>
						<Text size='sm' c='dimmed' mb='xs'>
							{translate('nikki.vendingMachine.kioskModels.fields.description')}
						</Text>
						<Box p='xs' style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 'var(--mantine-radius-sm)' }}>
							<Text size='sm'>{model.description}</Text>
						</Box>
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
				<Text size='sm' c='dimmed' mb='xs'>
					{translate('nikki.vendingMachine.kioskModels.fields.createdAt')}
				</Text>
				<Text size='sm'>{new Date(model.createdAt).toLocaleString()}</Text>
			</div>
		</Stack>
	);
};
