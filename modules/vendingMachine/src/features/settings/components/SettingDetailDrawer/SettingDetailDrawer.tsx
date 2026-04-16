import { Badge, Divider, Stack, Text } from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { PreviewDrawer } from '@/components/PreviewDrawer';

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

	const getStatusBadge = (status: string) => {
		const statusMap: Record<string, { color: string; label: string }> = {
			active: { color: 'green', label: translate('nikki.general.status.active') },
			inactive: { color: 'gray', label: translate('nikki.general.status.inactive') },
		};
		const statusInfo = statusMap[status] || { color: 'gray', label: status };
		return <Badge color={statusInfo.color}>{statusInfo.label}</Badge>;
	};

	return (
		<PreviewDrawer
			opened={opened}
			onClose={onClose}
			header={{
				title: setting?.name,
				subtitle: setting?.code,
				avatar: <IconSettings size={20} />,
			}}
			onViewDetails={() => {
				if (setting?.id) {
					navigate(`../settings/${setting.id}`);
				}
				onClose();
			}}
			isLoading={isLoading}
			isNotFound={!setting && !isLoading}
			drawerProps={{ size: 'lg', opened, onClose }}
		>
			<Stack gap='md'>
				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.settings.fields.code')}
					</Text>
					<Text size='sm' fw={500}>{setting?.code}</Text>
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.settings.fields.name')}
					</Text>
					<Text size='sm'>{setting?.name}</Text>
				</div>

				{setting?.description && (
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
					<Text size='sm'>{setting?.category}</Text>
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.settings.fields.value')}
					</Text>
					<Text size='sm'><code>{setting?.value}</code></Text>
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.settings.fields.status')}
					</Text>
					{setting?.status ? getStatusBadge(setting.status) : null}
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.settings.fields.createdAt')}
					</Text>
					<Text size='sm'>{setting?.createdAt ? new Date(setting.createdAt).toLocaleString() : '—'}</Text>
				</div>
			</Stack>
		</PreviewDrawer>
	);
};
