import { Badge, Button, Divider, Drawer, Group, Stack, Text } from '@mantine/core';
import { IconSettings, IconExternalLink } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { Setting } from '../../types';

export interface SettingDetailDrawerProps {
	opened: boolean;
	onClose: () => void;
	setting: Setting | undefined;
	isLoading?: boolean;
}

// eslint-disable-next-line max-lines-per-function
export const SettingDetailDrawer: React.FC<SettingDetailDrawerProps> = ({
	opened,
	onClose,
	setting,
	isLoading = false,
}) => {
	const { t: translate } = useTranslation();
	const navigate = useNavigate();
	if (isLoading || !setting) {
		return (
			<Drawer
				opened={opened}
				onClose={onClose}
				position='right'
				size='lg'
				title={<Text fw={600} size='lg'>{translate('nikki.vendingMachine.settings.detail.title')}</Text>}
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
			size='lg'
			title={
				<Group gap='lg' justify='space-between' style={{ flex: 1 }} wrap='wrap'>
					<Group gap='xs'>
						<IconSettings size={20} />
						<Text fw={600} size='lg'>{setting.name}</Text>
					</Group>
					<Button
						size='xs'
						variant='light'
						leftSection={<IconExternalLink size={16} />}
						onClick={() => {
							navigate(`../settings/${setting.id}`);
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
						{translate('nikki.vendingMachine.settings.fields.code')}
					</Text>
					<Text size='sm' fw={500}>{setting.code}</Text>
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.settings.fields.name')}
					</Text>
					<Text size='sm'>{setting.name}</Text>
				</div>

				{setting.description && (
					<>
						<Divider />
						<div>
							<Text size='sm' c='dimmed' mb='xs'>
								{translate('nikki.vendingMachine.settings.fields.description')}
							</Text>
							<Text size='sm'>{setting.description}</Text>
						</div>
					</>
				)}

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.settings.fields.category')}
					</Text>
					<Text size='sm'>{setting.category}</Text>
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.settings.fields.value')}
					</Text>
					<Text size='sm'><code>{setting.value}</code></Text>
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.settings.fields.status')}
					</Text>
					{getStatusBadge(setting.status)}
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.settings.fields.createdAt')}
					</Text>
					<Text size='sm'>{new Date(setting.createdAt).toLocaleString()}</Text>
				</div>
			</Stack>
		</Drawer>
	);
};
