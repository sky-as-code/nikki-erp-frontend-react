import { Box, Stack, Text, Title } from '@mantine/core';
import { TranslateFn, useTranslate } from '@nikkierp/ui/i18n';
import { componentAttrs } from '@nikkierp/viewengine/core';
import React from 'react';
import { z } from 'zod';

import { DescribedEntitlement, DescribedRole } from '../../features/roleAssignment';
import { ENTITLEMENT_CHANGE_LIST } from '../ids';
import { useRoleAssignmentContext } from '../pages/roleAssignmentContext';

import type { ComponentAttributes, IComponentRenderer } from '@nikkierp/viewengine/core';


export const entitlementChangeListRenderer: IComponentRenderer<Record<string, never>> = {
	type: ENTITLEMENT_CHANGE_LIST,
	propsSchema: z.object({}).strict(),
	render() {
		return <ContextEntitlementChangeList />;
	},
};

function ContextEntitlementChangeList(): React.ReactNode {
	const context = useRoleAssignmentContext();
	return (
		<EntitlementChangeList
			roles={context.describedRoles}
			translationNs={context.params.translationNs}
			{...componentAttrs(ENTITLEMENT_CHANGE_LIST)}
		/>
	);
}

export type EntitlementChangeListProps = Partial<ComponentAttributes> & {
	roles: DescribedRole[],
	translationNs: string,
};

/** One `{Resource}: {Action, Action} · {scope}` line, after grouping by resource and scope. */
type EntitlementLine = {
	key: string,
	resource: string,
	actions: string[],
	scope: string,
};

/**
 * The entitlements the user is about to grant, grouped per role. Reads the resolved names from
 * `GET /roles/describe`; the raw `expression` triple is never parsed here.
 */
export function EntitlementChangeList({
	roles, translationNs, ...attrs
}: EntitlementChangeListProps): React.ReactNode {
	const t = useTranslate(translationNs);

	return (
		<Stack gap='md' {...attrs}>
			<Title order={4}>{t('assignment.grantedEntitlements')}</Title>
			{roles.map(role => (
				<Box key={role.id}>
					<Text fw={700}>{role.name ?? role.id}</Text>
					<RoleLines role={role} t={t} />
				</Box>
			))}
		</Stack>
	);
}

function RoleLines({ role, t }: { role: DescribedRole, t: TranslateFn }): React.ReactNode {
	const lines = groupEntitlements(role.entitlements, t);
	if (lines.length === 0) {
		return <Text c='dimmed' size='sm' pl='md'>{t('assignment.noEntitlements')}</Text>;
	}
	return (
		<Stack gap={2} pl='md'>
			{lines.map(line => (
				<Text key={line.key} size='sm'>
					{'∟ '}
					<Text span fw={500}>{line.resource}</Text>
					{`: ${line.actions.join(', ')} · ${line.scope}`}
				</Text>
			))}
		</Stack>
	);
}

/**
 * Collapses entitlements that share a resource and a scope into one line, so
 * "Products: Create, View, Delete · Member Organizations" replaces three separate rows.
 */
export function groupEntitlements(
	entitlements: DescribedEntitlement[], t: TranslateFn,
): EntitlementLine[] {
	const lines = new Map<string, EntitlementLine>();

	for (const entitlement of entitlements) {
		const resource = entitlement.resource_name ?? t('assignment.allResources');
		const scope = scopeLabel(entitlement, t);
		const key = `${resource}::${scope}`;
		const action = entitlement.action_name ?? t('assignment.allActions');

		const existing = lines.get(key);
		if (!existing) {
			lines.set(key, { key, resource, actions: [action], scope });
		}
		else if (!existing.actions.includes(action)) {
			existing.actions.push(action);
		}
	}
	return [...lines.values()];
}

/**
 * `scope_name` is only set for org and orgunit entitlements, and only when the caller may read
 * the target. Everything else falls back to a static label for the scope kind.
 */
export function scopeLabel(entitlement: DescribedEntitlement, t: TranslateFn): string {
	if (entitlement.scope_name) {
		return entitlement.scope_name;
	}
	return entitlement.scope ? t(`assignment.scope.${entitlement.scope}`) : t('assignment.scope.domain');
}
