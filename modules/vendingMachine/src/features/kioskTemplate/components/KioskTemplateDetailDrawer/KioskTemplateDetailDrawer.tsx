import { Badge, Divider, Drawer, Group, Stack, Text, Title } from '@mantine/core';
import { IconTemplate } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { KioskTemplate } from '../../types';


export interface KioskTemplateDetailDrawerProps {
	opened: boolean;
	onClose: () => void;
	template: KioskTemplate | undefined;
	isLoading?: boolean;
}

// eslint-disable-next-line max-lines-per-function
export const KioskTemplateDetailDrawer: React.FC<KioskTemplateDetailDrawerProps> = ({
	opened,
	onClose,
	template,
	isLoading = false,
}) => {
	const { t: translate } = useTranslation();

	if (isLoading || !template) {
		return (
			<Drawer
				opened={opened}
				onClose={onClose}
				position='right'
				size='md'
				title={<Title order={4}>{translate('nikki.vendingMachine.kioskTemplate.detail.title')}</Title>}
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
					<IconTemplate size={20} />
					<Title order={4}>{template.name}</Title>
				</Group>
			}
			overlayProps={{ opacity: 0.5, blur: 4 }}
		>
			<Stack gap='md'>
				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.kioskTemplate.fields.code')}
					</Text>
					<Text size='sm' fw={500}>{template.code}</Text>
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.kioskTemplate.fields.name')}
					</Text>
					<Text size='sm'>{template.name}</Text>
				</div>

				{template.description && (
					<>
						<Divider />
						<div>
							<Text size='sm' c='dimmed' mb='xs'>
								{translate('nikki.vendingMachine.kioskTemplate.fields.description')}
							</Text>
							<Text size='sm'>{template.description}</Text>
						</div>
					</>
				)}

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.kioskTemplate.fields.status')}
					</Text>
					{getStatusBadge(template.status)}
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.kioskTemplate.fields.createdAt')}
					</Text>
					<Text size='sm'>{new Date(template.createdAt).toLocaleString()}</Text>
				</div>
			</Stack>
		</Drawer>
	);
};

