import { Paper, Stack, Title } from '@mantine/core';
import React from 'react';

import { AssignedEntitlementsList } from './AssignedEntitlementsList';
import { EntitlementTransferList } from './EntitlementTransferList';
import { FormActionsSection } from './FormActionsSection';
import { SearchSection } from './SearchSection';

import type { Entitlement } from '@/features/entitlements';
import type { Resource } from '@/features/resources';
import type { Role } from '@/features/roles';
import type { Hierarchy, Organization } from '@nikkierp/shell/userContext';



interface RoleAddEntitlementsFormProps {
	role: Role;
	availableEntitlements: Entitlement[];
	selectedEntitlements: Entitlement[];
	onMoveToSelected: (entitlement: Entitlement) => void;
	onMoveToAvailable: (entitlement: Entitlement) => void;
	resources: Resource[];
	onScopeRefChange: (entitlementId: string, scopeRef: string) => void;
	searchQuery: string;
	onSearchQueryChange: (query: string) => void;
	onSearch: () => void;
	onConfirm: () => void;
	onCancel: () => void;
	isSubmitting: boolean;
	showConfirm?: boolean;
	isGlobalContext: boolean;
	currentOrgId?: string;
	assignedOrgs: Organization[];
	hierarchies: Hierarchy[];
}

export const RoleAddEntitlementsForm: React.FC<RoleAddEntitlementsFormProps> = ({
	role,
	availableEntitlements,
	selectedEntitlements,
	onMoveToSelected,
	onMoveToAvailable,
	resources,
	onScopeRefChange,
	searchQuery,
	onSearchQueryChange,
	onSearch,
	onConfirm,
	onCancel,
	isSubmitting,
	showConfirm = true,
	isGlobalContext,
	currentOrgId,
	assignedOrgs,
	hierarchies,
}) => {
	return (
		<Paper p='lg'>
			<Title order={4} mb='lg'>{role.name}</Title>
			<FormActionsSection
				selectedEntitlements={selectedEntitlements}
				onConfirm={onConfirm}
				onCancel={onCancel}
				isSubmitting={isSubmitting}
				actionVariant='add'
				showConfirm={showConfirm}
			/>

			<Stack gap='md'>
				<AssignedEntitlementsList
					entitlements={role.entitlements || []}
					maxHeight={200}
				/>
				<SearchSection
					searchQuery={searchQuery}
					onSearchQueryChange={onSearchQueryChange}
					onSearch={onSearch}
				/>
				<EntitlementTransferList
					availableEntitlements={availableEntitlements}
					selectedEntitlements={selectedEntitlements}
					onMoveToSelected={onMoveToSelected}
					onMoveToAvailable={onMoveToAvailable}
					resources={resources}
					onScopeRefChange={onScopeRefChange}
					variant='add'
					isGlobalContext={isGlobalContext}
					currentOrgId={currentOrgId}
					assignedOrgs={assignedOrgs}
					hierarchies={hierarchies}
				/>
			</Stack>
		</Paper>
	);
};

