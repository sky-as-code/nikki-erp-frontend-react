import { Alert, Badge, Box, Group, Loader, Table, Text } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { Button } from '@nikkierp/ui/components';
import { useLocalize, useTranslate } from '@nikkierp/ui/i18n';
import { ComponentAnchor } from '@nikkierp/viewengine/render';
import {
	useActionLock, useResourceFormView, useResourceUpdateContext,
} from '@nikkierp/viewkit-mantine';
import { IconArrowBackUp, IconX } from '@tabler/icons-react';
import clsx from 'clsx';
import React from 'react';
import { useParams } from 'react-router';
import { z } from 'zod';

import { GrantRow, TEST_ID_PREFIX } from './GrantRow';
import { entitlementErrors, resolveName, toPermissionRows } from './permissionDrafts';
import classes from './RolePermissions.module.css';
import { usePermissionDraftState, useRoleEntitlements } from './rolePermissionsData';
import { IAM_MODULE, ROLE_SCHEMA_NAME } from '../../../constants';
import { ROLE_PERMISSIONS } from '../../ids';


import type { NameResolver, PermissionRow } from './permissionDrafts';
import type { LoadFailure, PermissionDraftState } from './rolePermissionsData';
import type { IComponentRenderer } from '@nikkierp/viewengine/core';
import type { ActionLock } from '@nikkierp/viewkit-mantine';


/** The backend asserts `manage_entitlements` on `iam_role` with no org, so only a tenant grant satisfies it. */
const MANAGE_ACTION = 'manage_entitlements';
const MANAGE_SCOPE = 'tenant';

/*
 * Fixed widths: the table must not stretch with the window. Its box scrolls sideways instead when
 * the pane is narrower.
 */
const COLUMN_WIDTHS = { resource: 280, action: 200, description: 280, button: 140 };

export const rolePermissionsRenderer: IComponentRenderer<Record<string, never>> = {
	type: ROLE_PERMISSIONS,
	propsSchema: z.object({}).strict(),
	render() {
		return (
			<ComponentAnchor id={ROLE_PERMISSIONS}>
				<RolePermissionsSection />
			</ComponentAnchor>
		);
	},
};

/**
 * The role's entitlements as a plain table. In update mode a grant row heads the body and each row
 * gets a Revoke; both only draft changes, which ride the role's own update request on Save.
 */
function RolePermissionsSection(): React.ReactNode {
	const section = usePermissionSection();
	return (
		<Box>
			<DeltaErrors />
			{section.loadFailure ? <Text size='sm' c='red'>{section.loadFailure}</Text> : null}
			<Box className='overflow-x-auto'>
				<Table
					layout='fixed'
					w={tableWidth(section.updateMode)}
					withTableBorder
					{...testAttrs(TEST_ID_PREFIX, 'table')}
				>
					<PermissionHeader updateMode={section.updateMode} />
					<PermissionBody section={section} />
				</Table>
			</Box>
		</Box>
	);
}

type PermissionSection = ReturnType<typeof usePermissionSection>;

function usePermissionSection() {
	const roleId = useParams().id ?? '';
	const updateMode = useResourceFormView()?.updateMode ?? false;
	const nameOf = useNameResolver();
	const t = useTranslate([IAM_MODULE, 'common']);
	const describeFailure = useFailureDescriber();
	const entitlements = useRoleEntitlements(roleId);
	const draftState = usePermissionDraftState({
		roleId, existing: entitlements.items, updateMode, onSaved: entitlements.refetch,
	});
	const lock = useActionLock(ROLE_SCHEMA_NAME, MANAGE_ACTION, MANAGE_SCOPE);
	const rows = toPermissionRows(entitlements.items, draftState.drafts, { nameOf, allLabel: t('role_permission_all') });
	return {
		updateMode, nameOf, describeFailure, draftState, lock, rows,
		isPending: entitlements.isPending,
		loadFailure: describeFailure(entitlements.failure),
	};
}

function PermissionBody({ section }: { section: PermissionSection }): React.ReactNode {
	const { updateMode, lock, draftState, rows } = section;
	return (
		<Table.Tbody>
			{updateMode ? (
				<GrantRow
					nameOf={section.nameOf}
					lock={lock}
					onGrant={draftState.grant}
					describeFailure={section.describeFailure}
				/>
			) : null}
			{rows.map(row => (
				<PermissionRowView
					key={row.key}
					row={row}
					updateMode={updateMode}
					lock={lock}
					onRevoke={draftState.revoke}
				/>
			))}
			<EmptyRow isEmpty={rows.length === 0} isPending={section.isPending} updateMode={updateMode} />
		</Table.Tbody>
	);
}

function tableWidth(updateMode: boolean): number {
	const { resource, action, description, button } = COLUMN_WIDTHS;
	return resource + action + description + (updateMode ? button : 0);
}

