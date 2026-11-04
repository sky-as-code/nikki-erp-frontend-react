import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import { SEQUENCE_PREVIEW_FIELDS } from './types';
import {
	ESSENTIAL_MODULE, SEQUENCE_COUNTER_SCHEMA_NAME, SEQUENCE_DEFINITION_SCHEMA_NAME, SEQUENCE_ISSUANCE_SCHEMA_NAME,
} from '../../constants';
import { essentialStore } from '../../store';

import type { SequencePreview, SequencePreviewRequest } from './types';
import type { ServiceResult } from '@nikkierp/common/commandBus';
import type * as dyn from '@nikkierp/common/dynamicModel';


/**
 * CRUD over `essential_sequence_definition`, plus `preview`. There is no delete: a definition is archived
 * (BR §4.4). Numbers are issued only by the backend's cross-module port, never from the browser.
 */
@storeService('SequenceDefinitionService', essentialStore)
export class SequenceDefinitionService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: ESSENTIAL_MODULE, schemaName: SEQUENCE_DEFINITION_SCHEMA_NAME });
	}

	/**
	 * Renders the code a configuration would produce for a sample number and time. The backend touches no
	 * counter or issuance and reserves nothing, so this is no mutation and emits no event.
	 */
	public preview(request: SequencePreviewRequest): Promise<ServiceResult<SequencePreview>> {
		return this.withSchema(async schema => {
			const body = await this.withOrgScope(schema, request as dyn.RestManageM2mRequest);
			return schema.restApi.manageM2m(body, 'preview') as unknown as Promise<ServiceResult<SequencePreview>>;
		});
	}

	/** Previews the saved configuration of the definition `request.id`: what the detail page's Preview shows. */
	public async previewSaved(request: { id: string }): Promise<ServiceResult<SequencePreview>> {
		const found = await this.getById({ id: request.id });
		const record = found.data?.item as Record<string, unknown> | undefined;
		if (!record) {
			return { data: null, clientErrors: found.clientErrors };
		}
		return this.preview(previewRequestOf(record));
	}
}

/** The configuration fields of a definition record, without the empty ones the server would default. */
export function previewRequestOf(record: Record<string, unknown>): SequencePreviewRequest {
	const request: Record<string, unknown> = {};
	for (const field of SEQUENCE_PREVIEW_FIELDS) {
		const value = record[field];
		if (value !== undefined && value !== null && value !== '') {
			request[field] = value;
		}
	}
	return request as SequencePreviewRequest;
}

/** Read-only: counters are written only by the issuing port (BR §8.2). */
@storeService('SequenceCounterService', essentialStore)
export class SequenceCounterService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: ESSENTIAL_MODULE, schemaName: SEQUENCE_COUNTER_SCHEMA_NAME });
	}
}

/** Read-only receipts of issued numbers, kept for the definition's retention period (BR §8.3). */
@storeService('SequenceIssuanceService', essentialStore)
export class SequenceIssuanceService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: ESSENTIAL_MODULE, schemaName: SEQUENCE_ISSUANCE_SCHEMA_NAME });
	}
}

export const sequenceDefinitionService = new SequenceDefinitionService();
export const sequenceCounterService = new SequenceCounterService();
export const sequenceIssuanceService = new SequenceIssuanceService();
