import { Badge, Divider, Stack, Text } from '@mantine/core';
import { TFunction } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { KioskSetting } from '../../types';


export const getStatusBadge = (status: string, translate: TFunction) => {
	const statusMap: Record<string, { color: string; label: string }> = {
		active: { color: 'green', label: translate('nikki.general.status.active') },
		inactive: { color: 'gray', label: translate('nikki.general.status.inactive') },
	};
	const info = statusMap[status] || { color: 'gray', label: status };
	return <Badge color={info.color}>{info.label}</Badge>;
};

export type KioskSettingDetailBasicInfoProps = {
	setting: KioskSetting;
	isEditing?: boolean;
};

export const KioskSettingDetailBasicInfo: React.FC<KioskSettingDetailBasicInfoProps> = ({
	setting,
}) => {
	const { t: translate } = useTranslation();

	return (
		<Stack gap='md'>
			<div>
				<Text size='sm' c='dimmed' mb='xs'>
					{translate('nikki.vendingMachine.kioskSettings.fields.code')}
				</Text>
				<Text size='sm' fw={500}>{setting.code}</Text>
			</div>

			<Divider />

			<div>
				<Text size='sm' c='dimmed' mb='xs'>
					{translate('nikki.vendingMachine.kioskSettings.fields.name')}
				</Text>
				<Text size='sm'>{setting.name}</Text>
			</div>

			{setting.description && (
				<>
					<Divider />
					<div>
						<Text size='sm' c='dimmed' mb='xs'>
							{translate('nikki.vendingMachine.kioskSettings.fields.description')}
						</Text>
						<Text size='sm'>{setting.description}</Text>
					</div>
				</>
			)}

			{setting.brand && (
				<>
					<Divider />
					<div>
						<Text size='sm' c='dimmed' mb='xs'>
							{translate('nikki.vendingMachine.kioskSettings.fields.brand')}
						</Text>
						<Text size='sm'>{setting.brand}</Text>
					</div>
				</>
			)}

			<Divider />

			<div>
				<Text size='sm' c='dimmed' mb='xs'>
					{translate('nikki.vendingMachine.kioskSettings.fields.status')}
				</Text>
				{getStatusBadge(setting.status, translate)}
			</div>

			<Divider />

			<div>
				<Text size='sm' c='dimmed' mb='xs'>
					{translate('nikki.vendingMachine.kioskSettings.fields.createdAt')}
				</Text>
				<Text size='sm'>{new Date(setting.createdAt).toLocaleString()}</Text>
			</div>
		</Stack>
	);
};
