import { Box, Card, Stack, Text } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ScopeType } from '@/features/resources';

import type { Action } from '@/features';
import type { Entitlement } from '@/features/entitlements';
import type { Resource } from '@/features/resources';


export interface EntitlementCardProps {
	entitlement: Entitlement;
	resources: Resource[];
	actions: Action[];
	scopeRef?: string;
	onScopeRefChange?: (entitlementId: string, scopeRef: string) => void;
	requiresScopeRef?: boolean;
}

function useEntitlementDisplayData(
	entitlement: Entitlement,
	resources: Resource[],
	actions: Action[],
) {
	const { t: translate } = useTranslation();

	const resource = React.useMemo(() => {
		if (!entitlement.resourceId) return undefined;
		return resources.find((r) => r.id === entitlement.resourceId);
	}, [entitlement.resourceId, resources]);

	const action = React.useMemo(() => {
		if (!entitlement.actionId) return undefined;
		return actions.find((a) => a.id === entitlement.actionId);
	}, [entitlement.actionId, actions]);

	const resourceName = React.useMemo(() => {
		if (!entitlement.resourceId) {
			return translate('nikki.authorize.entitlement.fields.resource_all');
		}
		return resource?.name || entitlement.resourceId;
	}, [entitlement.resourceId, resource, translate]);

	const actionName = React.useMemo(() => {
		if (!entitlement.actionId) {
			return translate('nikki.authorize.entitlement.fields.action_all');
		}
		return action?.name || entitlement.actionId;
	}, [entitlement.actionId, action, translate]);

	const scopeTypeLabel = React.useMemo(() => {
		if (!resource) return '';
		const scopeTypeMap: Record<ScopeType, string> = {
			domain: translate('nikki.authorize.resource.fields.scope_type.domain'),
			org: translate('nikki.authorize.resource.fields.scope_type.org'),
			hierarchy: translate('nikki.authorize.resource.fields.scope_type.hierarchy'),
			private: translate('nikki.authorize.resource.fields.scope_type.private'),
		};
		return scopeTypeMap[resource.scopeType] || resource.scopeType;
	}, [resource, translate]);

	return { resourceName, actionName, scopeTypeLabel };
}

export const EntitlementCard: React.FC<EntitlementCardProps> = ({
	entitlement,
	resources,
	actions,
	scopeRef,
	onScopeRefChange,
	requiresScopeRef = false,
}) => {
	const { t: translate } = useTranslation();
	const { resourceName, actionName, scopeTypeLabel } = useEntitlementDisplayData(
		entitlement,
		resources,
		actions,
	);

	return (
		<Card padding='sm' withBorder>
			<Stack gap='xs'>
				<Text fw={500} size='sm'>
					{entitlement.name}
				</Text>
				<Stack gap={4}>
					<Text size='xs' c='dimmed'>
						{resourceName}
					</Text>
					<Text size='xs' c='dimmed'>
						{actionName}
					</Text>
					{scopeTypeLabel && (
						<Text size='xs' c='dimmed'>
							{scopeTypeLabel}
						</Text>
					)}
				</Stack>
				{requiresScopeRef && onScopeRefChange && (
					<Box>
						<Text size='xs' mb={4}>
							{translate('nikki.authorize.role.entitlements.scope_ref')}
						</Text>
						<input
							type='text'
							value={scopeRef || ''}
							onChange={(e) => onScopeRefChange(entitlement.id, e.target.value)}
							placeholder={translate('nikki.authorize.role.entitlements.scope_ref_placeholder')}
							style={{
								width: '100%',
								padding: '4px 8px',
								border: '1px solid #ced4da',
								borderRadius: '4px',
								fontSize: '12px',
							}}
						/>
					</Box>
				)}
			</Stack>
		</Card>
	);
};

