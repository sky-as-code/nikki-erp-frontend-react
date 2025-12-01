import { Stack } from '@mantine/core';
import { cleanFormData } from '@nikkierp/common/utils';
import { FormFieldProvider, FormStyleProvider, withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate } from 'react-router';

import { useUIState } from '../../../../shell/src/context/UIProviders';
import {
	AuthorizeDispatch,
	actionActions,
	entitlementActions,
	resourceActions,
	selectActionState,
	selectResourceState,
} from '../../appState';
import entitlementSchema from '../../features/entitlements/entitlement-schema.json';
import {
	EntitlementFormActions,
	EntitlementFormContainer,
	EntitlementFormFields,
} from '../../features/entitlements/components/EntitlementForm';
import { BackButton } from '../../features/entitlements/components/Button';
import { Entitlement } from '../../features/entitlements/types';


function useEntitlementCreateHandlers() {
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
		const formData = cleanFormData(data as Partial<Entitlement>);
		setIsSubmitting(true);

		const result = await dispatch(entitlementActions.createEntitlement(
			formData as Omit<Entitlement, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'etag' | 'assignmentsCount' | 'rolesCount'>,
		));

		if (result.meta.requestStatus === 'fulfilled') {
			notification.showInfo(
				translate('nikki.authorize.entitlement.messages.create_success', { name: formData.name }),
				translate('nikki.general.messages.success'),
			);
			const parent = resolvePath('..', location.pathname).pathname;
			navigate(parent);
		}
		else {
			const errorMessage = typeof result.payload === 'string' ? result.payload : translate('nikki.general.errors.create_failed');
			notification.showError(errorMessage, translate('nikki.general.messages.error'));
		}

		setIsSubmitting(false);
	}, [dispatch, notification, location, translate, navigate]);

	return { isSubmitting, handleGoBack, handleSubmit };
}

function EntitlementCreatePageBody(): React.ReactNode {
	const {
		isSubmitting,
		handleGoBack,
		handleSubmit,
	} = useEntitlementCreateHandlers();
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

	return (
		<Stack gap='md'>
			<BackButton onClick={handleGoBack} />
			<EntitlementFormContainer title={translate('nikki.authorize.entitlement.title_create')}>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider formVariant='create' modelSchema={schema} modelLoading={isSubmitting}>
						{({ handleSubmit: formHandleSubmit }) => (
							<form onSubmit={formHandleSubmit((data) => handleSubmit(data))} noValidate>
								<Stack gap='xs'>
									<EntitlementFormFields
										isCreate
										resources={resources}
										actions={actions}
									/>
									<EntitlementFormActions
										isSubmitting={isSubmitting}
										onCancel={handleGoBack}
										isCreate
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

export const EntitlementCreatePage: React.FC = withWindowTitle('Create Entitlement', EntitlementCreatePageBody);

