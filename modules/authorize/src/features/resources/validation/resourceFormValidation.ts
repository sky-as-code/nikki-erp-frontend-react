import type { Resource } from '../../resources/types';
import type { UseFormReturn } from 'react-hook-form';


const NAME_PATTERN = /^[a-zA-Z0-9]+$/;
const ULID_PATTERN = /^[0-9A-HJKMNP-TV-Z]{26}$/;
const RESOURCE_TYPES = new Set(['nikki_application', 'custom']);
const SCOPE_TYPES = new Set(['domain', 'org', 'hierarchy', 'private']);

type FormValues = Partial<Resource>;

function setFieldError(
	form: UseFormReturn<any>,
	field: keyof Resource,
	message: string,
): void {
	form.setError(field as any, { type: 'manual', message });
}

function validateName(
	formData: FormValues,
	isCreate: boolean,
	form: UseFormReturn<any>,
): boolean {
	const value = formData.name?.trim();
	if (!value && isCreate) {
		setFieldError(form, 'name', 'Name is required');
		return false;
	}
	if (!value) return true;
	if (!NAME_PATTERN.test(value)) {
		setFieldError(form, 'name', 'Name must be alphanumeric');
		return false;
	}
	if (value.length > 64) {
		setFieldError(form, 'name', 'Name must not exceed 64 characters');
		return false;
	}
	return true;
}

function validateDescription(
	formData: FormValues,
	form: UseFormReturn<any>,
): boolean {
	const value = formData.description;
	if (value === undefined || value === null) return true;
	const trimmed = value.trim();
	if (!trimmed) {
		setFieldError(form, 'description', 'Description cannot be empty');
		return false;
	}
	if (trimmed.length > 255) {
		setFieldError(form, 'description', 'Description must not exceed 255 characters');
		return false;
	}
	return true;
}

function validateResourceType(
	formData: FormValues,
	form: UseFormReturn<any>,
): boolean {
	if (!formData.resourceType || !RESOURCE_TYPES.has(formData.resourceType)) {
		setFieldError(form, 'resourceType', 'Resource type is invalid');
		return false;
	}
	return true;
}

function validateScopeType(
	formData: FormValues,
	form: UseFormReturn<any>,
): boolean {
	if (!formData.scopeType || !SCOPE_TYPES.has(formData.scopeType)) {
		setFieldError(form, 'scopeType', 'Scope type is invalid');
		return false;
	}
	return true;
}

function validateResourceRef(
	formData: FormValues,
	form: UseFormReturn<any>,
): boolean {
	const value = formData.resourceRef?.trim();
	if (!value) {
		setFieldError(form, 'resourceRef', 'Resource reference is required');
		return false;
	}
	if (
		formData.resourceType === 'nikki_application' &&
		!ULID_PATTERN.test(value)
	) {
		setFieldError(form, 'resourceRef', 'Resource reference must be a valid ULID');
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
	isValid = validateName(formData, isCreate, form) && isValid;
	isValid = validateDescription(formData, form) && isValid;
	isValid = validateResourceType(formData, form) && isValid;
	isValid = validateScopeType(formData, form) && isValid;
	isValid = validateResourceRef(formData, form) && isValid;
	return isValid;
}


