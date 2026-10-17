import { Alert, Badge, Box, Group, Text } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { useTranslate } from '@nikkierp/ui/i18n';
import { ComponentAnchor } from '@nikkierp/viewengine/render';
import {
	actionRequirement, FormDataTable, useResourceFormView, useResourceUpdateContext,
} from '@nikkierp/viewkit-mantine';
import React from 'react';
import { useParams } from 'react-router';
import { z } from 'zod';

import { GRANT_FIELD_EDITORS, GrantEditorContext, TEST_ID_PREFIX } from './grantEditors';
import { entitlementErrors } from './permissionDrafts';
import {
	ACTION_FIELD, isDraftRow, mergeDraftRows, PERMISSION_FIELDS, RESOURCE_FIELD, revocationOf, toDraftGrant,
} from './permissionTable';
import { usePermissionDraftState } from './rolePermissionsData';
import { IAM_MODULE, ROLE_SCHEMA_NAME } from '../../../constants';
import { ROLE_PERMISSIONS } from '../../ids';

import type { GrantEditorBridge } from './grantEditors';
import type { PermissionDraftState } from './rolePermissionsData';
import type { RoleEntitlement } from '../../../features/role/rolePermissions';
import type * as dyn from '@nikkierp/common/dynamicModel';
import type { SearchItem } from '@nikkierp/ui/components/ExcelDataTable';
import type { FieldRendererMap, IComponentRenderer } from '@nikkierp/viewengine/core';


const ENTITLEMENT_SCHEMA_NAME = 'iam_entitlement';
const CAPABILITIES: ['create', 'delete'] = ['create', 'delete'];

/** The backend asserts `manage_entitlements` on `iam_role` with no org, so only a tenant grant satisfies it. */
const MANAGE_REQUIREMENT = actionRequirement(ROLE_SCHEMA_NAME, 'manage_entitlements', 'tenant');

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
 * The role's entitlements. In update mode the table's insert row and row deletes only draft
 * changes: added rows show as "New", deleted saved rows disappear, and both ride the role's own
 * update request on Save. Cancel or a successful Save discards the drafts.
 */
function RolePermissionsSection(): React.ReactNode {
	const t = useTranslate([IAM_MODULE, 'common']);
	const section = usePermissionSection();
	return (
		<Box>
			<DeltaErrors />
			<GrantEditorContext.Provider value={section.bridge}>
				<FormDataTable
					key={section.loadCount}
					schemaName={ENTITLEMENT_SCHEMA_NAME}
					baseGraph={section.baseGraph}
					fields={PERMISSION_FIELDS}
					transformItems={section.transformItems}
					capabilities={CAPABILITIES}
					indexColumnVisible={false}
					newRowPrompt={t('role_permission_addEntitlement', { defaultValue: 'Add new entitlement' })}
					newRowFieldEditors={GRANT_FIELD_EDITORS}
					onCreated={section.onCreated}
					onDeleted={section.onDeleted}
					createEntitlement={MANAGE_REQUIREMENT}
					deleteEntitlement={MANAGE_REQUIREMENT}
					fieldRenderers={section.fieldRenderers}
					emptyText={t('role_permission_empty')}
					testId={TEST_ID_PREFIX}
				/>
			</GrantEditorContext.Provider>
		</Box>
	);
}

function usePermissionSection() {
	const roleId = useParams().id ?? '';
	const updateMode = useResourceFormView()?.updateMode ?? false;
	const baseGraph = React.useMemo((): dyn.SearchGraph => ({ if: ['role_id', '=', roleId] }), [roleId]);
	const bridge = React.useRef<GrantEditorBridge>({ names: new Map(), form: null });
	const saved = React.useRef<RoleEntitlement[]>([]);
	// A save re-reads the rows: the table remounts and runs its search again.
	const [loadCount, setLoadCount] = React.useState(0);
	const draftState = usePermissionDraftState({
		roleId, updateMode, getExisting: () => saved.current, onSaved: () => setLoadCount(count => count + 1),
	});
	const { drafts } = draftState;
	const transformItems = React.useCallback((items: SearchItem[]) => {
		// Remembered for the duplicate check, which runs in an event handler, after this render.
		saved.current = items as RoleEntitlement[];
		return mergeDraftRows(items, drafts);
	}, [drafts]);
	return {
		baseGraph, bridge, loadCount, transformItems,
		...useDraftSinks(draftState, bridge),
		fieldRenderers: usePermissionRenderers(),
	};
}

/**
 * The table's row writes, as drafts. A refused grant is pinned on the picker it concerns and keeps
 * the insert row open.
 */
function useDraftSinks(draftState: PermissionDraftState, bridge: React.RefObject<GrantEditorBridge>) {
	const onCreated = (values: Record<string, unknown>): boolean => {
		const result = toDraftGrant(values, id => bridge.current.names.get(id));
		const problem = result.problem ?? (draftState.grant(result.grant) === 'duplicate'
			? { field: ACTION_FIELD, key: 'role_permission_duplicate' }
			: undefined);
		if (problem) {
			bridge.current.form?.setError(problem.field, { type: 'validate', message: problem.key });
			return false;
		}
		return true;
	};
	// The table deletes one row at a time.
	const onDeleted = (items: SearchItem[]) => items.forEach(item => draftState.revoke(revocationOf(item)));
	return { onCreated, onDeleted };
}

/** `resource_id` badges a draft row as "New"; `action_id` reads `null` as "All" actions. */
function usePermissionRenderers(): FieldRendererMap {
	const t = useTranslate(IAM_MODULE);
	const allLabel = t('role_permission_all');
	const newLabel = t('role_permission_new');
	return React.useMemo(() => ({
		[RESOURCE_FIELD]: {
			render: text => text,
			renderRaw: (_raw, text, record) => (isDraftRow(record) ? (
				<Group gap='xs' wrap='nowrap'>
					<Text size='sm' truncate>{text}</Text>
					<Badge size='xs' variant='light' {...testAttrs(TEST_ID_PREFIX, 'new')}>{newLabel}</Badge>
				</Group>
			) : text),
		},
		[ACTION_FIELD]: {
			render: text => text,
			renderRaw: (raw, text) => (raw == null || raw === '' ? allLabel : text),
		},
	}), [allLabel, newLabel]);
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
