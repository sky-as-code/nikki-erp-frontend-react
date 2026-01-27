import { Paper, Stack, Title } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { EntitlementTransferList } from './EntitlementTransferList';
import { FormActionsSection } from './FormActionsSection';
import { SearchSection } from './SearchSection';

import type { Entitlement } from '@/features/entitlements';
import type { Resource } from '@/features/resources';
import type { Role } from '@/features/roles';


interface RoleRemoveEntitlementsFormProps {
	role: Role;
	availableEntitlements: Entitlement[];
	selectedEntitlements: Entitlement[];
	onMoveToSelected: (entitlement: Entitlement) => void;
	onMoveToAvailable: (entitlement: Entitlement) => void;
	resources: Resource[];
	searchQuery: string;
	onSearchQueryChange: (query: string) => void;
	onSearch: () => void;
	onConfirm: () => void;
	onCancel: () => void;
	isSubmitting: boolean;
	showConfirm?: boolean;
}

/**
 * Form dedicated for removing entitlements from a role.
 * Shows two lists: currently assigned vs. selected to remove.
 */
export const RoleRemoveEntitlementsForm: React.FC<RoleRemoveEntitlementsFormProps> = ({
	role,
	availableEntitlements,
	selectedEntitlements,
	onMoveToSelected,
	onMoveToAvailable,
	resources,
	searchQuery,
	onSearchQueryChange,
	onSearch,
	onConfirm,
	onCancel,
	isSubmitting,
	showConfirm = true,
}) => {
	const { t: translate } = useTranslation();

	return (
		<Paper p='lg'>
			<Title order={4} mb='lg'>
				{translate('nikki.authorize.role.entitlements.remove_title')} - {role.name}
			</Title>

			<FormActionsSection
				selectedEntitlements={selectedEntitlements}
				onConfirm={onConfirm}
				onCancel={onCancel}
				isSubmitting={isSubmitting}
				actionVariant='remove'
				showConfirm={showConfirm}
			/>

			<Stack gap='md'>
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
					onScopeRefChange={() => {}}
					variant='remove'
				/>
			</Stack>
		</Paper>
	);
};


