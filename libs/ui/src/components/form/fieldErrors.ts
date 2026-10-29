import { translateClientError } from '@nikkierp/common/types';
import React from 'react';

import { useTranslate } from '../../i18n';

import type { ClientErrorItem, ClientErrorTranslator } from '@nikkierp/common/types';
import type { UseFormReturn } from 'react-hook-form';


/**
 * The react-hook-form error type of a server rejection. Its message is already translated text,
 * whereas a client-side (zod) message is a translation key the field still has to translate.
 */
export const SERVER_ERROR_TYPE = 'server';

/**
 * Whether an input for `field` is mounted. An error set on a field the form does not show would
 * never be seen, so it is treated as field-less.
 */
export function isFieldOnForm(form: UseFormReturn<any>, field: string): boolean {
	return form.control._names.mount.has(field);
}

/**
 * Routes each server error to its form field, returning the ones that have no input to attach to
 * (anonymous business and authorization failures, or a field the form does not show), which the
 * caller shows in the error modal (`showClientErrorModal`).
 *
 * The message is translated here, with `vars`, because a field renderer only has the message
 * string: re-translating a sentence would make i18next read any `:` in it as a namespace separator.
 */
export function applyServerErrors(
	form: UseFormReturn<any>, clientErrors: ClientErrorItem[], translate: ClientErrorTranslator,
): ClientErrorItem[] {
	const unattached: ClientErrorItem[] = [];
	clientErrors.forEach(item => {
		if (item.field && isFieldOnForm(form, item.field)) {
			form.setError(item.field, { type: SERVER_ERROR_TYPE, message: translateClientError(translate, item) });
		}
		else {
			unattached.push(item);
		}
	});
	return unattached;
}

type ServerErrorSetter = (clientErrors: ClientErrorItem[]) => ClientErrorItem[];

/** `applyServerErrors` bound to `form` and the current language; stable while both are. */
export function useServerErrorSetter(form: UseFormReturn<any>): ServerErrorSetter {
	const translate = useTranslate();
	return React.useCallback(
		(clientErrors: ClientErrorItem[]) => applyServerErrors(form, clientErrors, translate),
		[form, translate],
	);
}

export type FieldErrorData = {
	error?: string,
	isServerError?: boolean,
};

/**
 * The text a field shows under its input: a client-side key goes through `translate`, a server
 * message is shown as is (see {@link applyServerErrors}).
 */
export function fieldErrorText(
	translate: (key: string) => string, fieldData: FieldErrorData,
): string | undefined {
	if (!fieldData.error) {
		return undefined;
	}
	return fieldData.isServerError ? fieldData.error : translate(fieldData.error);
}
