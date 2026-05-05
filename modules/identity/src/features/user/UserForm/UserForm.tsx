// import { Stack } from '@mantine/core';
// import {
// 	AutoField,
// 	CrudFormProvider,
// 	FormStyleProvider,
// } from '@nikkierp/ui/components';
// import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
// import React from 'react';
// import { useTranslation } from 'react-i18next';

// import {
// 	FormLayout,
// 	FormLayoutRenderApi,
// } from '../../../components/FormLayout';
// import { USER_SCHEMA_NAME } from '../../../constants';
// import { useOrgScopeRef } from '../../../hooks';

// import type { UseFormReturn } from 'react-hook-form';


// export type UserFormVariant = 'create' | 'update';

// export interface UserFormProps {
// 	variant: UserFormVariant;
// 	/**
// 	 * The user id being edited. Required for `variant='update'`.
// 	 */
// 	userId?: string;
// 	canCreate?: boolean;
// 	canUpdate?: boolean;
// 	canDelete?: boolean;
// 	/**
// 	 * Called after a successful create with the newly-created user id. The
// 	 * parent page uses this to navigate from the `/users/create` route to
// 	 * `/users/:id`, completing the seamless create->update transition.
// 	 */
// 	onCreateSuccess?: (id: string) => void;
// }

// /**
//  * Unified create/update form for the User model.
//  *
//  * - Uses `CrudFormProvider` to wire the form to the dynamic schema, redux
//  *   submit action, and (for update) the loaded entity selector.
//  * - Fields are rendered with `<AutoField>` so the schema drives the UI.
//  * - Action buttons (Back / Save / Delete / extras) live in `FormLayout`
//  *   which exposes a `setActions` API to the children renderer.
//  */
// export function UserForm({
// 	variant,
// 	userId,
// 	canCreate = true,
// 	canUpdate = true,
// 	canDelete = true,
// 	onCreateSuccess,
// }: UserFormProps): React.ReactElement {
// 	const isCreate = variant === 'create';
// 	const scopeRef = useOrgScopeRef();

// 	const submitAction = isCreate ? userActions.createUser : userActions.updateUser;
// 	const submitActionSelector = isCreate ? selectCreateUser : selectUpdateUser;

// 	// Only the update variant loads and displays an existing entity. For the
// 	// create variant we intentionally leave dataSelector/loadDataAction undefined
// 	// so the form starts empty.
// 	const dataSelector = React.useMemo(() => {
// 		if (isCreate) return undefined;
// 		return (state: any) => selectGetUser(state)?.data ?? undefined;
// 	}, [isCreate]);

// 	const loadDataAction = React.useMemo(() => {
// 		if (isCreate || !userId) return undefined;
// 		// `userActions` is loosely typed in the slice; cast at the call site.
// 		return () => (userActions.getUser as any)({ id: userId, scopeRef });
// 	}, [isCreate, userId, scopeRef]);

// 	return (
// 		<FormStyleProvider layout='onecol'>
// 			<CrudFormProvider
// 				schemaName={USER_SCHEMA_NAME}
// 				formVariant={variant}
// 				submitAction={submitAction as (data: any) => any}
// 				submitActionSelector={submitActionSelector}
// 				dataSelector={dataSelector}
// 				loadDataAction={loadDataAction}
// 			>
// 				{({ handleSubmit, form, isLoading }) => (
// 					<UserFormContent
// 						variant={variant}
// 						userId={userId}
// 						form={form}
// 						isLoading={isLoading}
// 						handleSubmit={handleSubmit}
// 						canCreate={canCreate}
// 						canUpdate={canUpdate}
// 						canDelete={canDelete}
// 						onCreateSuccess={onCreateSuccess}
// 					/>
// 				)}
// 			</CrudFormProvider>
// 		</FormStyleProvider>
// 	);
// }

// type SubmitEventHandler = (e?: React.BaseSyntheticEvent) => Promise<void>;
// type HandleSubmitFn = (onValid: (data: any) => any) => SubmitEventHandler;

// interface UserFormContentProps {
// 	variant: UserFormVariant;
// 	userId?: string;
// 	form: UseFormReturn<any>;
// 	isLoading: boolean;
// 	handleSubmit: HandleSubmitFn;
// 	canCreate: boolean;
// 	canUpdate: boolean;
// 	canDelete: boolean;
// 	onCreateSuccess?: (id: string) => void;
// }

// function UserFormContent({
// 	variant,
// 	userId,
// 	form,
// 	isLoading,
// 	handleSubmit,
// 	canCreate,
// 	canUpdate,
// 	canDelete,
// 	onCreateSuccess,
// }: UserFormContentProps): React.ReactElement {
// 	const isCreate = variant === 'create';
// 	const dispatch: IdentityDispatch = useMicroAppDispatch();
// 	const scopeRef = useOrgScopeRef();

// 	const createCommand = useMicroAppSelector(selectCreateUser);
// 	const deleteCommand = useMicroAppSelector(selectDeleteUser);

// 	// Emit onCreateSuccess callback when the create action transitions to success.
// 	// The parent page will use this to navigate to /users/:id.
// 	React.useEffect(() => {
// 		if (!isCreate) return;
// 		if (createCommand?.status !== 'success') return;

// 		const newId = (createCommand.data as { id?: string } | null)?.id;
// 		// Reset the redux state to avoid re-triggering on next mount.
// 		dispatch(userActions.resetCreateUser());
// 		if (newId) {
// 			onCreateSuccess?.(newId);
// 		}
// 	}, [isCreate, createCommand?.status, createCommand?.data, dispatch, onCreateSuccess]);

