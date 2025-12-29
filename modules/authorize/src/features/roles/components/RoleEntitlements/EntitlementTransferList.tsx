import { Group } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ScopeType } from '@/features/resources';

import { AvailableEntitlementsList } from './AvailableEntitlementsList';
import { SelectedEntitlementsList } from './SelectedEntitlementsList';

import type { Entitlement } from '@/features/entitlements';
import type { Resource } from '@/features/resources';


export interface EntitlementTransferListProps {
	availableEntitlements: Entitlement[];
	selectedEntitlements: Entitlement[];
	onMoveToSelected: (entitlement: Entitlement) => void;
	onMoveToAvailable: (entitlement: Entitlement) => void;
	resources: Resource[];
	onScopeRefChange: (entitlementId: string, scopeRef: string) => void;
	availableTitle?: string;
	selectedTitle?: string;
	emptyAvailableText?: string;
	emptySelectedText?: string;
	variant?: 'add' | 'remove';
}

function useRequiresScopeRef(resources: Resource[]) {
	return React.useCallback((entitlement: Entitlement): boolean => {
		if (!entitlement.resourceId) return true;
		const resource = resources.find((r) => r.id === entitlement.resourceId);

		if (!resource) return true;

		if (resource.scopeType === ScopeType.DOMAIN) return false;

		return true;
	}, [resources]);
}

export const EntitlementTransferList: React.FC<EntitlementTransferListProps> = ({
	availableEntitlements,
	selectedEntitlements,
	onMoveToSelected,
	onMoveToAvailable,
	resources,
	onScopeRefChange,
	availableTitle,
	selectedTitle,
	emptyAvailableText,
	emptySelectedText,
	variant = 'add',
}) => {
	const { t: translate } = useTranslation();
	const requiresScopeRef = useRequiresScopeRef(resources);

	const defaults = React.useMemo(() => {
		if (variant === 'remove') {
			return {
				availableTitle: translate('nikki.authorize.role.entitlements.assigned_title'),
				selectedTitle: translate('nikki.authorize.role.entitlements.to_remove'),
				emptyAvailableText: translate('nikki.authorize.role.entitlements.no_assigned'),
				emptySelectedText: translate('nikki.authorize.role.entitlements.no_to_remove'),
			};
		}
		return {
			availableTitle: translate('nikki.authorize.role.entitlements.available'),
			selectedTitle: translate('nikki.authorize.role.entitlements.selected'),
			emptyAvailableText: translate('nikki.authorize.role.entitlements.no_available'),
			emptySelectedText: translate('nikki.authorize.role.entitlements.no_selected'),
		};
	}, [translate, variant]);

	return (
		<Group align='flex-start' gap='lg' style={{ width: '100%' }}>
			<AvailableEntitlementsList
				entitlements={availableEntitlements}
				onMoveToSelected={onMoveToSelected}
				translate={translate}
				title={availableTitle ?? defaults.availableTitle}
				emptyText={emptyAvailableText ?? defaults.emptyAvailableText}
			/>
			<SelectedEntitlementsList
				entitlements={selectedEntitlements}
				onMoveToAvailable={onMoveToAvailable}
				onScopeRefChange={onScopeRefChange}
				requiresScopeRef={requiresScopeRef}
				translate={translate}
				title={selectedTitle ?? defaults.selectedTitle}
				emptyText={emptySelectedText ?? defaults.emptySelectedText}
				readonlyScopeRef={variant === 'remove'}
			/>
		</Group>
	);
};

