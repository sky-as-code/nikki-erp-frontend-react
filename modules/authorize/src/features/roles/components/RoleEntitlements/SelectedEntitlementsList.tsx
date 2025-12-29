import { ActionIcon, Box, Group, ScrollArea, Stack, Text, Title } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';

import { createEntitlementKey } from '@/utils';

import { EntitlementCard } from './EntitlementCard';

import type { Entitlement } from '@/features/entitlements';


export interface SelectedEntitlementsListProps {
	entitlements: Entitlement[];
	onMoveToAvailable: (entitlement: Entitlement) => void;
	onScopeRefChange: (entitlementId: string, scopeRef: string) => void;
	requiresScopeRef: (entitlement: Entitlement) => boolean;
	translate: (key: string) => string;
	title?: string;
	emptyText?: string;
	readonlyScopeRef?: boolean;
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
