import { cleanFormData } from '@nikkierp/common/utils';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate, useParams } from 'react-router';

import { AuthorizeDispatch, resourceActions, selectResourceState } from '@/appState';
import { Resource } from '@/features/resources';
import { validateResourceForm } from '@/features/resources/validation/resourceFormValidation';

import { useUIState } from '../../../../../shell/src/context/UIProviders';


type FormType = Parameters<typeof validateResourceForm>[2];

function useResourceDetailData() {
	const { resourceName } = useParams<{ resourceName: string }>();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { resources, isLoadingList } = useMicroAppSelector(selectResourceState);

	const resource = React.useMemo(() => {
		if (!resourceName) return undefined;
		return resources.find((r: Resource) => r.name === resourceName);
	}, [resourceName, resources]);

	React.useEffect(() => {
		if (resources.length === 0) {
			dispatch(resourceActions.listResources());
		}
	}, [dispatch, resources.length]);

	return { resource, isLoadingList };
}

function useCancelHandler(navigate: ReturnType<typeof useNavigate>, location: ReturnType<typeof useLocation>) {
	return React.useCallback(() => {
		navigate(resolvePath('..', location.pathname).pathname);
	}, [navigate, location]);
}

function validateDescriptionChange(
	newDescription: string | null | undefined,
	originalDescription: string | null | undefined,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
): boolean {
	const newDesc = newDescription ?? null;
	const originalDesc = originalDescription ?? null;

	if (newDesc === originalDesc) {
		notification.showError(
			translate('nikki.authorize.resource.errors.description_not_changed'),
			translate('nikki.general.messages.no_changes'),
		);
		setIsSubmitting(false);
		return false;
	}

	if (originalDesc !== null && originalDesc !== undefined && originalDesc !== '' && newDesc === null) {
		notification.showError(
			translate('nikki.authorize.resource.errors.description_cannot_remove'),
			translate('nikki.general.messages.invalid_change'),
		);
		setIsSubmitting(false);
		return false;
	}

	return true;
}

function handleUpdateResult(
	result: Awaited<ReturnType<ReturnType<typeof resourceActions.updateResource>>>,
	formData: Partial<Resource>,
	resource: Resource,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	navigate: ReturnType<typeof useNavigate>,
	location: ReturnType<typeof useLocation>,
) {
	if (result.meta.requestStatus === 'fulfilled') {
		notification.showInfo(
			translate('nikki.authorize.resource.messages.update_success', { name: formData.name || resource.name }),
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

async function performResourceUpdate(
	resource: Resource,
	formData: Partial<Resource>,
	newDescription: string | null,
	dispatch: AuthorizeDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	navigate: ReturnType<typeof useNavigate>,
	location: ReturnType<typeof useLocation>,
) {
	const result = await dispatch(resourceActions.updateResource({
		id: resource.id,
		etag: resource.etag,
		description: newDescription ?? undefined,
	}));

	handleUpdateResult(result, formData, resource, notification, translate, navigate, location);
}

function validateUpdateData(
	formData: Partial<Resource>,
	form: FormType,
	resource: Resource,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
): string | null | false {
	if (!validateResourceForm(formData, false, form)) {
		setIsSubmitting(false);
		return false;
	}

	const newDescription = formData.description ?? null;
	if (!validateDescriptionChange(
		newDescription,
		resource.description,
		notification,
		translate,
		setIsSubmitting,
	)) {
		return false;
	}

	return newDescription;
}

function prepareAndValidateUpdate(
	data: unknown,
	form: FormType,
	resource: Resource,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
): { formData: Partial<Resource>; newDescription: string | null } | null {
	const formData = cleanFormData(data as Partial<Resource>);
	setIsSubmitting(true);

	const newDescription = validateUpdateData(
		formData,
		form,
		resource,
		notification,
		translate,
		setIsSubmitting,
	);

	if (newDescription === false) {
		return null;
	}

	return { formData, newDescription };
}

async function executeResourceUpdate(
	resource: Resource,
	validated: { formData: Partial<Resource>; newDescription: string | null },
	dispatch: AuthorizeDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	navigate: ReturnType<typeof useNavigate>,
	location: ReturnType<typeof useLocation>,
	setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
) {
	await performResourceUpdate(
		resource,
		validated.formData,
		validated.newDescription,
		dispatch,
		notification,
		translate,
		navigate,
		location,
	);
	setIsSubmitting(false);
}

type UpdateSubmitParams = {
	data: unknown;
	form: FormType;
	resource: Resource;
	dispatch: AuthorizeDispatch;
	notification: ReturnType<typeof useUIState>['notification'];
	translate: ReturnType<typeof useTranslation>['t'];
	navigate: ReturnType<typeof useNavigate>;
	location: ReturnType<typeof useLocation>;
	setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
};

async function handleResourceUpdateSubmit(params: UpdateSubmitParams) {
	const { data, form, resource, notification, translate, setIsSubmitting } = params;
	const validated = prepareAndValidateUpdate(data, form, resource, notification, translate, setIsSubmitting);
	if (!validated) return;
	await executeResourceUpdate(
		resource,
		validated,
		params.dispatch,
		params.notification,
		params.translate,
		params.navigate,
		params.location,
		params.setIsSubmitting,
	);
}

function useSubmitHandler(
	resource: Resource | undefined,
	dispatch: AuthorizeDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	navigate: ReturnType<typeof useNavigate>,
	location: ReturnType<typeof useLocation>,
	setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
) {
	return React.useCallback(async (data: unknown, form: FormType) => {
		if (!resource) return;
		await handleResourceUpdateSubmit({
			data,
			form,
			resource,
			dispatch,
			notification,
			translate,
			navigate,
			location,
			setIsSubmitting,
		});
	}, [dispatch, notification, resource, translate, navigate, location, setIsSubmitting]);
}

function useResourceDetailHandlers(resource: Resource | undefined) {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	const handleCancel = useCancelHandler(navigate, location);
	const handleSubmit = useSubmitHandler(
		resource,
		dispatch,
		notification,
		translate,
		navigate,
		location,
		setIsSubmitting,
	);

	return { isSubmitting, handleCancel, handleSubmit };
}

export const useResourceDetail = {
	detail: useResourceDetailData,
	handlers: useResourceDetailHandlers,
};
