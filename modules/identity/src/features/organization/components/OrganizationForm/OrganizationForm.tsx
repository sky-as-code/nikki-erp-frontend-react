import { Stack } from '@mantine/core';
import { CrudFormProvider, FormStyleProvider, AutoField } from '@nikkierp/ui/components';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { IdentityDispatch, organizationActions } from '../../../../appState';
import {
	selectCreateOrganization,
	selectDeleteOrganization,
	selectUpdateOrganization,
	selectOrganizationDetail,
} from '../../../../appState/organization';
import { FormLayout, FormLayoutRenderApi } from '../../../../components/FormLayout';
import { ORGANIZATION_SCHEMA_NAME } from '../../../../constants';

import type { UseFormReturn } from 'react-hook-form';

export type OrganizationFormVariant = 'create' | 'update';

type SubmitEventHandler = (e?: React.BaseSyntheticEvent) => Promise<void>;
type HandleSubmitFn = (onValid: (data: any) => any) => SubmitEventHandler;

export interface OrganizationFormProps {
	variant: OrganizationFormVariant;
	slug?: string;
	canCreate?: boolean;
	canUpdate?: boolean;
	canDelete?: boolean;
	onCreateSuccess?: (slug: string) => void;
}

export function OrganizationForm({
	variant,
	slug,
	canCreate = true,
	canUpdate = true,
	canDelete = true,
	onCreateSuccess,
}: OrganizationFormProps): React.ReactElement {
	const isCreate = variant === 'create';

	const submitAction = isCreate ? organizationActions.createOrganization : organizationActions.updateOrganization;
	const submitActionSelector = isCreate ? selectCreateOrganization : selectUpdateOrganization;

	const dataSelector = React.useMemo(() => {
		if (isCreate) return undefined;
		return (state: any) => selectOrganizationDetail(state)?.data ?? undefined;
	}, [isCreate]);

	const loadDataAction = React.useMemo(() => {
		if (isCreate || !slug) return undefined;
		return () => organizationActions.getOrganization(slug);
	}, [isCreate, slug]);

	return (
		<FormStyleProvider layout='onecol'>
			<CrudFormProvider
				schemaName={ORGANIZATION_SCHEMA_NAME}
				formVariant={variant}
				submitAction={submitAction as (data: any) => any}
				submitActionSelector={submitActionSelector}
				dataSelector={dataSelector}
				loadDataAction={loadDataAction}
			>
				{({ handleSubmit, form, isLoading }) => (
					<OrganizationFormContent
						variant={variant}
						slug={slug}
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

interface OrganizationFormContentProps {
	variant: OrganizationFormVariant;
	slug?: string;
	form: UseFormReturn<any>;
	isLoading: boolean;
	handleSubmit: HandleSubmitFn;
	canCreate: boolean;
	canUpdate: boolean;
	canDelete: boolean;
	onCreateSuccess?: (slug: string) => void;
}

function OrganizationFormContent({
	variant,
	slug,
	form,
	isLoading,
	handleSubmit,
	canCreate,
	canUpdate,
	canDelete,
	onCreateSuccess,
}: OrganizationFormContentProps): React.ReactElement {
	const isCreate = variant === 'create';
	const dispatch: IdentityDispatch = useMicroAppDispatch();

	const createCommand = useMicroAppSelector(selectCreateOrganization);
	const deleteCommand = useMicroAppSelector(selectDeleteOrganization);
	const organizationDetail = useMicroAppSelector(selectOrganizationDetail);

	React.useEffect(() => {
		if (!isCreate || createCommand?.status !== 'success') return;
		const newSlug = (form.getValues() as { slug?: string }).slug;
		dispatch(organizationActions.resetCreateOrganization());
		if (newSlug) {
			onCreateSuccess?.(newSlug);
		}
	}, [isCreate, createCommand?.status, dispatch, onCreateSuccess, form]);

	React.useEffect(() => {
		if (deleteCommand?.status === 'success') {
			dispatch(organizationActions.resetDeleteOrganization());
		}
	}, [deleteCommand?.status, dispatch]);

	const handleDelete = React.useCallback(() => {
		if (!slug) return;
		dispatch(organizationActions.deleteOrganization(slug));
	}, [dispatch, slug]);

	const onSubmit = handleSubmit((data) => {
		if (isCreate) {
			return data;
		}
		if (!slug || !organizationDetail?.data?.id) return null;
		return { slug, id: organizationDetail.data.id, ...data };
	});

	return (
		<form onSubmit={onSubmit} noValidate>
			<FormLayout>
				{(api) => (
					<OrganizationFormFields
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

interface OrganizationFormFieldsProps {
	api: FormLayoutRenderApi;
	variant: OrganizationFormVariant;
	form: UseFormReturn<any>;
	isLoading: boolean;
	canCreate: boolean;
	canUpdate: boolean;
	canDelete: boolean;
	onDelete: () => void;
}

function OrganizationFormFields({
	api,
	variant,
	form,
	isLoading,
	canCreate,
	canUpdate,
	canDelete,
	onDelete,
}: OrganizationFormFieldsProps): React.ReactElement {
	const { t } = useTranslation();
	const isCreate = variant === 'create';
	const isDirty = form.formState.isDirty;

	React.useEffect(() => {
		api.setActions({
			showBack: true,
			showSave: isCreate ? canCreate : canUpdate,
			saveLabel: isCreate
				? t('nikki.identity.organization.actions.create')
				: t('nikki.identity.organization.actions.save'),
			disableSave: isCreate ? (!canCreate || isLoading) : (!canUpdate || !isDirty || isLoading),
			isSaving: isLoading,
			showDelete: !isCreate,
			disableDelete: !canDelete || isLoading,
			onDelete: !isCreate && canDelete ? onDelete : undefined,
			deleteConfirm: !isCreate
				? {
					title: t('nikki.identity.organization.actions.confirmDelete'),
					confirmLabel: t('nikki.identity.organization.actions.delete'),
					message: t('nikki.identity.organization.messages.confirmDeleteMessage'),
				}
				: undefined,
		});
	}, [api, isCreate, canCreate, canUpdate, canDelete, isLoading, isDirty, onDelete, t]);

	return (
		<Stack gap='md'>
			<AutoField name='displayName' autoFocused={isCreate} inputProps={{ disabled: isLoading }} />
			<AutoField name='legalName' inputProps={{ disabled: isLoading }} />
			<AutoField name='phoneNumber' inputProps={{ disabled: isLoading }} />
			<AutoField name='address' inputProps={{ disabled: isLoading }} />
			<AutoField name='slug' inputProps={{ disabled: isLoading || !isCreate }} />
			{!isCreate && <AutoField name='status' inputProps={{ disabled: isLoading }} />}
		</Stack>
	);
}
