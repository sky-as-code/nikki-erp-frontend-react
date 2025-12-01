import { Stack } from '@mantine/core';
import { cleanFormData } from '@nikkierp/common/utils';
import { FormFieldProvider, FormStyleProvider, withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate, useParams } from 'react-router';

import { useUIState } from '../../../../shell/src/context/UIProviders';
import { AuthorizeDispatch, entitlementActions, selectEntitlementState } from '../../appState';
import entitlementSchema from '../../features/entitlements/entitlement-schema.json';
import {
	EntitlementFormActions,
	EntitlementFormContainer,
	EntitlementFormFields,
	EntitlementLoadingState,
	EntitlementNotFound,
} from '../../features/entitlements/components/EntitlementForm';
import { BackButton } from '../../features/entitlements/components/Button';
import { Entitlement } from '../../features/entitlements/types';


function useEntitlementDetailData() {
	const { entitlementId } = useParams<{ entitlementId: string }>();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const {
		entitlements,
		isLoadingList,
		entitlementDetail,
		isLoadingDetail,
	} = useMicroAppSelector(selectEntitlementState);

	const entitlement = React.useMemo(() => {
		if (!entitlementId) return undefined;
		// First check if we already have the entitlement in list
		const fromList = entitlements.find((e: Entitlement) => e.id === entitlementId);
		if (fromList) return fromList;
		// Otherwise use the detail from API
		return entitlementDetail?.id === entitlementId ? entitlementDetail : undefined;
	}, [entitlementId, entitlements, entitlementDetail]);

	React.useEffect(() => {
		if (entitlementId && !entitlement) {
			dispatch(entitlementActions.getEntitlement(entitlementId));
		}
	}, [dispatch, entitlementId, entitlement]);

	React.useEffect(() => {
		if (entitlements.length === 0) {
			dispatch(entitlementActions.listEntitlements());
		}
	}, [dispatch, entitlements.length]);

	return { entitlement, isLoading: isLoadingList || isLoadingDetail };
}

function useEntitlementDetailHandlers(entitlement: Entitlement | undefined) {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t } = useTranslation();
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	const handleGoBack = React.useCallback(() => {
		const parent = resolvePath('..', location.pathname).pathname;
		navigate(parent);
	}, [navigate, location]);

	const handleSubmit = React.useCallback(async (data: unknown) => {
		if (!entitlement) return;

		const formData = cleanFormData(data as Partial<Entitlement>);
		setIsSubmitting(true);

		try {
			const newDescription = formData.description ?? null;
			const originalDescription = entitlement.description ?? null;
			const newName = formData.name ?? entitlement.name;
			const originalName = entitlement.name;

			// Check if anything changed
			if (newDescription === originalDescription && newName === originalName) {
				notification.showError(
					t('nikki.general.messages.no_changes'),
					t('nikki.general.messages.error'),
				);
				setIsSubmitting(false);
				return;
			}

			// Business logic: Cannot remove existing description
			if (originalDescription !== null && newDescription === null) {
				notification.showError(
					t('nikki.general.messages.invalid_change'),
					t('nikki.general.messages.error'),
				);
				setIsSubmitting(false);
				return;
			}

			const result = await dispatch(entitlementActions.updateEntitlement({
				id: entitlement.id,
				etag: entitlement.etag || '',
				name: newName !== originalName ? newName : undefined,
				description: newDescription !== originalDescription ? (newDescription ?? undefined) : undefined,
			}));

			if (result.meta.requestStatus === 'fulfilled') {
				notification.showInfo(
					t('nikki.authorize.entitlement.messages.update_success', { name: entitlement.name }),
					t('nikki.general.messages.success'),
				);
				const parent = resolvePath('..', location.pathname).pathname;
				navigate(parent);
			}
			else {
				const errorMessage = typeof result.payload === 'string' ? result.payload : t('nikki.general.errors.update_failed');
				notification.showError(errorMessage, t('nikki.general.messages.error'));
			}
		}
		catch (error) {
			notification.showError(
				t('nikki.general.errors.update_failed'),
				t('nikki.general.messages.error'),
			);
		}
		finally {
			setIsSubmitting(false);
		}
	}, [dispatch, notification, entitlement, navigate, location, t]);

	return { isSubmitting, handleGoBack, handleSubmit };
}

function EntitlementDetailPageBody(): React.ReactNode {
	const { entitlement, isLoading } = useEntitlementDetailData();
	const { isSubmitting, handleGoBack, handleSubmit } = useEntitlementDetailHandlers(entitlement);
	const { t: translate } = useTranslation();
	const schema = entitlementSchema as ModelSchema;

	if (isLoading) {
		return <EntitlementLoadingState />;
	}

	if (!entitlement) {
		return <EntitlementNotFound onGoBack={handleGoBack} />;
	}

	return (
		<Stack gap='md'>
			<BackButton onClick={handleGoBack} />
			<EntitlementFormContainer title={translate('nikki.authorize.entitlement.title_detail')}>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider
						formVariant='update'
						modelSchema={schema}
						modelValue={entitlement as unknown as Record<string, unknown>}
						modelLoading={isSubmitting}
					>
						{({ handleSubmit: formHandleSubmit }) => (
							<form onSubmit={formHandleSubmit((data) => handleSubmit(data))} noValidate>
								<Stack gap='xs'>
									<EntitlementFormFields isCreate={false} />
									<EntitlementFormActions
										isSubmitting={isSubmitting}
										onCancel={handleGoBack}
										isCreate={false}
									/>
								</Stack>
							</form>
						)}
					</FormFieldProvider>
				</FormStyleProvider>
			</EntitlementFormContainer>
		</Stack>
	);
}

export const EntitlementDetailPage: React.FC = withWindowTitle('Entitlement Details', EntitlementDetailPageBody);

