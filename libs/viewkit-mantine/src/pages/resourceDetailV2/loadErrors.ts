import { notifyClientErrors } from '@nikkierp/common/service';
import { ClientErrorItem } from '@nikkierp/common/types';
import { useTranslate } from '@nikkierp/ui/i18n';
import React from 'react';

import { useResourceDetailTranslationNs } from '../resourceDetail/ResourceDetailProvider';


/** Whether the record fetch was refused because the record does not exist. */
export function isRecordNotFound(errors: ClientErrorItem[]): boolean {
	return errors.some(ClientErrorItem.isNotFoundError);
}

/**
 * Sends the record fetch's client errors to the Shell Notice stack, once per response, and says
 * whether the record was not found. Not-found is not sent: the page renders it inline instead.
 */
export function useRecordLoadErrors(errors: ClientErrorItem[]): boolean {
	const t = useTranslate(useResourceDetailTranslationNs());
	// `useCommand` hands out a new array per response, so identity marks a response already shown
	// even when `t` changes and the effect re-runs.
	const notifiedRef = React.useRef<unknown>(null);

	React.useEffect(() => {
		if (notifiedRef.current === errors) {
			return;
		}
		notifiedRef.current = errors;
		const others = errors.filter(item => !ClientErrorItem.isNotFoundError(item));
		if (others.length > 0) {
			notifyClientErrors(t, others);
		}
	}, [errors, t]);

	return isRecordNotFound(errors);
}
