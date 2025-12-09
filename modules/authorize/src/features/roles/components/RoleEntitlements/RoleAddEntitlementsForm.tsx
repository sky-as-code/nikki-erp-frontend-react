import { Paper, Stack, Title } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { AssignedEntitlementsList } from './AssignedEntitlementsList';
import { EntitlementTransferList } from './EntitlementTransferList';
import { FormActionsSection } from './FormActionsSection';
import { RoleInfoSection } from './RoleInfoSection';
import { SearchSection } from './SearchSection';

import type { Action } from '@/features/actions';
import type { Entitlement } from '@/features/entitlements';
import type { Resource } from '@/features/resources';
import type { Role } from '@/features/roles';



interface RoleAddEntitlementsFormProps {
	role: Role;
	availableEntitlements: Entitlement[];
	selectedEntitlements: Entitlement[];
	onMoveToSelected: (entitlementId: string) => void;
	onMoveToAvailable: (entitlementId: string) => void;
	resources: Resource[];
	actions: Action[];
	selectedScopeRefs: Record<string, string>;
	onScopeRefChange: (entitlementId: string, scopeRef: string) => void;
	searchQuery: string;
	onSearchQueryChange: (query: string) => void;
	onSearch: () => void;
	onConfirm: () => void;
	onCancel: () => void;
	isSubmitting: boolean;
}

export const RoleAddEntitlementsForm: React.FC<RoleAddEntitlementsFormProps> = ({
	role,
	availableEntitlements,
	selectedEntitlements,
	onMoveToSelected,
	onMoveToAvailable,
	resources,
	actions,
	selectedScopeRefs,
	onScopeRefChange,
	searchQuery,
	onSearchQueryChange,
	onSearch,
	onConfirm,
	onCancel,
	isSubmitting,
}) => {
	const { t: translate } = useTranslation();

	return (
		<Paper p='lg'>
			<Title order={4} mb='lg'>
				{translate('nikki.authorize.role.entitlements.add_title')}
			</Title>
			<FormActionsSection
				selectedEntitlements={selectedEntitlements}
				onConfirm={onConfirm}
				onCancel={onCancel}
				isSubmitting={isSubmitting}
			/>

			<Stack gap='md'>
				<RoleInfoSection role={role} />
				<AssignedEntitlementsList
					entitlements={role.entitlements || []}
					resources={resources}
					actions={actions}
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
					actions={actions}
					selectedScopeRefs={selectedScopeRefs}
					onScopeRefChange={onScopeRefChange}
				/>
			</Stack>
		</Paper>
	);
};

