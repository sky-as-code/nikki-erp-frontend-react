import { ActionIcon, Box, Group, ScrollArea, Stack, Text, Title } from '@mantine/core';
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ScopeType } from '@/features/resources';

import { EntitlementCard } from './EntitlementCard';

import type { Action } from '@/features/actions';
import type { Entitlement } from '@/features/entitlements';
import type { Resource } from '@/features/resources';


export interface EntitlementTransferListProps {
	availableEntitlements: Entitlement[];
	selectedEntitlements: Entitlement[];
	onMoveToSelected: (entitlementId: string) => void;
	onMoveToAvailable: (entitlementId: string) => void;
	resources: Resource[];
	actions: Action[];
	selectedScopeRefs: Record<string, string>;
	onScopeRefChange: (entitlementId: string, scopeRef: string) => void;
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

function AvailableEntitlementsList({
	entitlements,
	resources,
	actions,
	onMoveToSelected,
	translate,
}: {
	entitlements: Entitlement[];
	resources: Resource[];
	actions: Action[];
	onMoveToSelected: (entitlementId: string) => void;
	translate: (key: string) => string;
}) {
	return (
		<Box style={{ flex: 1 }}>
			<Title order={5} mb='md'>
				{translate('nikki.authorize.role.entitlements.available')} ({entitlements.length})
			</Title>
			<ScrollArea h={500}>
				<Stack gap='sm'>
					{entitlements.length === 0 ? (
						<Text c='dimmed' size='sm' ta='center' py='xl'>
							{translate('nikki.authorize.role.entitlements.no_available')}
						</Text>
					) : (
						entitlements.map((entitlement) => (
							<Group key={entitlement.id} gap='xs' align='flex-start'>
								<Box style={{ flex: 1 }}>
									<EntitlementCard
										entitlement={entitlement}
										resources={resources}
										actions={actions}
									/>
								</Box>
								<ActionIcon
									variant='light'
									color='blue'
									onClick={() => onMoveToSelected(entitlement.id)}
									mt='xs'
								>
									<IconArrowRight size={16} />
								</ActionIcon>
							</Group>
						))
					)}
				</Stack>
			</ScrollArea>
		</Box>
	);
}

function SelectedEntitlementsList({
	entitlements,
	resources,
	actions,
	selectedScopeRefs,
	onMoveToAvailable,
	onScopeRefChange,
	requiresScopeRef,
	translate,
}: {
	entitlements: Entitlement[];
	resources: Resource[];
	actions: Action[];
	selectedScopeRefs: Record<string, string>;
	onMoveToAvailable: (entitlementId: string) => void;
	onScopeRefChange: (entitlementId: string, scopeRef: string) => void;
	requiresScopeRef: (entitlement: Entitlement) => boolean;
	translate: (key: string) => string;
}) {
	return (
		<Box style={{ flex: 1 }}>
			<Title order={5} mb='md'>
				{translate('nikki.authorize.role.entitlements.selected')} ({entitlements.length})
			</Title>
			<ScrollArea h={500}>
				<Stack gap='sm'>
					{entitlements.length === 0 ? (
						<Text c='dimmed' size='sm' ta='center' py='xl'>
							{translate('nikki.authorize.role.entitlements.no_selected')}
						</Text>
					) : (
						entitlements.map((entitlement) => (
							<Group key={entitlement.id} gap='xs' align='flex-start'>
								<ActionIcon
									variant='light'
									color='red'
									onClick={() => onMoveToAvailable(entitlement.id)}
									mt='xs'
								>
									<IconArrowLeft size={16} />
								</ActionIcon>
								<Box style={{ flex: 1 }}>
									<EntitlementCard
										entitlement={entitlement}
										resources={resources}
										actions={actions}
										scopeRef={selectedScopeRefs[entitlement.id]}
										onScopeRefChange={onScopeRefChange}
										requiresScopeRef={requiresScopeRef(entitlement)}
									/>
								</Box>
							</Group>
						))
					)}
				</Stack>
			</ScrollArea>
		</Box>
	);
}

export const EntitlementTransferList: React.FC<EntitlementTransferListProps> = ({
	availableEntitlements,
	selectedEntitlements,
	onMoveToSelected,
	onMoveToAvailable,
	resources,
	actions,
	selectedScopeRefs,
	onScopeRefChange,
}) => {
	const { t: translate } = useTranslation();
	const requiresScopeRef = useRequiresScopeRef(resources);

	return (
		<Group align='flex-start' gap='lg' style={{ width: '100%' }}>
			<AvailableEntitlementsList
				entitlements={availableEntitlements}
				resources={resources}
				actions={actions}
				onMoveToSelected={onMoveToSelected}
				translate={translate}
			/>
			<SelectedEntitlementsList
				entitlements={selectedEntitlements}
				resources={resources}
				actions={actions}
				selectedScopeRefs={selectedScopeRefs}
				onMoveToAvailable={onMoveToAvailable}
				onScopeRefChange={onScopeRefChange}
				requiresScopeRef={requiresScopeRef}
				translate={translate}
			/>
		</Group>
	);
};

