import {
	Badge,
	Button,
	Card,
	Group,
	Stack,
	Table,
	Text,
	Title,
} from '@mantine/core';
import { AutoTable } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import { IconHeadset, IconArrowRight } from '@tabler/icons-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { type SupportRequest } from '@/features/kiosks/types';


interface CustomerSupportRequestProps {
	requests: SupportRequest[];
	detailLink?: string;
}

const supportRequestSchema: ModelSchema = {
	name: 'supportRequest',
	fields: {
		id: { type: 'string', label: '', hidden: true },
		kioskCode: { type: 'string', label: 'nikki.vendingMachine.overview.support.kioskCode' },
		kioskName: { type: 'string', label: 'nikki.vendingMachine.overview.support.kioskName' },
		customer: { type: 'string', label: 'nikki.vendingMachine.overview.support.customer' },
		description: { type: 'string', label: 'nikki.vendingMachine.overview.support.description' },
		status: { type: 'string', label: 'nikki.vendingMachine.overview.support.status' },
	},
};

const getStatusColor = (status: string) => {
	switch (status) {
		case 'resolved':
			return 'green';
		case 'in_progress':
			return 'blue';
		case 'pending':
			return 'orange';
		default:
			return 'gray';
	}
};

function renderKioskCodeColumn(row: Record<string, unknown>) {
	return (
		<Group gap='xs'>
			<IconHeadset size={16} />
			<Text size='sm' fw={500}>
				{String(row.kioskCode || '')}
			</Text>
		</Group>
	);
}

function renderCustomerColumn(row: Record<string, unknown>) {
	return (
		<Stack gap={2}>
			<Text size='sm' fw={500}>
				{String(row.customerName || '')}
			</Text>
			<Text size='xs' c='dimmed'>
				{String(row.customerPhone || '')}
			</Text>
		</Stack>
	);
}

function renderDescriptionColumn(row: Record<string, unknown>) {
	return (
		<Text size='sm' lineClamp={2}>
			{String(row.description || '')}
		</Text>
	);
}

function renderStatusColumn(
	row: Record<string, unknown>,
	translate: (key: string) => string,
) {
	const status = String(row.status || '');
	return (
		<Badge color={getStatusColor(status)} variant='light' size='sm'>
			{translate(`nikki.vendingMachine.overview.support.statusLabels.${status}`)}
		</Badge>
	);
}


export function CustomerSupportRequest({ requests, detailLink }: CustomerSupportRequestProps): React.ReactElement {
	const { t: translate } = useTranslation();

	const pendingCount = requests.filter((r) => r.status === 'pending').length;
	const inProgressCount = requests.filter((r) => r.status === 'in_progress').length;
	const resolvedCount = requests.filter((r) => r.status === 'resolved').length;

	const tableData = useMemo(() => requests
		.filter((r) => r.status !== 'resolved')
		.slice(0, 10)
		.map((request) => ({
			id: request.id,
			kioskCode: request.kioskCode,
			kioskName: request.kioskName,
			customerName: request.customerName,
			customerPhone: request.customerPhone,
			description: request.description,
			status: request.status,
		})), [requests]);

	return (
		<Card shadow='sm' padding='lg' radius='md' withBorder>
			<Stack gap='md'>
				<Group justify='space-between' align='flex-start'>
					<Title order={4}>
						{translate('nikki.vendingMachine.overview.support.title')}
					</Title>
					<Group gap='xs'>
						<Badge color='orange' variant='light'>
							{pendingCount} {translate('nikki.vendingMachine.overview.support.pending')}
						</Badge>
						<Badge color='blue' variant='light'>
							{inProgressCount} {translate('nikki.vendingMachine.overview.support.inProgress')}
						</Badge>
						<Badge color='green' variant='light'>
							{resolvedCount} {translate('nikki.vendingMachine.overview.support.resolved')}
						</Badge>
						{detailLink && (
							<Button
								component={Link}
								to={detailLink}
								variant='light'
								size='sm'
								rightSection={<IconArrowRight size={16} />}
							>
								{translate('nikki.vendingMachine.overview.support.viewDetails')}
							</Button>
						)}
					</Group>
				</Group>

				{tableData.length > 0 ? (
					<Table.ScrollContainer minWidth={800}>
						<AutoTable
							columns={['kioskCode', 'kioskName', 'customer', 'description', 'status']}
							data={tableData}
							schema={supportRequestSchema}
							columnRenderers={{
								kioskCode: renderKioskCodeColumn,
								customer: renderCustomerColumn,
								description: renderDescriptionColumn,
								status: (row) => renderStatusColumn(row, translate),
							}}
						/>
					</Table.ScrollContainer>
				) : (
					<Text c='dimmed' ta='center' py='xl'>
						{translate('nikki.vendingMachine.overview.support.noRequests')}
					</Text>
				)}
			</Stack>
		</Card>
	);
}
