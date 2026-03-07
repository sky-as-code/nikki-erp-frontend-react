import { Box, Card, Select, Stack, Text } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { Entitlement } from '@/features/entitlements';
import type { Resource } from '@/features/resources';
import type { Hierarchy, Organization } from '@nikkierp/shell/userContext';


export interface EntitlementCardProps {
	entitlement: Entitlement;
	scopeRef?: string;
	onScopeRefChange?: (entitlementId: string, scopeRef: string) => void;
	requiresScopeRef?: boolean;
	readonlyScopeRef?: boolean;
	resources?: Resource[];
	isGlobalContext?: boolean;
	currentOrgId?: string;
	assignedOrgs?: Organization[];
	hierarchies?: Hierarchy[];
}

function useEntitlementDisplayData(entitlement: Entitlement) {
	const { t: translate } = useTranslation();

	const resourceName = React.useMemo(() => {
		if (!entitlement.resourceId) {
			return translate('nikki.authorize.entitlement.fields.resource_all');
		}
		return entitlement.resource?.name || entitlement.resourceId;
	}, [entitlement.resourceId, entitlement.resource, translate]);

	const actionName = React.useMemo(() => {
		if (!entitlement.actionId) {
			return translate('nikki.authorize.entitlement.fields.action_all');
		}
		return entitlement.action?.name || entitlement.actionId;
	}, [entitlement.actionId, entitlement.action, translate]);

	return { resourceName, actionName };
}

// eslint-disable-next-line max-lines-per-function
export const EntitlementCard: React.FC<EntitlementCardProps> = ({
	entitlement,
	scopeRef: scopeRefProp,
	onScopeRefChange,
	requiresScopeRef = false,
	readonlyScopeRef = false,
	resources = [],
	isGlobalContext = false,
	currentOrgId,
	assignedOrgs = [],
	hierarchies = [],
}) => {
	const { t: translate } = useTranslation();
	const { resourceName, actionName } = useEntitlementDisplayData(entitlement);
	const scopeRef = scopeRefProp ?? entitlement.scopeRef;
	const resource = React.useMemo(
		() => resources.find((r) => r.id === entitlement.resourceId),
		[resources, entitlement.resourceId],
	);
	const scopeType = resource?.scopeType;
	const [hierarchyOrgId, setHierarchyOrgId] = React.useState<string | null>(null);
	const effectiveHierarchyOrgId = React.useMemo(
		() => (isGlobalContext ? hierarchyOrgId : (currentOrgId ?? null)),
		[isGlobalContext, hierarchyOrgId, currentOrgId],
	);
	const availableHierarchies = React.useMemo(
		() => hierarchies.filter((h) => h.orgId === effectiveHierarchyOrgId),
		[hierarchies, effectiveHierarchyOrgId],
	);
	const orgSelectData = React.useMemo(
		() => assignedOrgs.map((org) => ({ value: org.id, label: org.name })),
		[assignedOrgs],
	);
	const hierarchySelectData = React.useMemo(
		() => availableHierarchies.map((h) => ({ value: h.id, label: h.name })),
		[availableHierarchies],
	);
	const scopeTypeLabel = React.useMemo(() => {
		if (!scopeType) return '-';
		if (scopeType === 'domain') return translate('nikki.authorize.resource.fields.scopeType.domain', { defaultValue: 'Domain' });
		if (scopeType === 'org') return translate('nikki.authorize.resource.fields.scopeType.org', { defaultValue: 'Organization' });
		if (scopeType === 'hierarchy') return translate('nikki.authorize.resource.fields.scopeType.hierarchy', { defaultValue: 'Hierarchy' });
		if (scopeType === 'private') return translate('nikki.authorize.resource.fields.scopeType.private', { defaultValue: 'Private' });
		return String(scopeType);
	}, [scopeType, translate]);

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
					{scopeType && (
						<Text size='xs' c='dimmed'>
							{scopeTypeLabel}
						</Text>
					)}
					{scopeRef && (
						<Text size='xs' c='dimmed'>
							{scopeRef}
						</Text>
					)}
				</Stack>
				{requiresScopeRef && (
					<Box>
						<Text size='xs' mb={4}>
							{translate('nikki.authorize.role.entitlements.scope_ref')}
						</Text>
						{readonlyScopeRef ? (
							<Text size='xs' c='dimmed' style={{ padding: '4px 8px' }}>
								{scopeRef || '-'}
							</Text>
						) : (
							onScopeRefChange && (
								<Stack gap='xs'>
									{scopeType === 'org' && (
										<Select
											data={orgSelectData}
											value={scopeRef || null}
											onChange={(val) => onScopeRefChange(entitlement.id, val ?? '')}
											placeholder={translate('nikki.authorize.role.entitlements.scope_ref_placeholder')}
											searchable
										/>
									)}
									{scopeType === 'hierarchy' && (
										<>
											{isGlobalContext && (
												<Select
													data={orgSelectData}
													value={hierarchyOrgId}
													onChange={(val) => {
														setHierarchyOrgId(val);
														onScopeRefChange(entitlement.id, '');
													}}
													placeholder={translate('nikki.authorize.role.fields.org', { defaultValue: 'Organization' })}
													searchable
												/>
											)}
											<Select
												data={hierarchySelectData}
												value={scopeRef || null}
												onChange={(val) => onScopeRefChange(entitlement.id, val ?? '')}
												placeholder={translate('nikki.authorize.role.entitlements.scope_ref_placeholder')}
												disabled={!effectiveHierarchyOrgId}
												searchable
											/>
										</>
									)}
									{(!scopeType || scopeType === 'private') && (
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
									)}
								</Stack>
							)
						)}
					</Box>
				)}
			</Stack>
		</Card>
	);
};