function PermissionHeader({ updateMode }: { updateMode: boolean }): React.ReactNode {
	const t = useTranslate([IAM_MODULE, 'common']);
	return (
		<Table.Thead>
			<Table.Tr>
				<Table.Th w={COLUMN_WIDTHS.resource}>{t('role_permission_resource')}</Table.Th>
				<Table.Th w={COLUMN_WIDTHS.action}>{t('role_permission_action')}</Table.Th>
				<Table.Th w={COLUMN_WIDTHS.description}>{t('role_permission_description')}</Table.Th>
				{updateMode ? <Table.Th w={COLUMN_WIDTHS.button}>{t('action.title')}</Table.Th> : null}
			</Table.Tr>
		</Table.Thead>
	);
}

type PermissionRowViewProps = {
	row: PermissionRow,
	updateMode: boolean,
	lock: ActionLock,
	onRevoke: PermissionDraftState['revoke'],
};

function PermissionRowView({ row, updateMode, lock, onRevoke }: PermissionRowViewProps): React.ReactNode {
	const t = useTranslate(IAM_MODULE);
	const className = clsx({ [classes.draftRow]: row.state === 'draft', [classes.removedRow]: row.state === 'removed' });
	return (
		<Table.Tr className={className} {...testAttrs(TEST_ID_PREFIX, 'row', row.key)}>
			<Table.Td>
				<Group gap='xs' wrap='nowrap'>
					<Text size='sm' truncate>{row.resourceLabel}</Text>
					{row.state === 'draft' ? <Badge size='xs' variant='light' color='green'>{t('role_permission_new')}</Badge> : null}
				</Group>
			</Table.Td>
			<Table.Td><Text size='sm' truncate>{row.actionLabel}</Text></Table.Td>
			<Table.Td><Text size='sm' lineClamp={2}>{row.description}</Text></Table.Td>
			{updateMode ? (
				<Table.Td>
					<RevokeButton row={row} lock={lock} onRevoke={() => onRevoke(row)} />
				</Table.Td>
			) : null}
		</Table.Tr>
	);
}

type RevokeButtonProps = { row: PermissionRow, lock: ActionLock, onRevoke: () => void };

/** `[X Revoke]`; on a row already marked for removal it becomes `[Undo]`. */
function RevokeButton({ row, lock, onRevoke }: RevokeButtonProps): React.ReactNode {
	const t = useTranslate(IAM_MODULE);
	const isUndo = row.state === 'removed';
	return (
		<Button
			color={isUndo ? 'gray' : 'red'}
			leftSection={isUndo ? <IconArrowBackUp size={16} /> : <IconX size={16} />}
			locked={lock.locked}
			lockedMissing={lock.missing}
			onClick={onRevoke}
			{...testAttrs(TEST_ID_PREFIX, 'row', row.key, isUndo ? 'undo' : 'revoke')}
		>
			{t(isUndo ? 'role_permission_undo' : 'role_permission_revoke')}
		</Button>
	);
}

function EmptyRow(props: { isEmpty: boolean, isPending: boolean, updateMode: boolean }): React.ReactNode {
	const t = useTranslate(IAM_MODULE);
	if (!props.isEmpty) {
		return null;
	}
	return (
		<Table.Tr>
			<Table.Td colSpan={props.updateMode ? 4 : 3}>
				{props.isPending ? <Loader size='xs' /> : <Text size='sm' c='dimmed'>{t('role_permission_empty')}</Text>}
			</Table.Td>
		</Table.Tr>
	);
}

/**
 * The last save's rejections of the delta. The page's own error area cannot show them: it pins each
 * field-scoped error on the form input of that name, and no input is named `entitlements.*`.
 */
function DeltaErrors(): React.ReactNode {
	const { saveClientErrors } = useResourceUpdateContext();
	const t = useTranslate([IAM_MODULE, 'common']);
	const errors = entitlementErrors(saveClientErrors);
	if (errors.length === 0) {
		return null;
	}
	return (
		<Alert variant='light' color='red' mb='xs' {...testAttrs(TEST_ID_PREFIX, 'errors')}>
			{errors.map((item, index) => (
				<div key={index}>{item.key ? t(item.key, item.vars) : item.message}</div>
			))}
		</Alert>
	);
}

function useNameResolver(): NameResolver {
	const localize = useLocalize(IAM_MODULE);
	return name => resolveName(name, localize);
}

function useFailureDescriber(): (failure: LoadFailure | null) => string | null {
	const t = useTranslate([IAM_MODULE, 'common']);
	return (failure) => {
		if (!failure) {
			return null;
		}
		const first = failure.clientErrors[0];
		if (first) {
			return first.key ? t(first.key, first.vars) : first.message;
		}
		return failure.error instanceof Error ? failure.error.message : String(failure.error);
	};
}
