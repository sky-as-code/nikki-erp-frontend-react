import { Stack } from '@mantine/core';
import { cleanFormData } from '@nikkierp/common/utils';
import { BreadcrumbsHeader, FormFieldProvider, FormStyleProvider } from '@nikkierp/ui/components';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate, useParams } from 'react-router';

import {
	AuthorizeDispatch,
	actionActions,
	entitlementActions,
	resourceActions,
	selectActionState,
	selectEntitlementState,
	selectResourceState,
} from '@/appState';
import {
	EntitlementFormActions,
	EntitlementFormContainer,
	EntitlementFormFields,
	EntitlementLoadingState,
	EntitlementNotFound,
} from '@/features/entitlements/components/EntitlementForm';
import entitlementSchema from '@/features/entitlements/entitlement-schema.json';

import { useUIState } from '../../../../shell/src/context/UIProviders';

import type { Entitlement } from '@/features/entitlements';


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

		const fromList = entitlements.find((e: Entitlement) => e.id === entitlementId);
		if (fromList) return fromList;

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
	const { t: translate } = useTranslation();
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	const handleCancel = React.useCallback(() => {
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

			const result = await dispatch(entitlementActions.updateEntitlement({
				id: entitlement.id,
				etag: entitlement.etag || '',
				name: newName !== originalName ? newName : undefined,
				description: newDescription !== originalDescription ? (newDescription ?? undefined) : undefined,
			}));

			if (result.meta.requestStatus === 'fulfilled') {
				notification.showInfo(
					translate('nikki.authorize.entitlement.messages.update_success', { name: entitlement.name }),
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
	}, [dispatch, notification, entitlement, navigate, location, translate]);

	return { isSubmitting, handleCancel, handleSubmit };
}

function EntitlementDetailPageBody(): React.ReactNode {
	const { entitlement, isLoading } = useEntitlementDetailData();
	const { isSubmitting, handleCancel, handleSubmit } = useEntitlementDetailHandlers(entitlement);
	const { t: translate } = useTranslation();
	const schema = entitlementSchema as ModelSchema;
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { resources } = useMicroAppSelector(selectResourceState);
	const { actions } = useMicroAppSelector(selectActionState);

	React.useEffect(() => {
		if (resources.length === 0) {
			dispatch(resourceActions.listResources());
		}
		if (actions.length === 0) {
			dispatch(actionActions.listActions(undefined));
		}
	}, [dispatch, resources.length, actions.length]);

	if (isLoading) {
		return <EntitlementLoadingState />;
	}

	if (!entitlement) {
		return <EntitlementNotFound onGoBack={handleCancel} />;
	}

	return (
		<Stack gap='md'>
			<BreadcrumbsHeader
				currentTitle={translate('nikki.authorize.entitlement.title_detail')}
				autoBuild={true}
				segmentKey='entitlements'
				parentTitle={translate('nikki.authorize.entitlement.title')}
			/>

			<EntitlementFormContainer title={entitlement.name}>
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
									<EntitlementFormActions
										isSubmitting={isSubmitting}
										onCancel={handleCancel}
										isCreate={false}
									/>
									<EntitlementFormFields
										isCreate={false}
										resources={resources}
										actions={actions}
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

const EntitlementDetailPageWithTitle: React.FC = () => {
	const { t: translate } = useTranslation();
	React.useEffect(() => {
		document.title = translate('nikki.authorize.entitlement.title_detail');
	}, [translate]);
	return <EntitlementDetailPageBody />;
};

export const EntitlementDetailPage: React.FC = EntitlementDetailPageWithTitle;

