import {
	Badge,
	Button,
	Card,
	Group,
	Progress,
	Stack,
	Table,
	Text,
	Title,
} from '@mantine/core';
import { AutoTable } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import { IconPackage, IconArrowRight } from '@tabler/icons-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { type LowStockAlert } from '@/features/kiosks/types';


interface KioskLowStockAlertProps {
	alerts: LowStockAlert[];
	detailLink?: string;
}

const lowStockAlertSchema: ModelSchema = {
	name: 'lowStockAlert',
	fields: {
		id: { type: 'string', label: '', hidden: true },
		kioskCode: { type: 'string', label: 'nikki.vendingMachine.overview.lowStock.kioskCode' },
		kioskName: { type: 'string', label: 'nikki.vendingMachine.overview.lowStock.kioskName' },
		stockRatio: { type: 'string', label: 'nikki.vendingMachine.overview.lowStock.stockRatio' },
		items: { type: 'string', label: 'nikki.vendingMachine.overview.lowStock.items' },
		status: { type: 'string', label: 'nikki.vendingMachine.overview.lowStock.status' },
	},
};

function renderKioskCodeColumn(row: Record<string, unknown>) {
	return (
		<Group gap='xs'>
			<IconPackage size={16} />
			<Text size='sm' fw={500}>
				{String(row.kioskCode || '')}
			</Text>
		</Group>
	);
}

function renderStockRatioColumn(row: Record<string, unknown>) {
	const stockRatio = (row.stockRatio as number) || 0;
	return (
		<Progress
			value={stockRatio * 100}
			color={stockRatio < 0.1 ? 'red' : stockRatio < 0.2 ? 'orange' : 'yellow'}
			size='sm'
		/>
	);
}

type AlertItem = {
	productId: string;
	productName: string;
	currentStock: number;
	maxStock: number;
};

function renderItemsColumn(row: Record<string, unknown>) {
	const items = (row.items as Array<AlertItem>) || [];
	return (
		<Stack gap={4}>
			{items.map((item) => (
				<Text key={item.productId} size='xs' c='dimmed'>
					{item.productName}: {item.currentStock}/{item.maxStock}
				</Text>
			))}
		</Stack>
	);
}

function renderStatusColumn(
	row: Record<string, unknown>,
	translate: (key: string) => string,
) {
	const stockRatio = (row.stockRatio as number) || 0;
	return (
		<Badge color={stockRatio < 0.1 ? 'red' : 'orange'} variant='light' size='sm'>
			{translate('nikki.vendingMachine.overview.lowStock.urgent')}
		</Badge>
	);
}


export function KioskLowStockAlert({ alerts, detailLink }: KioskLowStockAlertProps): React.ReactElement {
	const { t: translate } = useTranslation();

	const activeAlerts = useMemo(() => alerts.filter((a) => !a.restockedAt), [alerts]);

	const tableData = useMemo(() => activeAlerts.map((alert) => ({
		id: alert.id,
		kioskCode: alert.kioskCode,
		kioskName: alert.kioskName,
		stockRatio: alert.stockRatio,
		items: alert.items,
		status: alert.stockRatio,
	})), [activeAlerts]);

	return (
		<Card shadow='sm' padding='lg' radius='md' withBorder>
			<Stack gap='md'>
				<Group justify='space-between' align='flex-start'>
					<Title order={4}>
						{translate('nikki.vendingMachine.overview.lowStock.title')}
					</Title>
					<Group gap='xs'>
						<Badge color='orange' variant='light' size='lg'>
							{activeAlerts.length} {translate('nikki.vendingMachine.overview.lowStock.kioskOutOfStock')}
						</Badge>
						{detailLink && (
							<Button
								component={Link}
								to={detailLink}
								variant='light'
								size='sm'
								rightSection={<IconArrowRight size={16} />}
							>
								{translate('nikki.vendingMachine.overview.lowStock.viewDetails')}
							</Button>
						)}
					</Group>
				</Group>

				{tableData.length > 0 ? (
					<Table.ScrollContainer minWidth={800}>
						<AutoTable
							columns={['kioskCode', 'kioskName', 'stockRatio', 'items', 'status']}
							data={tableData}
							schema={lowStockAlertSchema}
							columnRenderers={{
								kioskCode: renderKioskCodeColumn,
								stockRatio: renderStockRatioColumn,
								items: renderItemsColumn,
								status: (row) => renderStatusColumn(row, translate),
							}}
						/>
					</Table.ScrollContainer>
				) : (
					<Text c='dimmed' ta='center' py='xl'>
						{translate('nikki.vendingMachine.overview.lowStock.noAlerts')}
					</Text>
				)}
			</Stack>
		</Card>
	);
}
