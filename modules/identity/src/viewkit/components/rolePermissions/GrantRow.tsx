import { Table, Text } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { Button, Input, SearchableSelect, Select } from '@nikkierp/ui/components';
import { useTranslate } from '@nikkierp/ui/i18n';
import { IconPlus } from '@tabler/icons-react';
import React from 'react';

import { ALL_ACTIONS_VALUE, grantKey, toActionOptions, toResourceOptions } from './permissionDrafts';
import classes from './RolePermissions.module.css';
import { useGrantableResources, useResourceActions } from './rolePermissionsData';
import { IAM_MODULE } from '../../../constants';


import type { DraftGrant, GrantOutcome, NameResolver } from './permissionDrafts';
import type { LoadFailure } from './rolePermissionsData';
import type { ActionLock } from '@nikkierp/viewkit-mantine';


export const TEST_ID_PREFIX = 'identity.rolePermissions';

/**
 * The resource picker is a `SearchableSelect` input, which renders at the detail form's field size
 * (`md`), like every `AutoField` on the page; the action and description controls match it so the
 * three read as one row of form fields rather than a denser filter row.
 */
const FIELD_SIZE = 'md';

export type GrantRowProps = {
	nameOf: NameResolver,
	lock: ActionLock,
	onGrant: (grant: DraftGrant) => GrantOutcome,
	/** Shown below the row when a picker's list cannot be read. */
	describeFailure: (failure: LoadFailure | null) => string | null,
};

/**
 * `[Resource v] [Action v] [description] [+ Grant]`, the first body row in update mode. A grant
 * only drafts a row; it is sent with the role's next Save.
 */
export function GrantRow({ nameOf, lock, onGrant, describeFailure }: GrantRowProps): React.ReactNode {
	const t = useTranslate([IAM_MODULE, 'common']);
	const picker = useGrantPicker(nameOf, t('role_permission_all'));
	const grant = useGrantSubmit(picker, lock, onGrant);
	const failure = describeFailure(picker.resources.failure) ?? describeFailure(picker.actions.failure);
	const message = grant.isDuplicate ? t('role_permission_duplicate') : failure;
	return (
		<>
			<Table.Tr className={classes.grantRow}>
				<Table.Td><ResourcePicker picker={picker} /></Table.Td>
				<Table.Td><ActionPicker picker={picker} /></Table.Td>
				<Table.Td><DescriptionInput picker={picker} onEnter={grant.submit} /></Table.Td>
				<Table.Td>
					<Button
						leftSection={<IconPlus size={16} />}
						disabled={!lock.locked && !grant.canGrant}
						locked={lock.locked}
						lockedMissing={lock.missing}
						onClick={grant.submit}
						{...testAttrs(TEST_ID_PREFIX, 'grant')}
					>
						{t('role_permission_grant')}
					</Button>
				</Table.Td>
			</Table.Tr>
			{message ? (
				<Table.Tr>
					<Table.Td colSpan={4}>
						<Text size='sm' c='red' {...testAttrs(TEST_ID_PREFIX, 'grantFeedback')}>{message}</Text>
					</Table.Td>
				</Table.Tr>
			) : null}
		</>
	);
}

/**
 * Drafts the picked grant. A duplicate keeps the picks so the user can see what clashed; the
 * feedback is tied to that grant and goes away as soon as the picks change.
 */
function useGrantSubmit(picker: GrantPicker, lock: ActionLock, onGrant: GrantRowProps['onGrant']) {
	const [duplicateOf, setDuplicateOf] = React.useState<string | null>(null);
	const current = picker.toGrant();
	const currentKey = current ? grantKey(current.resourceId, current.actionId) : null;
	const submit = () => {
		if (!current || lock.locked) {
			return;
		}
		if (onGrant(current) === 'duplicate') {
			setDuplicateOf(currentKey);
			return;
		}
		setDuplicateOf(null);
		picker.reset();
	};
	return { submit, canGrant: current != null, isDuplicate: duplicateOf != null && duplicateOf === currentKey };
}

