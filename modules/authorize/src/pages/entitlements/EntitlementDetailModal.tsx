import {
	Badge,
	Divider,
	Group,
	Text,
} from '@mantine/core';
import { DetailDialog, DetailView } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';

import entitlementSchema from '../../features/entitlements/entitlement-schema.json';
import { Entitlement } from '../../features/entitlements/types';


interface EntitlementDetailModalProps {
	opened: boolean;
	onClose: () => void;
	entitlement: Entitlement | undefined;
	isLoading: boolean;
}

function EntitlementRelationsSection({ entitlement }: { entitlement: Entitlement }): React.ReactNode {
	return (
		<>
			<div>
				<Text size='sm' c='dimmed' mb='xs'>Action</Text>
				{entitlement.action ? (
					<Badge color='blue' variant='light' size='sm'>
						{entitlement.action.name}
					</Badge>
				) : (
					<Text size='sm' c='dimmed'>No action assigned</Text>
				)}
			</div>
			<div>
				<Text size='sm' c='dimmed' mb='xs'>Resource</Text>
				{entitlement.resource ? (
					<Badge color='green' variant='light' size='sm'>
						{entitlement.resource.name}
					</Badge>
				) : (
					<Text size='sm' c='dimmed'>No resource assigned</Text>
				)}
			</div>
		</>
	);
}

function EntitlementDetailContent({ entitlement }: { entitlement: Entitlement }): React.ReactNode {
	const schema = entitlementSchema as ModelSchema;

	return (
		<>
			<DetailView
				schema={schema}
				data={entitlement as unknown as Record<string, unknown>}
				excludeFields={['actionId', 'resourceId', 'assignmentsCount', 'rolesCount', 'action', 'resource']}
				showMetadata={false}
			/>

			<Divider />

			<EntitlementRelationsSection entitlement={entitlement} />

			<Divider />

			<Group>
				<div style={{ flex: 1 }}>
					<Text size='sm' c='dimmed'>Created By</Text>
					<Text size='sm'>{entitlement.createdBy}</Text>
				</div>
				<div style={{ flex: 1 }}>
					<Text size='sm' c='dimmed'>Created At</Text>
					<Text size='sm'>{new Date(entitlement.createdAt).toLocaleString()}</Text>
				</div>
			</Group>

			<Group>
				<div style={{ flex: 1 }}>
					<Text size='sm' c='dimmed'>Updated At</Text>
					<Text size='sm'>{new Date(entitlement.updatedAt).toLocaleString()}</Text>
				</div>
			</Group>
		</>
	);
}

export const EntitlementDetailModal: React.FC<EntitlementDetailModalProps> = ({
	opened,
	onClose,
	entitlement,
	isLoading,
}) => {
	if (!entitlement && !isLoading) {
		return null;
	}

	return (
		<DetailDialog
			opened={opened}
			onClose={onClose}
			title={entitlement?.name || 'Entitlement Details'}
			isLoading={isLoading}
		>
			{entitlement && <EntitlementDetailContent entitlement={entitlement} />}
		</DetailDialog>
	);
};

