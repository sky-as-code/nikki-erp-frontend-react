import { ActionIcon, Box, Group, ScrollArea, Stack, Text, Title } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';

import { EntitlementCard } from './EntitlementCard';

import type { Entitlement } from '@/features/entitlements';
import type { Resource } from '@/features/resources';
import type { Hierarchy, Organization } from '@nikkierp/shell/userContext';

import { createEntitlementKey } from '@/utils';


export interface SelectedEntitlementsListProps {
	entitlements: Entitlement[];
	onMoveToAvailable: (entitlement: Entitlement) => void;
	onScopeRefChange: (entitlementId: string, scopeRef: string) => void;
	requiresScopeRef: (entitlement: Entitlement) => boolean;
	translate: (key: string) => string;
	title?: string;
	emptyText?: string;
	readonlyScopeRef?: boolean;
	resources: Resource[];
	isGlobalContext?: boolean;
	currentOrgId?: string;
	assignedOrgs?: Organization[];
	hierarchies?: Hierarchy[];
}

export const SelectedEntitlementsList: React.FC<SelectedEntitlementsListProps> = ({
	entitlements,
	onMoveToAvailable,
	onScopeRefChange,
	requiresScopeRef,
	translate,
	title,
	emptyText,
	readonlyScopeRef = false,
	resources,
	isGlobalContext = false,
	currentOrgId,
	assignedOrgs = [],
	hierarchies = [],
}) => {
	return (
		<Box style={{ flex: 1 }}>
			<Title order={5} mb='md'>
				{title || translate('nikki.authorize.role.entitlements.selected')} ({entitlements.length})
			</Title>
			<ScrollArea h={500}>
				<Stack gap='sm'>
					{entitlements.length === 0 ? (
						<Text c='dimmed' size='sm' ta='center' py='xl'>
							{emptyText || translate('nikki.authorize.role.entitlements.no_selected')}
						</Text>
					) : (
						entitlements.map((entitlement: Entitlement) => (
							<Group key={createEntitlementKey(entitlement)} gap='xs' align='flex-start'>
								<ActionIcon
									variant='light'
									color='red'
									onClick={() => onMoveToAvailable(entitlement)}
									mt='xs'
								>
									<IconArrowLeft size={16} />
								</ActionIcon>
								<Box style={{ flex: 1 }}>
									<EntitlementCard
										entitlement={entitlement}
										scopeRef={entitlement.scopeRef}
										onScopeRefChange={onScopeRefChange}
										requiresScopeRef={requiresScopeRef(entitlement)}
										readonlyScopeRef={readonlyScopeRef}
										resources={resources}
										isGlobalContext={isGlobalContext}
										currentOrgId={currentOrgId}
										assignedOrgs={assignedOrgs}
										hierarchies={hierarchies}
									/>
								</Box>
							</Group>
						))
					)}
				</Stack>
			</ScrollArea>
		</Box>
	);
};