type GrantPicker = ReturnType<typeof useGrantPicker>;

function ResourcePicker({ picker }: { picker: GrantPicker }): React.ReactNode {
	const t = useTranslate([IAM_MODULE, 'common']);
	const placeholder = picker.resources.isPending ? 'messages.loading' : 'role_permission_selectResource';
	return (
		<SearchableSelect
			items={picker.resourceOptions}
			variant='input'
			value={picker.resourceId}
			onChange={picker.pickResource}
			searchBoxEnabledAt={0}
			searchPlaceholder={t('action.search')}
			unselectedPlaceholder={t(placeholder)}
			testId={`${TEST_ID_PREFIX}.resource`}
		/>
	);
}

function ActionPicker({ picker }: { picker: GrantPicker }): React.ReactNode {
	const t = useTranslate([IAM_MODULE, 'common']);
	return (
		<Select
			data={picker.actionOptions}
			value={picker.actionValue}
			onChange={picker.setActionValue}
			disabled={!picker.resourceId || picker.actions.isPending}
			placeholder={t(picker.actions.isPending ? 'messages.loading' : 'role_permission_selectAction')}
			allowDeselect={false}
			size={FIELD_SIZE}
			{...testAttrs(TEST_ID_PREFIX, 'action')}
		/>
	);
}

function DescriptionInput({ picker, onEnter }: { picker: GrantPicker, onEnter: () => void }): React.ReactNode {
	const t = useTranslate(IAM_MODULE);
	const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		// The section renders inside the detail form: an unhandled Enter would submit the whole page.
		if (event.key === 'Enter') {
			event.preventDefault();
			onEnter();
		}
	};
	return (
		<Input
			value={picker.description}
			onChange={event => picker.setDescription(event.currentTarget.value)}
			onKeyDown={onKeyDown}
			placeholder={t('role_permission_descriptionPlaceholder')}
			size={FIELD_SIZE}
			{...testAttrs(TEST_ID_PREFIX, 'description')}
		/>
	);
}

/** The grant row's own state: picked resource and action, description, and their option lists. */
function useGrantPicker(nameOf: NameResolver, allLabel: string) {
	const [resourceId, setResourceId] = React.useState<string | null>(null);
	const [actionValue, setActionValue] = React.useState<string | null>(null);
	const [description, setDescription] = React.useState('');
	const resources = useGrantableResources();
	const actions = useResourceActions(resourceId);
	const resourceOptions = toResourceOptions(resources.items, nameOf);
	const actionOptions = resourceId ? toActionOptions(actions.items, nameOf, allLabel) : [];
	const pickResource = (value: string) => {
		setResourceId(value);
		setActionValue(null);
	};
	const reset = () => {
		setResourceId(null);
		setActionValue(null);
		setDescription('');
	};
	const toGrant = (): DraftGrant | null => buildGrant({
		resource: resources.items.find(item => item.id === resourceId),
		action: actions.items.find(item => item.id === actionValue),
		actionValue, description,
	});
	return {
		resourceId, actionValue, description, resources, actions, resourceOptions, actionOptions,
		pickResource, setActionValue, setDescription, reset, toGrant,
	};
}

function buildGrant(args: {
	resource: { id: string, name?: DraftGrant['resourceName'] } | undefined,
	action: { id: string, name?: DraftGrant['actionName'] } | undefined,
	actionValue: string | null,
	description: string,
}): DraftGrant | null {
	const { resource, action, actionValue, description } = args;
	if (!resource) {
		return null;
	}
	const base = { resourceId: resource.id, resourceName: resource.name, description };
	if (actionValue === ALL_ACTIONS_VALUE) {
		return { ...base, actionId: null, actionName: null };
	}
	return action ? { ...base, actionId: action.id, actionName: action.name } : null;
}
