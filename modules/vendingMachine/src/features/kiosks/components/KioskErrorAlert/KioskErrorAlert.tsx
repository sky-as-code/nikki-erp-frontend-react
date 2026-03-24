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
import {
	IconAlertCircle,
	IconCheck,
	IconClock,
	IconArrowRight,
} from '@tabler/icons-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { ErrorStatus, type KioskError } from '@/features/kiosks/types';


interface KioskErrorAlertProps {
	errors: KioskError[];
	detailLink?: string;
}

const kioskErrorSchema: ModelSchema = {
	name: 'kioskError',
	fields: {
		id: { type: 'string', label: '', hidden: true },
		kioskCode: { type: 'string', label: 'nikki.vendingMachine.overview.errorAlerts.kioskCode' },
		kioskName: { type: 'string', label: 'nikki.vendingMachine.overview.errorAlerts.kioskName' },
		severity: { type: 'string', label: 'nikki.vendingMachine.overview.errorAlerts.severity' },
		description: { type: 'string', label: 'nikki.vendingMachine.overview.errorAlerts.description' },
		status: { type: 'string', label: 'nikki.vendingMachine.overview.errorAlerts.status' },
	},
};

const getSeverityColor = (severity: string) => {
	switch (severity) {
		case 'critical':
			return 'red';
		case 'high':
			return 'orange';
		case 'medium':
			return 'yellow';
		case 'low':
			return 'blue';
		default:
			return 'gray';
	}
};

const getStatusIcon = (status: ErrorStatus) => {
	switch (status) {
		case ErrorStatus.RESOLVED:
			return <IconCheck size={16} />;
		case ErrorStatus.IN_PROGRESS:
			return <IconClock size={16} />;
		case ErrorStatus.PENDING:
			return <IconAlertCircle size={16} />;
		default:
			return null;
	}
};

const getStatusColor = (status: ErrorStatus) => {
	switch (status) {
		case ErrorStatus.RESOLVED:
			return 'green';
		case ErrorStatus.IN_PROGRESS:
			return 'blue';
		case ErrorStatus.PENDING:
			return 'red';
		default:
			return 'gray';
	}
};

function renderKioskCodeColumn(
	row: Record<string, unknown>,
	getStatusIcon: (status: ErrorStatus) => React.ReactNode,
) {
	const status = row.status as ErrorStatus;
	return (
		<Group gap='xs'>
			{getStatusIcon(status)}
			<Text size='sm' fw={500}>
				{String(row.kioskCode || '')}
			</Text>
		</Group>
	);
}

function renderSeverityColumn(row: Record<string, unknown>) {
	const severity = String(row.severity || '');
	return (
		<Badge color={getSeverityColor(severity)} variant='light' size='sm'>
			{severity}
		</Badge>
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
	const status = row.status as ErrorStatus;
	return (
		<Badge color={getStatusColor(status)} variant='light' size='sm'>
			{translate(`nikki.vendingMachine.overview.error.status.${status}`)}
		</Badge>
	);
}


export function KioskErrorAlert({ errors, detailLink }: KioskErrorAlertProps): React.ReactElement {
	const { t: translate } = useTranslation();

	const totalErrors = errors.length;
	const resolvedErrors = errors.filter((e) => e.status === ErrorStatus.RESOLVED).length;
	const pendingErrors = errors.filter((e) => e.status === ErrorStatus.PENDING).length;
	const inProgressErrors = errors.filter((e) => e.status === ErrorStatus.IN_PROGRESS).length;

	const tableData = useMemo(() => errors
		.filter((e) => e.status !== ErrorStatus.RESOLVED)
		.slice(0, 10)
		.map((error) => ({
			id: error.id,
			kioskCode: error.kioskCode,
			kioskName: error.kioskName,
			severity: error.severity,
			description: error.description,
			status: error.status,
		})), [errors]);

	return (
		<Card shadow='sm' padding='lg' radius='md' withBorder>
			<Stack gap='md'>
				<Group justify='space-between' align='flex-start'>
					<Title order={4}>
						{translate('nikki.vendingMachine.overview.errorAlerts.title')}
					</Title>
					<Group gap='xs'>
						<Badge color='red' variant='light'>
							{pendingErrors} {translate('nikki.vendingMachine.overview.errorAlerts.pending')}
						</Badge>
						<Badge color='blue' variant='light'>
							{inProgressErrors} {translate('nikki.vendingMachine.overview.errorAlerts.inProgress')}
						</Badge>
						<Badge color='green' variant='light'>
							{resolvedErrors}/{totalErrors} {translate('nikki.vendingMachine.overview.errorAlerts.resolved')}
						</Badge>
						{detailLink && (
							<Button
								component={Link}
								to={detailLink}
								variant='light'
								size='sm'
								rightSection={<IconArrowRight size={16} />}
							>
								{translate('nikki.vendingMachine.overview.errorAlerts.viewDetails')}
							</Button>
						)}
					</Group>
				</Group>

				{tableData.length > 0 ? (
					<Table.ScrollContainer minWidth={800}>
						<AutoTable
							columns={['kioskCode', 'kioskName', 'severity', 'description', 'status']}
							data={tableData}
							schema={kioskErrorSchema}
							columnRenderers={{
								kioskCode: (row) => renderKioskCodeColumn(row, getStatusIcon),
								severity: renderSeverityColumn,
								description: renderDescriptionColumn,
								status: (row) => renderStatusColumn(row, translate),
							}}
						/>
					</Table.ScrollContainer>
				) : (
					<Text c='dimmed' ta='center' py='xl'>
						{translate('nikki.vendingMachine.overview.errorAlerts.noErrors')}
					</Text>
				)}
			</Stack>
		</Card>
	);
}
