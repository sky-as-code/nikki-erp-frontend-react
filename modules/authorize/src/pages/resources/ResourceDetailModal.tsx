import {
	Badge,
	Divider,
	Group,
	Text,
} from '@mantine/core';
import { DetailDialog, DetailView } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';

import resourceSchema from '../../features/resources/resource-schema.json';
import { Resource, ResourceType, ScopeType } from '../../features/resources/types';


const resourceTypeColors: Record<ResourceType, string> = {
	[ResourceType.NIKKI_APPLICATION]: 'blue',
	[ResourceType.CUSTOM]: 'grape',
};

const scopeTypeColors: Record<ScopeType, string> = {
	[ScopeType.DOMAIN]: 'red',
	[ScopeType.ORG]: 'cyan',
	[ScopeType.HIERARCHY]: 'teal',
	[ScopeType.PRIVATE]: 'gray',
};

interface ResourceDetailModalProps {
	opened: boolean;
	onClose: () => void;
	resource: Resource | undefined;
	isLoading: boolean;
}

function ResourceTypeBadge({ resourceType }: { resourceType: ResourceType }): React.ReactNode {
	return (
		<Badge color={resourceTypeColors[resourceType]} variant='light'>
			{resourceType}
		</Badge>
	);
}

function ScopeTypeBadge({ scopeType }: { scopeType: ScopeType }): React.ReactNode {
	return (
		<Badge color={scopeTypeColors[scopeType]} variant='light'>
			{scopeType}
		</Badge>
	);
}

function ResourceActionsSection({ resource }: { resource: Resource }): React.ReactNode {
	return (
		<div>
			<Text size='sm' c='dimmed' mb='xs'>Actions ({resource.actionsCount || 0})</Text>
			{resource.actions && resource.actions.length > 0 ? (
				<Group gap='xs' mt='xs'>
					{resource.actions.map((action) => (
						<Badge key={action.id} color='blue' variant='light' size='sm'>
							{action.name}
						</Badge>
					))}
				</Group>
			) : (
				<Text size='sm' c='dimmed'>No actions defined</Text>
			)}
		</div>
	);
}

function ResourceDetailContent({ resource }: { resource: Resource }): React.ReactNode {
	const schema = resourceSchema as ModelSchema;

	return (
		<>
			<DetailView
				schema={schema}
				data={resource as unknown as Record<string, unknown>}
				excludeFields={['resourceType', 'scopeType', 'actionsCount', 'actions']}
				showMetadata={false}
			/>

			<Divider />

			<Group>
				<div style={{ flex: 1 }}>
					<Text size='sm' c='dimmed' mb='xs'>Resource Type</Text>
					<ResourceTypeBadge resourceType={resource.resourceType} />
				</div>
				<div style={{ flex: 1 }}>
					<Text size='sm' c='dimmed' mb='xs'>Scope Type</Text>
					<ScopeTypeBadge scopeType={resource.scopeType} />
				</div>
			</Group>

			<Divider />

			<ResourceActionsSection resource={resource} />

			<Divider />

			<Group>
				<div style={{ flex: 1 }}>
					<Text size='sm' c='dimmed'>Created By</Text>
					<Text size='sm'>{resource.createdBy}</Text>
				</div>
				<div style={{ flex: 1 }}>
					<Text size='sm' c='dimmed'>Created At</Text>
					<Text size='sm'>{new Date(resource.createdAt).toLocaleString()}</Text>
				</div>
			</Group>

			<Group>
				<div style={{ flex: 1 }}>
					<Text size='sm' c='dimmed'>Updated At</Text>
					<Text size='sm'>{new Date(resource.updatedAt).toLocaleString()}</Text>
				</div>
			</Group>
		</>
	);
}

export const ResourceDetailModal: React.FC<ResourceDetailModalProps> = ({
	opened,
	onClose,
	resource,
	isLoading,
}) => {
	if (!resource && !isLoading) {
		return null;
	}

	return (
		<DetailDialog
			opened={opened}
			onClose={onClose}
			title={resource?.name || 'Resource Details'}
			isLoading={isLoading}
		>
			{resource && <ResourceDetailContent resource={resource} />}
		</DetailDialog>
	);
};
