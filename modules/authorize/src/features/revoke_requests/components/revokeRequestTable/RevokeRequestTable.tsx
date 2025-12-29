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



export interface RevokeRequestTableProps extends AutoTableProps {
	onViewDetail: (requestId: string) => void;
	onDelete: (requestId: string) => void;
}

function renderRequestorColumn(row: Record<string, unknown>) {
	const requestor = row.requestor as { name?: string } | undefined;
	const requestorName = row.requestorName as string | undefined;
	const requestorId = row.requestorId as string | undefined;
	return <Text size='sm' fw={500}>{requestor?.name || requestorName || requestorId}</Text>;
}

function renderReceiverColumn(row: Record<string, unknown>) {
	const receiver = row.receiver as { name?: string } | undefined;
	const receiverName = row.receiverName as string | undefined;
	const receiverId = row.receiverId as string | undefined;
	return <Text size='sm'>{receiver?.name || receiverName || receiverId}</Text>;
}

function renderTargetColumn(row: Record<string, unknown>, translate: (key: string) => string) {
	const target = row.target as { name?: string } | undefined;
	const targetRef = row.targetRef as string | undefined;
	const targetName = row.targetName as string | undefined;
	const targetType = row.targetType as string | undefined;
	return (
		<Group gap={4}>
			<Badge color='violet' variant='light' size='sm'>
				{targetType ? translate(`nikki.authorize.grant_request.fields.target_type_${targetType}`) : ''}
			</Badge>
			<Text size='sm'>{target?.name || targetName || targetRef}</Text>
		</Group>
	);
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

export const RevokeRequestTable: React.FC<RevokeRequestTableProps> = ({
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
				requestorName: (row) => renderRequestorColumn(row),
				receiverName: (row) => renderReceiverColumn(row),
				targetName: (row) => renderTargetColumn(row, translate),
				actions: (row) => renderActionsColumn(row, onViewDetail, onDelete, translate),
			}}
		/>
	);
};

