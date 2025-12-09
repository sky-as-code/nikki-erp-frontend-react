import { Stack } from '@mantine/core';
import { cleanFormData } from '@nikkierp/common/utils';
import { BreadcrumbsHeader, FormFieldProvider, FormStyleProvider, withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate, useParams } from 'react-router';

import { AuthorizeDispatch, roleSuiteActions, selectRoleSuiteState } from '@/appState';
import {
	RoleSuiteFormActions,
	RoleSuiteFormContainer,
	RoleSuiteFormFields,
	RoleSuiteLoadingState,
	RoleSuiteNotFound,
} from '@/features/roleSuite/components/RoleSuiteForm';
import roleSuiteSchema from '@/features/roleSuite/roleSuite-schema.json';

import { useUIState } from '../../../../shell/src/context/UIProviders';

import type { RoleSuite } from '@/features/roleSuite';


function useRoleSuiteDetailData() {
	const { roleSuiteId } = useParams<{ roleSuiteId: string }>();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const {
		roleSuites,
		isLoadingList,
		roleSuiteDetail,
		isLoadingDetail,
	} = useMicroAppSelector(selectRoleSuiteState);

	const roleSuite = React.useMemo(() => {
		if (!roleSuiteId) return undefined;

		const fromList = roleSuites.find((e: RoleSuite) => e.id === roleSuiteId);
		if (fromList) return fromList;

		return roleSuiteDetail?.id === roleSuiteId ? roleSuiteDetail : undefined;
	}, [roleSuiteId, roleSuites, roleSuiteDetail]);

	React.useEffect(() => {
		if (roleSuiteId && !roleSuite) {
			dispatch(roleSuiteActions.getRoleSuite(roleSuiteId));
		}
	}, [dispatch, roleSuiteId, roleSuite]);

	React.useEffect(() => {
		if (roleSuites.length === 0) {
			dispatch(roleSuiteActions.listRoleSuites());
		}
	}, [dispatch, roleSuites.length]);

	return { roleSuite, isLoading: isLoadingList || isLoadingDetail };
}

function useRoleSuiteDetailHandlers(roleSuite: RoleSuite | undefined) {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	const handleCancel = React.useCallback(() => {
		const parent = resolvePath('..', location.pathname).pathname;
		navigate(parent);
	}, [navigate, location]);

	const handleSubmit = React.useCallback(async (data: unknown) => {
		if (!roleSuite) return;

		const formData = cleanFormData(data as Partial<RoleSuite>);
		setIsSubmitting(true);

		try {
			const newDescription = formData.description ?? null;
			const originalDescription = roleSuite.description ?? null;
			const newName = formData.name ?? roleSuite.name;
			const originalName = roleSuite.name;

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

			const result = await dispatch(roleSuiteActions.updateRoleSuite({
				id: roleSuite.id,
				etag: roleSuite.etag || '',
				name: newName !== originalName ? newName : undefined,
				description: newDescription !== originalDescription ? (newDescription ?? undefined) : undefined,
			}));

			if (result.meta.requestStatus === 'fulfilled') {
				notification.showInfo(
					translate('nikki.authorize.role_suite.messages.update_success', { name: roleSuite.name }),
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
	}, [dispatch, notification, roleSuite, navigate, location, translate]);

	return { isSubmitting, handleCancel, handleSubmit };
}

function RoleSuiteDetailPageBody(): React.ReactNode {
	const { roleSuite, isLoading } = useRoleSuiteDetailData();
	const { isSubmitting, handleGoBack, handleSubmit } = useRoleSuiteDetailHandlers(roleSuite);
	const { t: translate } = useTranslation();
	const schema = roleSuiteSchema as ModelSchema;

	if (isLoading) {
		return <RoleSuiteLoadingState />;
	}

	if (!roleSuite) {
		return <RoleSuiteNotFound onGoBack={handleCancel} />;
	}

	return (
		<Stack gap='md'>
			<BreadcrumbsHeader
				currentTitle={translate('nikki.authorize.role_suite.title_detail')}
				autoBuild={true}
				segmentKey='role-suites'
				parentTitle={translate('nikki.authorize.role_suite.title')}
			/>

			<RoleSuiteFormContainer title={roleSuite.name}>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider
						formVariant='update'
						modelSchema={schema}
						modelValue={roleSuite as unknown as Record<string, unknown>}
						modelLoading={isSubmitting}
					>
						{({ handleSubmit: formHandleSubmit }) => (
							<form onSubmit={formHandleSubmit((data) => handleSubmit(data))} noValidate>
								<Stack gap='xs'>
									<RoleSuiteFormActions
										isSubmitting={isSubmitting}
										onCancel={handleCancel}
										isCreate={false}
									/>
									<RoleSuiteFormFields isCreate={false} />
								</Stack>
							</form>
						)}
					</FormFieldProvider>
				</FormStyleProvider>
			</RoleSuiteFormContainer>
		</Stack>
	);
}

export const RoleSuiteDetailPage: React.FC = withWindowTitle('Role Suite Details', RoleSuiteDetailPageBody);

