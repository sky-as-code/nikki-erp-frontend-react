import { Box, Card, Stack, Text } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { Entitlement } from '@/features/entitlements';


export interface EntitlementCardProps {
	entitlement: Entitlement;
	scopeRef?: string;
	onScopeRefChange?: (entitlementId: string, scopeRef: string) => void;
	requiresScopeRef?: boolean;
	readonlyScopeRef?: boolean;
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

export const EntitlementCard: React.FC<EntitlementCardProps> = ({
	entitlement,
	scopeRef: scopeRefProp,
	onScopeRefChange,
	requiresScopeRef = false,
	readonlyScopeRef = false,
}) => {
	const { t: translate } = useTranslation();
	const { resourceName, actionName } = useEntitlementDisplayData(entitlement);
	const scopeRef = scopeRefProp ?? entitlement.scopeRef;

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
							)
						)}
					</Box>
				)}
			</Stack>
		</Card>
	);
};

