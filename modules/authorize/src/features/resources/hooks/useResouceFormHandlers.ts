import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import React from 'react';

import { useUIState } from '../../../../../shell/src/context/UIProviders';
import { AuthorizeDispatch, resourceActions } from '../../../appState';
import { Resource } from '../types';
import { validateResourceForm } from '../validation/resourceFormValidation';

import type { UseFormReturn } from 'react-hook-form';


export interface ResourceFormModalProps {
	opened: boolean;
	mode: 'create' | 'edit';
	resource?: Resource;
	onClose: () => void;
}

async function handleCreateResource(
	dispatch: AuthorizeDispatch,
	formData: Partial<Resource>,
	notification: ReturnType<typeof useUIState>['notification'],
): Promise<void> {
	await dispatch(resourceActions.createResource({
		name: formData.name!,
		description: formData.description,
		resourceType: formData.resourceType!,
		resourceRef: formData.resourceRef!,
		scopeType: formData.scopeType!,
		createdBy: formData.createdBy || 'system',
	})).unwrap();
	notification.showInfo(
		`Resource "${formData.name}" has been created successfully`,
		'Success',
	);
}

async function handleUpdateResource(
	dispatch: AuthorizeDispatch,
	resource: Resource,
	formData: Partial<Resource>,
	notification: ReturnType<typeof useUIState>['notification'],
): Promise<void> {
	await dispatch(resourceActions.updateResource({
		id: resource.id,
		resource: {
			name: formData.name,
			description: formData.description,
			resourceType: formData.resourceType,
			resourceRef: formData.resourceRef,
			scopeType: formData.scopeType,
		},
		etag: resource.etag,
	})).unwrap();
	notification.showInfo(
		`Resource "${formData.name || resource.name}" has been updated successfully`,
		'Success',
	);
}

function handleSubmitError(
	isCreate: boolean,
	notification: ReturnType<typeof useUIState>['notification'],
): void {
	notification.showError(
		'Something went wrong. Please try again later.',
		isCreate ? 'Failed to create resource' : 'Failed to update resource',
	);
}

function useModalMetadata(
	props: ResourceFormModalProps,
	isCreate: boolean,
) {
	const modalTitle = isCreate ? 'Create Resource' : `Edit: ${props.resource?.name ?? ''}`;
	const modalModelValue = React.useMemo(
		() => (isCreate ? undefined : props.resource as unknown as Record<string, unknown>),
		[isCreate, props.resource],
	);
	return { modalTitle, modalModelValue };
}

type SubmissionParams = {
	isCreate: boolean;
	resource: ResourceFormModalProps['resource'];
	onClose: () => void;
	dispatch: AuthorizeDispatch;
	notification: ReturnType<typeof useUIState>['notification'];
};

type PersistParams = {
	isCreate: boolean;
	resource?: Resource;
	formData: Partial<Resource>;
	dispatch: AuthorizeDispatch;
	notification: ReturnType<typeof useUIState>['notification'];
};

async function persistResource({
	isCreate,
	resource,
	formData,
	dispatch,
	notification,
}: PersistParams) {
	if (isCreate) {
		await handleCreateResource(dispatch, formData, notification);
		return;
	}
	if (resource) {
		await handleUpdateResource(dispatch, resource, formData, notification);
	}
}

function useResourceFormSubmission(params: SubmissionParams) {
	const { isCreate, resource, onClose, dispatch, notification } = params;
	const [isSubmitting, setIsSubmitting] = React.useState(false);
	const submit = React.useCallback(
		async (data: unknown, form?: UseFormReturn<any>) => {
			const formData = data as Partial<Resource>;
			setIsSubmitting(true);
			if (!validateResourceForm(formData, isCreate, form)) {
				setIsSubmitting(false);
				return;
			}
			try {
				await persistResource({ isCreate, resource, formData, dispatch, notification });
				onClose();
			}
			catch {
				handleSubmitError(isCreate, notification);
			}
			finally {
				setIsSubmitting(false);
			}
		},
		[dispatch, isCreate, notification, onClose, resource],
	);
	const safeClose = React.useCallback(() => {
		if (!isSubmitting) onClose();
	}, [isSubmitting, onClose]);
	return { isSubmitting, submit, safeClose };
}

export default function useResourceFormHandlers(props: ResourceFormModalProps) {
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const isCreate = props.mode === 'create';
	const { modalTitle, modalModelValue } = useModalMetadata(props, isCreate);
	const { isSubmitting, submit, safeClose } = useResourceFormSubmission({
		isCreate,
		resource: props.resource,
		onClose: props.onClose,
		dispatch,
		notification,
	});

	return {
		isCreate,
		isSubmitting,
		modalTitle,
		modalModelValue,
		submit,
		safeClose,
	};
}
