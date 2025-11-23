import {
	Badge,
	Divider,
	Group,
	Text,
} from '@mantine/core';
import { DetailDialog, DetailView } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';

import actionSchema from '../../features/actions/action-schema.json';
import { Action } from '../../features/actions/types';


interface ActionDetailModalProps {
	opened: boolean;
	onClose: () => void;
	action: Action | undefined;
	isLoading: boolean;
}

function ActionResourceSection({ action }: { action: Action }): React.ReactNode {
	return (
		<div>
			<Text size='sm' c='dimmed' mb='xs'>Resource</Text>
			{action.resource ? (
				<Badge color='blue' variant='light' size='sm'>
					{action.resource.name}
				</Badge>
			) : (
				<Text size='sm' c='dimmed'>No resource assigned</Text>
			)}
		</div>
	);
}

function ActionDetailContent({ action }: { action: Action }): React.ReactNode {
	const schema = actionSchema as ModelSchema;

	return (
		<>
			<DetailView
				schema={schema}
				data={action as unknown as Record<string, unknown>}
				excludeFields={['resourceId', 'entitlementsCount', 'resource']}
				showMetadata={false}
			/>

			<Divider />

			<ActionResourceSection action={action} />

			<Divider />

			<Group>
				<div style={{ flex: 1 }}>
					<Text size='sm' c='dimmed'>Created By</Text>
					<Text size='sm'>{action.createdBy}</Text>
				</div>
				<div style={{ flex: 1 }}>
					<Text size='sm' c='dimmed'>Created At</Text>
					<Text size='sm'>{new Date(action.createdAt).toLocaleString()}</Text>
				</div>
			</Group>

			<Group>
				<div style={{ flex: 1 }}>
					<Text size='sm' c='dimmed'>Updated At</Text>
					<Text size='sm'>{new Date(action.updatedAt).toLocaleString()}</Text>
				</div>
			</Group>
		</>
	);
}

export const ActionDetailModal: React.FC<ActionDetailModalProps> = ({
	opened,
	onClose,
	action,
	isLoading,
}) => {
	if (!action && !isLoading) {
		return null;
	}

	return (
		<DetailDialog
			opened={opened}
			onClose={onClose}
			title={action?.name || 'Action Details'}
			isLoading={isLoading}
		>
			{action && <ActionDetailContent action={action} />}
		</DetailDialog>
	);
};

