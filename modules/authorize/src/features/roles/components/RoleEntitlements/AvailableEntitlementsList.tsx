import { ActionIcon, Box, Group, ScrollArea, Stack, Text, Title } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import React from 'react';

import { createEntitlementKey } from '@/utils';

import { EntitlementCard } from './EntitlementCard';

import type { Entitlement } from '@/features/entitlements';


export interface AvailableEntitlementsListProps {
	entitlements: Entitlement[];
	onMoveToSelected: (entitlement: Entitlement) => void;
	translate: (key: string) => string;
	title?: string;
	emptyText?: string;
}

export const AvailableEntitlementsList: React.FC<AvailableEntitlementsListProps> = ({
	entitlements,
	onMoveToSelected,
	translate,
	title,
	emptyText,
}) => {
	return (
		<Box style={{ flex: 1 }}>
			<Title order={5} mb='md'>
				{title || translate('nikki.authorize.role.entitlements.available')} ({entitlements.length})
			</Title>
			<ScrollArea h={500}>
				<Stack gap='sm'>
					{entitlements.length === 0 ? (
						<Text c='dimmed' size='sm' ta='center' py='xl'>
							{emptyText || translate('nikki.authorize.role.entitlements.no_available')}
						</Text>
					) : (
						entitlements.map((entitlement: Entitlement) => (
							<Group key={createEntitlementKey(entitlement)} gap='xs' align='flex-start'>
								<Box style={{ flex: 1 }}>
									<EntitlementCard
										entitlement={entitlement}
									/>
								</Box>
								<ActionIcon
									variant='light'
									color='blue'
									onClick={() => onMoveToSelected(entitlement)}
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
};