// 	React.useEffect(() => {
// 		if (deleteCommand?.status === 'success') {
// 			dispatch(userActions.resetDeleteUser());
// 		}
// 	}, [deleteCommand?.status, dispatch]);

// 	const handleDelete = React.useCallback(() => {
// 		if (!userId) return;
// 		dispatch((userActions.deleteUser as any)({ id: userId, scopeRef }));
// 	}, [dispatch, userId, scopeRef]);

// 	// The CrudFormProvider's `handleSubmit` runs zod validation and dispatches
// 	// the configured submit action with whatever we return from `onValid`. For
// 	// create we also need to supply a matching password confirmation.
// 	const onSubmit = handleSubmit((data) => {
// 		if (isCreate) {
// 			const passwords = validateAndGetPasswords(form);
// 			if (!passwords) return null;
// 			return { ...data, ...passwords };
// 		}
// 		if (!userId) return null;
// 		return { id: userId, ...data };
// 	});

// 	return (
// 		<form onSubmit={onSubmit} noValidate>
// 			<FormLayout>
// 				{(api) => (
// 					<UserFormFields
// 						api={api}
// 						variant={variant}
// 						form={form}
// 						isLoading={isLoading}
// 						canCreate={canCreate}
// 						canUpdate={canUpdate}
// 						canDelete={canDelete}
// 						onDelete={handleDelete}
// 					/>
// 				)}
// 			</FormLayout>
// 		</form>
// 	);
// }

// interface UserFormFieldsProps {
// 	api: FormLayoutRenderApi;
// 	variant: UserFormVariant;
// 	form: UseFormReturn<any>;
// 	isLoading: boolean;
// 	canCreate: boolean;
// 	canUpdate: boolean;
// 	canDelete: boolean;
// 	onDelete: () => void;
// }

// function UserFormFields({
// 	api,
// 	variant,
// 	form,
// 	isLoading,
// 	canCreate,
// 	canUpdate,
// 	canDelete,
// 	onDelete,
// }: UserFormFieldsProps): React.ReactElement {
// 	const { t } = useTranslation();
// 	const isCreate = variant === 'create';
// 	const isDirty = form.formState.isDirty;

// 	// Register/refresh the toolbar actions whenever the relevant state changes.
// 	React.useEffect(() => {
// 		api.setActions({
// 			showBack: true,
// 			showSave: isCreate ? canCreate : canUpdate,
// 			saveLabel: isCreate
// 				? t('nikki.identity.user.actions.create')
// 				: t('nikki.identity.user.actions.save'),
// 			disableSave: isCreate
// 				? (!canCreate || isLoading)
// 				: (!canUpdate || !isDirty || isLoading),
// 			isSaving: isLoading,
// 			showDelete: !isCreate,
// 			disableDelete: !canDelete || isLoading,
// 			onDelete: !isCreate && canDelete ? onDelete : undefined,
// 			deleteConfirm: !isCreate
// 				? {
// 					title: t('nikki.identity.user.actions.confirmDelete'),
// 					confirmLabel: t('nikki.identity.user.actions.delete'),
// 					message: t('nikki.identity.user.messages.confirmDeleteMessage'),
// 				}
// 				: undefined,
// 		});
// 	}, [api, isCreate, canCreate, canUpdate, canDelete, isLoading, isDirty, onDelete, t]);

// 	return (
// 		<Stack gap='md'>
// 			<AutoField
// 				name='email'
// 				autoFocused={isCreate}
// 				// Email is only editable when creating the user.
// 				inputProps={{disabled: isLoading }}
// 				htmlProps={{readOnly: !isCreate }}
// 			/>
// 			<AutoField name='display_name' inputProps={{ disabled: isLoading }} />
// 			<AutoField name='status' inputProps={{ disabled: isLoading }} />
// 			{isCreate && (
// 				<>
// 					<AutoField name='password' inputProps={{ disabled: isLoading }} />
// 					<AutoField name='confirmPassword' inputProps={{ disabled: isLoading }} />
// 				</>
// 			)}
// 		</Stack>
// 	);
// }

// function validateAndGetPasswords(
// 	form: UseFormReturn<any>,
// ): { password: string; confirmPassword: string } | null {
// 	const { password, confirmPassword } = form.getValues() as {
// 		password?: string;
// 		confirmPassword?: string;
// 	};

// 	let hasError = false;
// 	form.clearErrors(['password', 'confirmPassword']);

// 	if (!password) {
// 		hasError = true;
// 		form.setError('password', {
// 			type: 'manual',
// 			message: 'nikki.identity.user.errors.password_required',
// 		});
// 	}
// 	else if (password.length < 8) {
// 		hasError = true;
// 		form.setError('password', {
// 			type: 'manual',
// 			message: 'nikki.identity.user.errors.password_min_length_8',
// 		});
// 	}

// 	if (!confirmPassword) {
// 		hasError = true;
// 		form.setError('confirmPassword', {
// 			type: 'manual',
// 			message: 'nikki.identity.user.errors.confirm_password_required',
// 		});
// 	}
// 	else if (password && confirmPassword !== password) {
// 		hasError = true;
// 		form.setError('confirmPassword', {
// 			type: 'manual',
// 			message: 'nikki.identity.user.errors.passwords_do_not_match',
// 		});
// 	}

// 	if (hasError || !password || !confirmPassword) {
// 		return null;
// 	}

// 	return { password, confirmPassword };
// }
