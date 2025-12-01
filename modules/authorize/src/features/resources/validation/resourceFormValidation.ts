import { Resource, ResourceType } from '../../resources/types';

import type { UseFormReturn } from 'react-hook-form';


const ULID_PATTERN = /^[0-9A-HJKMNP-TV-Z]{26}$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
	const resourceType = formData.resourceType;
	const isNikkiApplication = resourceType === ResourceType.NIKKI_APPLICATION;
	const isCustom = resourceType === ResourceType.CUSTOM;

	if (isNikkiApplication) {
		if (!value) {
			setFieldError(form, 'resourceRef', '{ "$ref": "nikki.authorize.resource.errors.resource_ref_required" }');
			return false;
		}
		if (!ULID_PATTERN.test(value)) {
			setFieldError(form, 'resourceRef', '{ "$ref": "nikki.authorize.resource.errors.resource_ref_invalid_ulid" }');
			return false;
		}
	}

	if (isCustom && value) {
		if (!UUID_PATTERN.test(value)) {
			setFieldError(form, 'resourceRef', '{ "$ref": "nikki.authorize.resource.errors.resource_ref_invalid_uuid" }');
			return false;
		}
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
