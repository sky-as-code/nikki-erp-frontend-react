/* eslint-disable max-lines-per-function */
import { Badge, Divider, Group, Stack, Text } from '@mantine/core';
import { IconTemplate } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { DetailActionBar } from '@/components/ActionBar';
import { PageContainer } from '@/components/PageContainer';
import { useKioskTemplateDetail } from '@/features/kioskTemplate';


export const KioskTemplateDetailPage: React.FC = () => {
	const { t: translate } = useTranslation();
	const { id } = useParams<{ id: string }>();
	const { template, isLoading } = useKioskTemplateDetail(id);

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
		{ title: translate('nikki.vendingMachine.kioskTemplate.title'), href: '../kiosk-template' },
		{ title: template?.name || translate('nikki.vendingMachine.kioskTemplate.detail.title'), href: '#' },
	];

	if (isLoading || !template) {
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
					<IconTemplate size={20} />
					<Text fw={600} size='lg'>{template.name}</Text>
				</Group>

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
		</PageContainer>
	);
};
