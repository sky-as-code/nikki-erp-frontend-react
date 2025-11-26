import {
	Badge,
	Divider,
	Group,
	Text,
} from '@mantine/core';
import { DetailModal, DetailView } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';

import resourceSchema from '../resource-schema.json';
import { Resource, ResourceType, ScopeType } from '../types';


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

export interface ResourceDetailModalProps {
	opened: boolean;
	onClose: () => void;
	resource: Resource | undefined;
	isLoading: boolean;
}

const ResourceTypeBadge: React.FC<{ resourceType: ResourceType }> = ({ resourceType }) => (
	<Badge color={resourceTypeColors[resourceType]} variant='light'>
		{resourceType}
	</Badge>
);

const ScopeTypeBadge: React.FC<{ scopeType: ScopeType }> = ({ scopeType }) => (
	<Badge color={scopeTypeColors[scopeType]} variant='light'>
		{scopeType}
	</Badge>
);

const ResourceActionsSection: React.FC<{ resource: Resource }> = ({ resource }) => (
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

const ResourceMetaSection: React.FC<{ resource: Resource }> = ({ resource }) => (
	<Group>
		<div style={{ flex: 1 }}>
			<Text size='sm' c='dimmed'>Created By</Text>
			<Text size='sm'>{resource.createdBy}</Text>
		</div>
		<div style={{ flex: 1 }}>
			<Text size='sm' c='dimmed'>Created At</Text>
			<Text size='sm'>{new Date(resource.createdAt).toLocaleString()}</Text>
		</div>
		<div style={{ flex: 1 }}>
			<Text size='sm' c='dimmed'>Updated At</Text>
			<Text size='sm'>{new Date(resource.updatedAt).toLocaleString()}</Text>
		</div>
	</Group>
);

const ResourceTypeScopeSection: React.FC<{ resource: Resource }> = ({ resource }) => (
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
);

const ResourceDetailContent: React.FC<{ resource: Resource }> = ({ resource }) => {
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
			<ResourceTypeScopeSection resource={resource} />

			<Divider />
			<ResourceActionsSection resource={resource} />

			<Divider />
			<ResourceMetaSection resource={resource} />
		</>
	);
};

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
		<DetailModal
			opened={opened}
			onClose={onClose}
			title={resource?.name || 'Resource Details'}
			isLoading={isLoading}
		>
			{resource && <ResourceDetailContent resource={resource} />}
		</DetailModal>
	);
};


