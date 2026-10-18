import { Text } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { SearchableSelect, Select } from '@nikkierp/ui/components';
import { useLocalize, useTranslate } from '@nikkierp/ui/i18n';
import React from 'react';
import { useFormState, useWatch } from 'react-hook-form';

import { ALL_ACTIONS_VALUE, resolveName, toActionOptions, toResourceOptions } from './permissionDrafts';
import { ACTION_FIELD, RESOURCE_FIELD } from './permissionTable';
import classes from './RolePermissions.module.css';
import { useGrantableResources, useResourceActions } from './rolePermissionsData';
import { IAM_MODULE } from '../../../constants';

import type { NameResolver } from './permissionDrafts';
import type { LoadFailure, LoadedList } from './rolePermissionsData';
import type { PermissionName } from '../../../features/role/rolePermissions';
import type { NewRowFieldEditor, NewRowFieldEditorProps } from '@nikkierp/ui/components/ExcelDataTable';
import type { UseFormReturn } from 'react-hook-form';


export const TEST_ID_PREFIX = 'identity.rolePermissions';

/**
 * What the insert row's pickers share with the section. The pickers own the option lists, and the
 * section's `onCreated` receives only ids, so the pickers record the names they loaded for the draft
 * row to show, and expose the row's form for the section to pin a refusal on a picker.
 */
export type GrantEditorBridge = {
	names: Map<string, PermissionName>,
	form: UseFormReturn<any> | null,
};

export const GrantEditorContext = React.createContext<React.RefObject<GrantEditorBridge> | null>(null);

function useGrantEditorBridge(): React.RefObject<GrantEditorBridge> {
	const bridge = React.useContext(GrantEditorContext);
	if (!bridge) {
		throw new Error('The role permission pickers render only inside GrantEditorContext');
	}
	return bridge;
}

function useRememberNames(list: LoadedList<{ id: string, name?: PermissionName }>): void {
	const bridge = useGrantEditorBridge();
	React.useEffect(() => {
		list.items.forEach(item => bridge.current.names.set(item.id, item.name));
	}, [bridge, list.items]);
}

/** `[Resource v]`: picking another resource clears the action, whose options belong to the old one. */
function ResourceEditor({ field, form }: NewRowFieldEditorProps): React.ReactNode {
	const t = useTranslate([IAM_MODULE, 'common']);
	const nameOf = useNameResolver();
	const bridge = useGrantEditorBridge();
	const resources = useGrantableResources();
	useRememberNames(resources);
	React.useEffect(() => {
		bridge.current.form = form.form;
	});
	const value = useWatch({ control: form.form.control, name: field }) as string | undefined;
	const onChange = (picked: string) => {
		form.form.setValue(field, picked, { shouldDirty: true });
		form.form.setValue(ACTION_FIELD, undefined);
		form.form.clearErrors([field, ACTION_FIELD]);
	};
	const placeholder = resources.isPending ? 'messages.loading' : 'role_permission_selectResource';
	return (
		<>
			<SearchableSelect
				items={toResourceOptions(resources.items, nameOf)}
				variant='input'
				value={value ?? null}
				onChange={onChange}
				searchBoxEnabledAt={0}
				searchPlaceholder={t('action.search')}
				unselectedPlaceholder={t(placeholder)}
				testId={`${TEST_ID_PREFIX}.resource`}
			/>
			<EditorFeedback field={field} form={form.form} failure={resources.failure} />
		</>
	);
}

/** `[Action v]`, the picked resource's actions behind "All"; disabled until a resource is picked. */
function ActionEditor({ field, form }: NewRowFieldEditorProps): React.ReactNode {
	const t = useTranslate([IAM_MODULE, 'common']);
	const nameOf = useNameResolver();
	const resourceId = useWatch({ control: form.form.control, name: RESOURCE_FIELD }) as string | undefined;
	const value = useWatch({ control: form.form.control, name: field }) as string | null | undefined;
	const actions = useResourceActions(resourceId ?? null);
	useRememberNames(actions);
	const options = resourceId ? toActionOptions(actions.items, nameOf, t('role_permission_all')) : [];
	const onChange = (picked: string | null) => {
		form.form.setValue(field, picked === ALL_ACTIONS_VALUE ? null : picked ?? undefined, { shouldDirty: true });
		form.form.clearErrors(field);
	};
	return (
		<>
			<Select
				data={options}
				value={value === null ? ALL_ACTIONS_VALUE : value ?? null}
				onChange={onChange}
				disabled={!resourceId || actions.isPending}
				placeholder={t(actions.isPending ? 'messages.loading' : 'role_permission_selectAction')}
				allowDeselect={false}
				{...testAttrs(TEST_ID_PREFIX, 'action')}
			/>
			<EditorFeedback field={field} form={form.form} failure={actions.failure} />
		</>
	);
}

type EditorFeedbackProps = { field: string, form: UseFormReturn<any>, failure: LoadFailure | null };

/** The refusal the section pinned on the picker, else why its options could not be read. */
function EditorFeedback({ field, form, failure }: EditorFeedbackProps): React.ReactNode {
	const t = useTranslate([IAM_MODULE, 'common']);
	const describeFailure = useFailureDescriber();
	const { errors } = useFormState({ control: form.control, name: field });
	const pinned = errors[field]?.message;
	const message = typeof pinned === 'string' && pinned ? t(pinned) : describeFailure(failure);
	if (!message) {
		return null;
	}
	return (
		<Text size='xs' className={classes.errorText} {...testAttrs(TEST_ID_PREFIX, field, 'feedback')}>
			{message}
		</Text>
	);
}

/** Module-level, so the insert row keeps the same editor components (and their state) across renders. */
export const GRANT_FIELD_EDITORS: Record<string, NewRowFieldEditor> = {
	[RESOURCE_FIELD]: ResourceEditor,
	[ACTION_FIELD]: ActionEditor,
};

export function useNameResolver(): NameResolver {
	const localize = useLocalize(IAM_MODULE);
	return React.useCallback(name => resolveName(name, localize), [localize]);
}

export function useFailureDescriber(): (failure: LoadFailure | null) => string | null {
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
