/* eslint-disable max-lines-per-function */
import { Badge, Divider, Group, Stack, Text } from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { DetailActionBar } from '@/components/ActionBar';
import { PageContainer } from '@/components/PageContainer';
import { useKioskSettingDetail } from '@/features/kioskSettings';


export const KioskSettingDetailPage: React.FC = () => {
	const { t: translate } = useTranslation();
	const { id } = useParams<{ id: string }>();
	const { setting, isLoading } = useKioskSettingDetail(id);

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
		{ title: translate('nikki.vendingMachine.menu.kiosk_settings'), href: '../kiosk-settings' },
		{ title: setting?.name || translate('nikki.vendingMachine.kioskSettings.detail.title'), href: '#' },
	];

	if (isLoading || !setting) {
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
					<IconSettings size={20} />
					<Text fw={600} size='lg'>{setting.name}</Text>
				</Group>

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
		</PageContainer>
	);
};
