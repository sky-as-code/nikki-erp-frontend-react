import { Resource, ResourceType } from '../../resources/types';

import type { UseFormReturn } from 'react-hook-form';


const ULID_PATTERN = /^[0-9A-HJKMNP-TV-Z]{26}$/;

type FormValues = Partial<Resource>;

function setFieldError(
	form: UseFormReturn<any>,
	field: keyof Resource,
	message: string,
): void {
	form.setError(field as any, { type: 'manual', message });
}

function validateResourceRef(
	formData: FormValues,
	form: UseFormReturn<any>,
): boolean {
	const value = formData.resourceRef?.trim();
	const resourceType = String(ResourceType.NIKKI_APPLICATION);
	if (!value) {
		setFieldError(form, 'resourceRef', '{ "$ref": "nikki.authorize.resource.errors.resource_ref_required" }');
		return false;
	}
	if (
		formData.resourceType === resourceType &&
		!ULID_PATTERN.test(value)
	) {
		setFieldError(form, 'resourceRef', '{ "$ref": "nikki.authorize.resource.errors.resource_ref_invalid_ulid" }');
		return false;
	}
	return true;
}

export function validateResourceForm(
	formData: FormValues,
	isCreate: boolean,
	form?: UseFormReturn<any>,
): boolean {
	if (!form) {
		return true;
	}
	form.clearErrors();
	let isValid = true;
	isValid = validateResourceRef(formData, form) && isValid;
	return isValid;
}
