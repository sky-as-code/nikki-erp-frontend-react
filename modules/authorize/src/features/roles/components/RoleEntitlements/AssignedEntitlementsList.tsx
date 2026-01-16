import { Paper, ScrollArea, Stack, Text, Title } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { createEntitlementKey } from '@/utils';

import { EntitlementCard } from './EntitlementCard';

import type { Entitlement } from '@/features/entitlements';


export interface AssignedEntitlementsListProps {
	entitlements: Entitlement[];
	maxHeight?: number;
}

export const AssignedEntitlementsList: React.FC<AssignedEntitlementsListProps> = ({
	entitlements,
	maxHeight = 300,
}) => {
	const { t: translate } = useTranslation();

	if (entitlements.length === 0) {
		return (
			<Paper p='md' withBorder>
				<Text size='sm' c='dimmed' ta='center'>
					{translate('nikki.authorize.role.entitlements.no_assigned')}
				</Text>
			</Paper>
		);
	}

	return (
		<Paper p='md' withBorder>
			<Title order={5} mb='sm'>
				{translate('nikki.authorize.role.entitlements.assigned_title')} ({entitlements.length})
			</Title>
			<ScrollArea.Autosize mah={maxHeight}>
				<Stack gap='xs'>
					{entitlements.map((entitlement: Entitlement) => (
						<EntitlementCard
							key={createEntitlementKey(entitlement)}
							entitlement={entitlement}
						/>
					))}
				</Stack>
			</ScrollArea.Autosize>
		</Paper>
	);
};

