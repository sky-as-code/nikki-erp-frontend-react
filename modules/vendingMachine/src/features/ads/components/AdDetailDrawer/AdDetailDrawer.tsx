import { Badge, Divider, Drawer, Group, Stack, Text, Title } from '@mantine/core';
import { IconAd } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Ad } from '../../types';


export interface AdDetailDrawerProps {
	opened: boolean;
	onClose: () => void;
	ad: Ad | undefined;
	isLoading?: boolean;
}

// eslint-disable-next-line max-lines-per-function
export const AdDetailDrawer: React.FC<AdDetailDrawerProps> = ({
	opened,
	onClose,
	ad,
	isLoading = false,
}) => {
	const { t: translate } = useTranslation();

	if (isLoading || !ad) {
		return (
			<Drawer
				opened={opened}
				onClose={onClose}
				position='right'
				size='md'
				title={<Title order={4}>{translate('nikki.vendingMachine.ads.detail.title')}</Title>}
			>
				<Text c='dimmed'>{translate('nikki.general.messages.loading')}</Text>
			</Drawer>
		);
	}

	const getStatusBadge = (status: string) => {
		const statusMap: Record<string, { color: string; label: string }> = {
			active: { color: 'green', label: translate('nikki.general.status.active') },
			inactive: { color: 'gray', label: translate('nikki.general.status.inactive') },
			expired: { color: 'red', label: translate('nikki.vendingMachine.ads.status.expired') },
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
					<IconAd size={20} />
					<Title order={4}>{ad.name}</Title>
				</Group>
			}
			overlayProps={{ opacity: 0.5, blur: 4 }}
		>
			<Stack gap='md'>
				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.ads.fields.code')}
					</Text>
					<Text size='sm' fw={500}>{ad.code}</Text>
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.ads.fields.name')}
					</Text>
					<Text size='sm'>{ad.name}</Text>
				</div>

				{ad.description && (
					<>
						<Divider />
						<div>
							<Text size='sm' c='dimmed' mb='xs'>
								{translate('nikki.vendingMachine.ads.fields.description')}
							</Text>
							<Text size='sm'>{ad.description}</Text>
						</div>
					</>
				)}

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.ads.fields.status')}
					</Text>
					{getStatusBadge(ad.status)}
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.ads.fields.startDate')}
					</Text>
					<Text size='sm'>{new Date(ad.startDate).toLocaleString()}</Text>
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.ads.fields.endDate')}
					</Text>
					<Text size='sm'>{new Date(ad.endDate).toLocaleString()}</Text>
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.ads.fields.createdAt')}
					</Text>
					<Text size='sm'>{new Date(ad.createdAt).toLocaleString()}</Text>
				</div>
			</Stack>
		</Drawer>
	);
};

