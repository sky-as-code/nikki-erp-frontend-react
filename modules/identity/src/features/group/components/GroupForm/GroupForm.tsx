import { Stack } from '@mantine/core';
import { CrudFormProvider, FormStyleProvider, AutoField } from '@nikkierp/ui/components';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { IdentityDispatch, groupActions } from '../../../../appState';
import { selectCreateGroup, selectDeleteGroup, selectUpdateGroup, selectGroupDetail } from '../../../../appState/group';
import { FormLayout, FormLayoutRenderApi } from '../../../../components/FormLayout';
import { GROUP_SCHEMA_NAME } from '../../../../constants';
import { useOrgScopeRef } from '../../../../hooks';

import type { UseFormReturn } from 'react-hook-form';

export type GroupFormVariant = 'create' | 'update';

type SubmitEventHandler = (e?: React.BaseSyntheticEvent) => Promise<void>;
type HandleSubmitFn = (onValid: (data: any) => any) => SubmitEventHandler;

export interface GroupFormProps {
	variant: GroupFormVariant;
	groupId?: string;
	canCreate?: boolean;
	canUpdate?: boolean;
	canDelete?: boolean;
	onCreateSuccess?: (id: string) => void;
}

export function GroupForm({
	variant,
	groupId,
	canCreate = true,
	canUpdate = true,
	canDelete = true,
	onCreateSuccess,
}: GroupFormProps): React.ReactElement {
	const isCreate = variant === 'create';
	const scopeRef = useOrgScopeRef();

	const submitAction = isCreate ? groupActions.createGroup : groupActions.updateGroup;
	const submitActionSelector = isCreate ? selectCreateGroup : selectUpdateGroup;

	const dataSelector = React.useMemo(() => {
		if (isCreate) return undefined;
		return (state: any) => selectGroupDetail(state)?.data ?? undefined;
	}, [isCreate]);

	const loadDataAction = React.useMemo(() => {
		if (isCreate || !groupId) return undefined;
		return () => groupActions.getGroup({ id: groupId, scopeRef });
	}, [isCreate, groupId, scopeRef]);

	return (
		<FormStyleProvider layout='onecol'>
			<CrudFormProvider
				schemaName={GROUP_SCHEMA_NAME}
				formVariant={variant}
				submitAction={submitAction as (data: any) => any}
				submitActionSelector={submitActionSelector}
				dataSelector={dataSelector}
				loadDataAction={loadDataAction}
			>
				{({ handleSubmit, form, isLoading }) => (
					<GroupFormContent
						variant={variant}
						groupId={groupId}
						form={form}
						isLoading={isLoading}
						handleSubmit={handleSubmit}
						canCreate={canCreate}
						canUpdate={canUpdate}
						canDelete={canDelete}
						onCreateSuccess={onCreateSuccess}
					/>
				)}
			</CrudFormProvider>
		</FormStyleProvider>
	);
}

interface GroupFormContentProps {
	variant: GroupFormVariant;
	groupId?: string;
	form: UseFormReturn<any>;
	isLoading: boolean;
	handleSubmit: HandleSubmitFn;
	canCreate: boolean;
	canUpdate: boolean;
	canDelete: boolean;
	onCreateSuccess?: (id: string) => void;
}

function GroupFormContent({
	variant,
	groupId,
	form,
	isLoading,
	handleSubmit,
	canCreate,
	canUpdate,
	canDelete,
	onCreateSuccess,
}: GroupFormContentProps): React.ReactElement {
	const isCreate = variant === 'create';
	const dispatch: IdentityDispatch = useMicroAppDispatch();
	const scopeRef = useOrgScopeRef();

	const createCommand = useMicroAppSelector(selectCreateGroup);
	const deleteCommand = useMicroAppSelector(selectDeleteGroup);

	React.useEffect(() => {
		if (!isCreate || createCommand?.status !== 'success') return;
		const newId = (createCommand.data as { id?: string } | null)?.id;
		dispatch(groupActions.resetCreateGroup());
		if (newId) {
			onCreateSuccess?.(newId);
		}
	}, [isCreate, createCommand?.status, createCommand?.data, dispatch, onCreateSuccess]);

	React.useEffect(() => {
		if (deleteCommand?.status === 'success') {
			dispatch(groupActions.resetDeleteGroup());
		}
	}, [deleteCommand?.status, dispatch]);

	const handleDelete = React.useCallback(() => {
		if (!groupId) return;
		dispatch(groupActions.deleteGroup({ id: groupId, scopeRef }));
	}, [dispatch, groupId, scopeRef]);

	const onSubmit = handleSubmit((data) => {
		if (isCreate) {
			return { ...data, orgId: scopeRef };
		}
		if (!groupId) return null;
		return { id: groupId, ...data };
	});

	return (
		<form onSubmit={onSubmit} noValidate>
			<FormLayout>
				{(api) => (
					<GroupFormFields
						api={api}
						variant={variant}
						form={form}
						isLoading={isLoading}
						canCreate={canCreate}
						canUpdate={canUpdate}
						canDelete={canDelete}
						onDelete={handleDelete}
					/>
				)}
			</FormLayout>
		</form>
	);
}

interface GroupFormFieldsProps {
	api: FormLayoutRenderApi;
	variant: GroupFormVariant;
	form: UseFormReturn<any>;
	isLoading: boolean;
	canCreate: boolean;
	canUpdate: boolean;
	canDelete: boolean;
	onDelete: () => void;
}

function GroupFormFields({
	api,
	variant,
	form,
	isLoading,
	canCreate,
	canUpdate,
	canDelete,
	onDelete,
}: GroupFormFieldsProps): React.ReactElement {
	const { t } = useTranslation();
	const isCreate = variant === 'create';
	const isDirty = form.formState.isDirty;

	React.useEffect(() => {
		api.setActions({
			showBack: true,
			showSave: isCreate ? canCreate : canUpdate,
			saveLabel: isCreate ? t('nikki.identity.group.actions.create') : t('nikki.identity.group.actions.save'),
			disableSave: isCreate ? (!canCreate || isLoading) : (!canUpdate || !isDirty || isLoading),
			isSaving: isLoading,
			showDelete: !isCreate,
			disableDelete: !canDelete || isLoading,
			onDelete: !isCreate && canDelete ? onDelete : undefined,
			deleteConfirm: !isCreate
				? {
					title: t('nikki.identity.group.actions.confirmDelete'),
					confirmLabel: t('nikki.identity.group.actions.delete'),
					message: t('nikki.identity.group.messages.confirmDeleteMessage'),
				}
				: undefined,
		});
	}, [api, isCreate, canCreate, canUpdate, canDelete, isLoading, isDirty, onDelete, t]);

	return (
		<Stack gap='md'>
			<AutoField name='name' autoFocused={isCreate} inputProps={{ disabled: isLoading }} />
			<AutoField name='description' inputProps={{ disabled: isLoading }} />
		</Stack>
	);
}
