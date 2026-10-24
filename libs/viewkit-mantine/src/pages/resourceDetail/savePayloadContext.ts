import React from 'react';

import { ResourceCreateContext } from './resourceCreateContext';
import { ResourceUpdateContext } from './resourceUpdateContext';

import type { RegisterUpdatePayload } from './afterSave';
import type { ClientErrorItem } from '@nikkierp/common/types';


/** The detail form's single write, as a section that contributes to it sees it in either mode. */
export type DetailSavePayload = {
	mode: 'create' | 'update',
	/** Undefined on a v1 detail page, which merges no contributions. */
	register: RegisterUpdatePayload | undefined,
	/** The last create's or update's rejections; empty until one occurs. */
	saveClientErrors: ClientErrorItem[],
};

const NO_ERRORS: ClientErrorItem[] = [];

/**
 * For a section placed in both `createNodes` and `childrenNodes` whose rows must be written in the
 * record's own create or update request. `null` outside a resource detail form.
 */
export function useDetailSavePayload(): DetailSavePayload | null {
	const update = React.useContext(ResourceUpdateContext);
	const create = React.useContext(ResourceCreateContext);
	const mode = update ? 'update' : (create ? 'create' : null);
	const register = update ? update.registerUpdatePayload : create?.registerCreatePayload;
	const saveClientErrors = (update ? update.saveClientErrors : create?.saveClientErrors) ?? NO_ERRORS;
	return React.useMemo(
		() => (mode ? { mode, register, saveClientErrors } : null),
		[mode, register, saveClientErrors],
	);
}
