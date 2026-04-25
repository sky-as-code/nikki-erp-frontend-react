import { Stack } from '@mantine/core';
import { CrudFormProvider, FormStyleProvider, AutoField } from '@nikkierp/ui/components';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { IdentityDispatch, hierarchyActions } from '../../../../appState';
import {
	selectCreateOrgUnit,
	selectDeleteOrgUnit,
	selectUpdateOrgUnit,
	selectOrgUnitDetail,
} from '../../../../appState/hierarchy';
import { FormLayout, FormLayoutRenderApi } from '../../../../components/FormLayout';
import { ORG_UNIT_SCHEMA_NAME } from '../../../../constants';
import { useOrgScopeRef } from '../../../../hooks';

import type { UseFormReturn } from 'react-hook-form';


export type OrgUnitFormVariant = 'create' | 'update';

type SubmitEventHandler = (e?: React.BaseSyntheticEvent) => Promise<void>;
type HandleSubmitFn = (onValid: (data: any) => any) => SubmitEventHandler;

export interface OrgUnitFormProps {
	variant: OrgUnitFormVariant;
	orgUnitId?: string;
	canCreate?: boolean;
	canUpdate?: boolean;
	canDelete?: boolean;
	onCreateSuccess?: (id: string) => void;
}

export function OrgUnitForm({
	variant,
	orgUnitId,
	canCreate = true,
	canUpdate = true,
	canDelete = true,
	onCreateSuccess,
}: OrgUnitFormProps): React.ReactElement {
	const isCreate = variant === 'create';
	const scopeRef = useOrgScopeRef();

	const submitAction = isCreate ? hierarchyActions.createHierarchy : hierarchyActions.updateHierarchy;
	const submitActionSelector = isCreate ? selectCreateOrgUnit : selectUpdateOrgUnit;

	const dataSelector = React.useMemo(() => {
		if (isCreate) return undefined;
		return (state: any) => selectOrgUnitDetail(state)?.data ?? undefined;
	}, [isCreate]);

	const loadDataAction = React.useMemo(() => {
		if (isCreate || !orgUnitId) return undefined;
		return () => hierarchyActions.getHierarchy({ id: orgUnitId, scopeRef });
	}, [isCreate, orgUnitId, scopeRef]);

	return (
		<FormStyleProvider layout='onecol'>
			<CrudFormProvider
				schemaName={ORG_UNIT_SCHEMA_NAME}
				formVariant={variant}
				submitAction={submitAction as (data: any) => any}
				submitActionSelector={submitActionSelector}
				dataSelector={dataSelector}
				loadDataAction={loadDataAction}
			>
				{({ handleSubmit, form, isLoading }) => (
					<OrgUnitFormContent
						variant={variant}
						orgUnitId={orgUnitId}
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

interface OrgUnitFormContentProps {
	variant: OrgUnitFormVariant;
	orgUnitId?: string;
	form: UseFormReturn<any>;
	isLoading: boolean;
	handleSubmit: HandleSubmitFn;
	canCreate: boolean;
	canUpdate: boolean;
	canDelete: boolean;
	onCreateSuccess?: (id: string) => void;
}

function OrgUnitFormContent({
	variant,
	orgUnitId,
	form,
	isLoading,
	handleSubmit,
	canCreate,
	canUpdate,
	canDelete,
	onCreateSuccess,
}: OrgUnitFormContentProps): React.ReactElement {
	const isCreate = variant === 'create';
	const dispatch: IdentityDispatch = useMicroAppDispatch();
	const scopeRef = useOrgScopeRef();

	const createCommand = useMicroAppSelector(selectCreateOrgUnit);
	const deleteCommand = useMicroAppSelector(selectDeleteOrgUnit);

	React.useEffect(() => {
		if (!isCreate || createCommand?.status !== 'success') return;
		const newId = (createCommand.data as { id?: string } | null)?.id;
		dispatch(hierarchyActions.resetCreateHierarchy());
		if (newId) {
			onCreateSuccess?.(newId);
		}
	}, [isCreate, createCommand?.status, createCommand?.data, dispatch, onCreateSuccess]);

	React.useEffect(() => {
		if (deleteCommand?.status === 'success') {
			dispatch(hierarchyActions.resetDeleteHierarchy());
		}
	}, [deleteCommand?.status, dispatch]);

	const handleDelete = React.useCallback(() => {
		if (!orgUnitId) return;
		dispatch(hierarchyActions.deleteHierarchy({ id: orgUnitId, scopeRef }));
	}, [dispatch, orgUnitId, scopeRef]);

	const onSubmit = handleSubmit((data) => {
		if (isCreate) {
			return { ...data, orgId: scopeRef };
		}
		if (!orgUnitId) return null;
		return { id: orgUnitId, ...data };
	});

	return (
		<form onSubmit={onSubmit} noValidate>
			<FormLayout>
				{(api) => (
					<OrgUnitFormFields
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

interface OrgUnitFormFieldsProps {
	api: FormLayoutRenderApi;
	variant: OrgUnitFormVariant;
	form: UseFormReturn<any>;
	isLoading: boolean;
	canCreate: boolean;
	canUpdate: boolean;
	canDelete: boolean;
	onDelete: () => void;
}

function OrgUnitFormFields({
	api,
	variant,
	form,
	isLoading,
	canCreate,
	canUpdate,
	canDelete,
	onDelete,
}: OrgUnitFormFieldsProps): React.ReactElement {
	const { t } = useTranslation();
	const isCreate = variant === 'create';
	const isDirty = form.formState.isDirty;

	React.useEffect(() => {
		api.setActions({
			showBack: true,
			showSave: isCreate ? canCreate : canUpdate,
			saveLabel: isCreate ? t('nikki.identity.hierarchy.actions.create') : t('nikki.identity.hierarchy.actions.save'),
			disableSave: isCreate ? (!canCreate || isLoading) : (!canUpdate || !isDirty || isLoading),
			isSaving: isLoading,
			showDelete: !isCreate,
			disableDelete: !canDelete || isLoading,
			onDelete: !isCreate && canDelete ? onDelete : undefined,
			deleteConfirm: !isCreate
				? {
					title: t('nikki.identity.hierarchy.actions.confirmDelete'),
					confirmLabel: t('nikki.identity.hierarchy.actions.delete'),
					message: t('nikki.identity.hierarchy.messages.confirmDeleteMessage'),
				}
				: undefined,
		});
	}, [api, isCreate, canCreate, canUpdate, canDelete, isLoading, isDirty, onDelete, t]);

	return (
		<Stack gap='md'>
			<AutoField name='name' autoFocused={isCreate} inputProps={{ disabled: isLoading }} />
			<AutoField name='parentId' inputProps={{ disabled: isLoading }} />
		</Stack>
	);
}
