import * as dyn from '@nikkierp/common/dynamicModel';
import React from 'react';

import { useCrudFormRuntime, useFormField } from './formContext';


type ScalarDefault = string | number | boolean;

/**
 * The value a create form pre-fills for a field from its schema `default_value`. Only simple
 * scalars qualify, and an enum default only when it is one of the field's options: the input must
 * be able to show what it holds.
 */
export function resolveCreateDefault(fieldDef: dyn.ModelSchemaField | undefined): ScalarDefault | undefined {
	const value = fieldDef?.default_value;
	if (!fieldDef || fieldDef.is_virtual || fieldDef.is_auto_generated || fieldDef.data_type.is_array) {
		return undefined;
	}
	if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
		return undefined;
	}
	if (fieldDef.data_type.name === 'enumString') {
		const options = fieldDef.data_type.options?.enumValues;
		return Array.isArray(options) && (options as unknown[]).includes(value) ? value : undefined;
	}
	return value;
}

/**
 * Pre-fills a rendered create-form field with its schema default while the form holds no value
 * for it. It acts per rendered field, so a field the page never shows sends nothing new, and a
 * value the page or the user provided (even `null` or '') is never overridden. It re-checks on
 * every form change, not only on mount: the provider's `reset(modelValue)` runs after the fields
 * mount and would otherwise wipe the default.
 */
export function useCreateDefault(name: string): void {
	const { formVariant, getFieldDef } = useFormField();
	const form = useCrudFormRuntime()?.form;
	const fallback = formVariant === 'create' ? resolveCreateDefault(getFieldDef(name)) : undefined;
	React.useEffect(() => {
		if (!form || fallback === undefined) {
			return undefined;
		}
		const apply = () => {
			if (form.getValues(name) === undefined) {
				form.setValue(name, fallback, { shouldDirty: false });
			}
		};
		apply();
		const subscription = form.watch((_, { name: changed }) => {
			if (changed === undefined || changed === name) {
				apply();
			}
		});
		return () => subscription.unsubscribe();
	}, [form, name, fallback]);
}
