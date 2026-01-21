import {
	ActionIcon,
	Badge,
	Group,
	Text,
	Tooltip,
} from '@mantine/core';
import { AutoTable, AutoTableProps } from '@nikkierp/ui/components';
import { IconEye, IconTrash } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { GrantRequest } from '@/features/grantRequests';


export interface GrantRequestTableProps extends AutoTableProps {
	onViewDetail: (requestId: string) => void;
	onDelete: (requestId: string) => void;
}

const statusColors: Record<GrantRequest['status'], string> = {
	pending: 'yellow',
	approved: 'green',
	rejected: 'red',
	cancelled: 'gray',
};

function renderRequestorColumn(row: Record<string, unknown>) {
	const requestor = row.requestor as { name: string };
	return <Text size='sm' fw={500}>{requestor.name}</Text>;
}

function renderReceiverColumn(row: Record<string, unknown>) {
	const receiver = row.receiver as { name: string };
	return <Text size='sm'>{receiver.name}</Text>;
}

function renderTargetColumn(row: Record<string, unknown>) {
	const target = row.target as { name?: string; id?: string } | undefined;
	const targetType = row.targetType as string;
	return (
		<Group gap={4}>
			<Badge color='violet' variant='light' size='sm'>
				{targetType}
			</Badge>
			<Text size='sm'>{target?.name || target?.id}</Text>
		</Group>
	);
}

function renderStatusColumn(row: Record<string, unknown>) {
	const status = row.status as GrantRequest['status'];
	return (
		<Badge color={statusColors[status] || 'gray'} variant='light'>
			{status}
		</Badge>
	);
}

function renderOrgDisplayNameColumn(row: Record<string, unknown>) {
	const orgDisplayName = row.orgDisplayName as string | undefined;
	return <Text>{orgDisplayName || '-'}</Text>;
}

function renderActionsColumn(
	row: Record<string, unknown>,
	onViewDetail: (requestId: string) => void,
	onDelete: (requestId: string) => void,
	translate: (key: string) => string,
) {
	const requestId = row.id as string;
	return (
		<Group gap='xs' justify='flex-end'>
			<Tooltip label={translate('nikki.general.actions.view')}>
				<ActionIcon
					variant='subtle'
					color='gray'
					onClick={() => onViewDetail(requestId)}
				>
					<IconEye size={16} />
				</ActionIcon>
			</Tooltip>
			<Tooltip label={translate('nikki.general.actions.delete')}>
				<ActionIcon
					variant='subtle'
					color='red'
					onClick={() => onDelete(requestId)}
				>
					<IconTrash size={16} />
				</ActionIcon>
			</Tooltip>
		</Group>
	);
}

export const GrantRequestTable: React.FC<GrantRequestTableProps> = ({
	columns,
	data,
	isLoading,
	schema,
	onViewDetail,
	onDelete,
}) => {
	const { t: translate } = useTranslation();
	return (
		<AutoTable
			columns={columns}
			data={data}
			schema={schema}
			isLoading={isLoading}
			columnRenderers={{
				requestor: (row) => renderRequestorColumn(row),
				receiver: (row) => renderReceiverColumn(row),
				target: (row) => renderTargetColumn(row),
				status: (row) => renderStatusColumn(row),
				orgDisplayName: (row) => renderOrgDisplayNameColumn(row),
				actions: (row) => renderActionsColumn(row, onViewDetail, onDelete, translate),
			}}
		/>
	);
};