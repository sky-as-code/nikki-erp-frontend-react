import { Badge, Divider, Drawer, Group, Stack, Text, Title } from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { KioskSetting } from '../../types';


export interface KioskSettingDetailDrawerProps {
	opened: boolean;
	onClose: () => void;
	setting: KioskSetting | undefined;
	isLoading?: boolean;
}

// eslint-disable-next-line max-lines-per-function
export const KioskSettingDetailDrawer: React.FC<KioskSettingDetailDrawerProps> = ({
	opened,
	onClose,
	setting,
	isLoading = false,
}) => {
	const { t: translate } = useTranslation();

	if (isLoading || !setting) {
		return (
			<Drawer
				opened={opened}
				onClose={onClose}
				position='right'
				size='md'
				title={<Title order={4}>{translate('nikki.vendingMachine.kioskSettings.detail.title')}</Title>}
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
			size='md'
			title={
				<Group gap='xs'>
					<IconSettings size={20} />
					<Title order={4}>{setting.name}</Title>
				</Group>
			}
			overlayProps={{ opacity: 0.5, blur: 4 }}
		>
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

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.kioskSettings.fields.category')}
					</Text>
					<Text size='sm'>{setting.category}</Text>
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.kioskSettings.fields.value')}
					</Text>
					<Text size='sm'><code>{setting.value}</code></Text>
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.kioskSettings.fields.status')}
					</Text>
					{getStatusBadge(setting.status)}
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.kioskSettings.fields.createdAt')}
					</Text>
					<Text size='sm'>{new Date(setting.createdAt).toLocaleString()}</Text>
				</div>
			</Stack>
		</Drawer>
	);
};

