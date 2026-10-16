import { Alert, Button, Checkbox, Group } from '@mantine/core';
import { ResourceScope } from '@nikkierp/common/entitlements';
import { Button as LockableButton } from '@nikkierp/ui/components';
import { useTranslate } from '@nikkierp/ui/i18n';
import { commandAttrs, componentAttrs } from '@nikkierp/viewengine/core';
import { useActionLock } from '@nikkierp/viewkit-mantine';
import React from 'react';
import { z } from 'zod';

import { ROLE_ASSIGNMENT_ACKNOWLEDGE, ROLE_ASSIGNMENT_ACTIONS, ROLE_ASSIGNMENT_ERROR } from '../ids';
import { useRoleAssignmentContext } from '../pages/roleAssignmentContext';

import type { IComponentRenderer } from '@nikkierp/viewengine/core';


/**
 * The wizard's chrome: the stage buttons, the error banner and the acknowledgement.
 *
 * All three take no props. Everything they need is behaviour — what Save saves, when Next is
 * allowed — and behaviour cannot survive `JSON.stringify`, so it comes from the page's context
 * instead. Page JSON says where they go; the provider says what they do.
 */
const noProps = z.object({}).strict();

export const roleAssignmentActionsRenderer: IComponentRenderer<Record<string, never>> = {
	type: ROLE_ASSIGNMENT_ACTIONS,
	propsSchema: noProps,
	render() {
		return <RoleAssignmentActions />;
	},
};

/**
 * What the backend asserts on `POST /v1/iam/{users|groups}/:id/roles`, on the principal. It passes
 * no org, so only a tenant-wide grant satisfies it, and the lock asks for tenant scope to match.
 */
const MANAGE_ROLE_ASSIGNMENTS = 'manage_role_assignments';

function RoleAssignmentActions(): React.ReactNode {
	const context = useRoleAssignmentContext();
	const t = useTranslate(context.params.translationNs);
	const lock = useActionLock(context.params.principalSchemaName, MANAGE_ROLE_ASSIGNMENTS, ResourceScope.Tenant);

	return (
		<Group gap='sm' {...componentAttrs(ROLE_ASSIGNMENT_ACTIONS)}>
			{/* Back only navigates, so it publishes nothing and carries no `data-command`. */}
			<Button variant='default' onClick={context.onBack}>{t('action.back')}</Button>
			{context.stage === 'select'
				? (
					<Button
						onClick={context.goNext}
						disabled={!context.hasChanges || context.isBusy}
						{...commandAttrs(context.params.describeCommand)}
					>
						{t('action.next')}
					</Button>
				)
				: (
					<LockableButton
						variant='filled'
						size='sm'
						onClick={context.save}
						disabled={!context.acknowledged || context.isBusy}
						locked={lock.locked}
						lockedMissing={lock.missing}
						{...commandAttrs(context.params.saveCommand)}
					>
						{t('action.save')}
					</LockableButton>
				)}
		</Group>
	);
}

export const roleAssignmentErrorRenderer: IComponentRenderer<Record<string, never>> = {
	type: ROLE_ASSIGNMENT_ERROR,
	propsSchema: noProps,
	render() {
		return <RoleAssignmentError />;
	},
};

function RoleAssignmentError(): React.ReactNode {
	const { error } = useRoleAssignmentContext();
	// Nothing rendered means nothing to attribute; the banner names itself only when it is there.
	if (error == null) {
		return null;
	}

	return (
		<Alert color='red' {...componentAttrs(ROLE_ASSIGNMENT_ERROR)}>
			{String((error as Error)?.message ?? error)}
		</Alert>
	);
}

export const roleAssignmentAcknowledgeRenderer: IComponentRenderer<Record<string, never>> = {
	type: ROLE_ASSIGNMENT_ACKNOWLEDGE,
	propsSchema: noProps,
	render() {
		return <RoleAssignmentAcknowledge />;
	},
};

function RoleAssignmentAcknowledge(): React.ReactNode {
	const context = useRoleAssignmentContext();
	const t = useTranslate(context.params.translationNs);

	return (
		<Checkbox
			checked={context.acknowledged}
			onChange={event => context.setAcknowledged(event.currentTarget.checked)}
			label={t('assignment.acknowledge')}
			{...componentAttrs(ROLE_ASSIGNMENT_ACKNOWLEDGE)}
		/>
	);
}
