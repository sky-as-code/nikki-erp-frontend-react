import type { Action } from '../../actions';
import type { Resource } from '../../resources';
import type { Entitlement } from '../types';
import type { UseFormReturn } from 'react-hook-form';


export const ALL_RESOURCES_VALUE = '__ALL_RESOURCES__';
export const ALL_ACTIONS_VALUE = '__ALL_ACTIONS__';


type FormValues = Partial<Entitlement>;

function setFieldError(
	form: UseFormReturn<any>,
	field: keyof Entitlement,
	message: string,
): void {
	form.setError(field as any, { type: 'manual', message });
}

function validateResourceAndAction(
	formData: FormValues,
	form: UseFormReturn<any>,
): boolean {
	let resourceId = formData.resourceId?.trim() || undefined;
	let actionId = formData.actionId?.trim() || undefined;

	if (resourceId === ALL_RESOURCES_VALUE) {
		resourceId = undefined;
	}
	if (actionId === ALL_ACTIONS_VALUE) {
		actionId = undefined;
	}

	formData.resourceId = resourceId;
	formData.actionId = actionId;

	if (actionId && !resourceId) {
		setFieldError(
			form,
			'resourceId',
			'{ "$ref": "nikki.authorize.entitlement.errors.resource_required" }',
		);
		return false;
	}

	return true;
}

export function validateEntitlementForm(
	formData: FormValues,
	isCreate: boolean,
	form?: UseFormReturn<any>,
): boolean {
	if (!form) {
		return true;
	}

	form.clearErrors();
	let isValid = true;

	if (isCreate) {
		isValid = validateResourceAndAction(formData, form) && isValid;
	}

	return isValid;
}

export function buildActionExpr(
	formData: FormValues,
	resources: Resource[],
	actions: Action[],
): string {
	let resourceName = '*';
	let actionName = '*';

	if (formData.resourceId) {
		const resource = resources.find((r) => r.id === formData.resourceId);
		if (resource) {
			resourceName = resource.name;
		}
	}

	if (formData.actionId) {
		const action = actions.find((a) => a.id === formData.actionId);
		if (action) {
			actionName = action.name;
		}
	}

	return `${resourceName}:${actionName}`;
}
