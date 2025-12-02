import { Stack } from '@mantine/core';
import { cleanFormData } from '@nikkierp/common/utils';
import { FormFieldProvider, FormStyleProvider, withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate, useParams } from 'react-router';

import { useUIState } from '../../../../shell/src/context/UIProviders';
import { AuthorizeDispatch, roleActions, selectRoleState } from '../../appState';
import { BackButton } from '../../features/roles/components/Button';
import {
	RoleFormActions,
	RoleFormContainer,
	RoleFormFields,
	RoleLoadingState,
	RoleNotFound,
} from '../../features/roles/components/RoleForm';
import roleSchema from '../../features/roles/role-schema.json';
import { Role } from '../../features/roles/types';


function useRoleDetailData() {
	const { roleId } = useParams<{ roleId: string }>();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const {
		roles,
		isLoadingList,
		roleDetail,
		isLoadingDetail,
	} = useMicroAppSelector(selectRoleState);

	const role = React.useMemo(() => {
		if (!roleId) return undefined;

		const fromList = roles.find((e: Role) => e.id === roleId);
		if (fromList) return fromList;

		return roleDetail?.id === roleId ? roleDetail : undefined;
	}, [roleId, roles, roleDetail]);

	React.useEffect(() => {
		if (roleId && !role) {
			dispatch(roleActions.getRole(roleId));
		}
	}, [dispatch, roleId, role]);

	React.useEffect(() => {
		if (roles.length === 0) {
			dispatch(roleActions.listRoles());
		}
	}, [dispatch, roles.length]);

	return { role, isLoading: isLoadingList || isLoadingDetail };
}

function useRoleDetailHandlers(role: Role | undefined) {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	const handleGoBack = React.useCallback(() => {
		const parent = resolvePath('..', location.pathname).pathname;
		navigate(parent);
	}, [navigate, location]);

	const handleSubmit = React.useCallback(async (data: unknown) => {
		if (!role) return;

		const formData = cleanFormData(data as Partial<Role>);
		setIsSubmitting(true);

		try {
			const newDescription = formData.description ?? null;
			const originalDescription = role.description ?? null;
			const newName = formData.name ?? role.name;
			const originalName = role.name;

			if (newDescription === originalDescription && newName === originalName) {
				notification.showError(
					translate('nikki.general.messages.no_changes'),
					translate('nikki.general.messages.error'),
				);
				setIsSubmitting(false);
				return;
			}

			if (originalDescription !== null && newDescription === null) {
				notification.showError(
					translate('nikki.general.messages.invalid_change'),
					translate('nikki.general.messages.error'),
				);
				setIsSubmitting(false);
				return;
			}

			const result = await dispatch(roleActions.updateRole({
				id: role.id,
				etag: role.etag || '',
				name: newName !== originalName ? newName : undefined,
				description: newDescription !== originalDescription ? (newDescription ?? undefined) : undefined,
			}));

			if (result.meta.requestStatus === 'fulfilled') {
				notification.showInfo(
					translate('nikki.authorize.role.messages.update_success', { name: role.name }),
					translate('nikki.general.messages.success'),
				);
				const parent = resolvePath('..', location.pathname).pathname;
				navigate(parent);
			}
			else {
				const errorMessage = typeof result.payload === 'string' ? result.payload : translate('nikki.general.errors.update_failed');
				notification.showError(errorMessage, translate('nikki.general.messages.error'));
			}
		}
		catch (error) {
			notification.showError(
				translate('nikki.general.errors.update_failed'),
				translate('nikki.general.messages.error'),
			);
		}
		finally {
			setIsSubmitting(false);
		}
	}, [dispatch, notification, role, navigate, location, translate]);

	return { isSubmitting, handleGoBack, handleSubmit };
}

function RoleDetailPageBody(): React.ReactNode {
	const { role, isLoading } = useRoleDetailData();
	const { isSubmitting, handleGoBack, handleSubmit } = useRoleDetailHandlers(role);
	const { t: translate } = useTranslation();
	const schema = roleSchema as ModelSchema;

	if (isLoading) {
		return <RoleLoadingState />;
	}

	if (!role) {
		return <RoleNotFound onGoBack={handleGoBack} />;
	}

	return (
		<Stack gap='md'>
			<BackButton onClick={handleGoBack} />
			<RoleFormContainer title={translate('nikki.authorize.role.title_detail')}>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider
						formVariant='update'
						modelSchema={schema}
						modelValue={role as unknown as Record<string, unknown>}
						modelLoading={isSubmitting}
					>
						{({ handleSubmit: formHandleSubmit }) => (
							<form onSubmit={formHandleSubmit((data) => handleSubmit(data))} noValidate>
								<Stack gap='xs'>
									<RoleFormFields isCreate={false} />
									<RoleFormActions
										isSubmitting={isSubmitting}
										onCancel={handleGoBack}
										isCreate={false}
									/>
								</Stack>
							</form>
						)}
					</FormFieldProvider>
				</FormStyleProvider>
			</RoleFormContainer>
		</Stack>
	);
}

export const RoleDetailPage: React.FC = withWindowTitle('Role Details', RoleDetailPageBody);

