import { Stack } from '@mantine/core';
import { cleanFormData } from '@nikkierp/common/utils';
import { BreadcrumbsHeader, FormFieldProvider, FormStyleProvider } from '@nikkierp/ui/components';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate } from 'react-router';

import {
	AuthorizeDispatch,
	actionActions,
	entitlementActions,
	resourceActions,
	selectActionState,
	selectResourceState,
} from '@/appState';
import {
	EntitlementFormActions,
	EntitlementFormContainer,
	EntitlementFormFields,
} from '@/features/entitlements/components/entitlementForm';
import entitlementSchema from '@/features/entitlements/entitlement-schema.json';
import {
	buildActionExpr,
	validateEntitlementForm,
} from '@/features/entitlements/validation/entitlementFormValidation';

import { useUIState } from '../../../../shell/src/context/UIProviders';

import type { Action } from '@/features/actions';
import type { Entitlement } from '@/features/entitlements';
import type { Resource } from '@/features/resources';


type FormType = Parameters<typeof validateEntitlementForm>[2];

function useEntitlementCreateHandlers(
	resources: Resource[],
	actions: Action[],
) {
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

	const handleSubmit = React.useCallback(async (data: unknown, form: FormType) => {
		const formData = cleanFormData(data as Partial<Entitlement>);
		setIsSubmitting(true);

		if (!validateEntitlementForm(formData, true, form)) {
			setIsSubmitting(false);
			return;
		}

		formData.actionExpr = buildActionExpr(formData, resources, actions);
		formData.createdBy = '01JWNNJGS70Y07MBEV3AQ0M526';

		const result = await dispatch(entitlementActions.createEntitlement(
			formData as Omit<Entitlement, 'id' | 'createdAt' | 'etag' | 'assignmentsCount' | 'rolesCount'>,
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
	}, [dispatch, notification, location, translate, navigate, resources, actions]);

	return { isSubmitting, handleCancel, handleSubmit };
}

function EntitlementCreatePageBody(): React.ReactNode {
	const { t: translate } = useTranslation();
	const schema = entitlementSchema as ModelSchema;
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { resources } = useMicroAppSelector(selectResourceState);
	const { actions } = useMicroAppSelector(selectActionState);

	const {
		isSubmitting,
		handleCancel,
		handleSubmit,
	} = useEntitlementCreateHandlers(resources, actions);

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
			<BreadcrumbsHeader
				currentTitle={translate('nikki.authorize.entitlement.title_create')}
				autoBuild={true}
				segmentKey='entitlements'
				parentTitle={translate('nikki.authorize.entitlement.title')}
			/>

			<EntitlementFormContainer>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider formVariant='create' modelSchema={schema} modelLoading={isSubmitting}>
						{({ handleSubmit: formHandleSubmit, form }) => (
							<form onSubmit={formHandleSubmit((data) => handleSubmit(data, form))} noValidate>
								<Stack gap='xs'>
									<EntitlementFormActions
										isSubmitting={isSubmitting}
										onCancel={handleCancel}
										isCreate
									/>
									<EntitlementFormFields
										isCreate
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

const EntitlementCreatePageWithTitle: React.FC = () => {
	const { t: translate } = useTranslation();
	React.useEffect(() => {
		document.title = translate('nikki.authorize.entitlement.title_create');
	}, [translate]);
	return <EntitlementCreatePageBody />;
};

export const EntitlementCreatePage: React.FC = EntitlementCreatePageWithTitle;

