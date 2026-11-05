import type { Command, ServiceResult } from '@nikkierp/common/commandBus';
import type * as dyn from '@nikkierp/common/dynamicModel';
import type { StoreCrudServiceBase } from '@nikkierp/ui/appState/store';


export type RecordActionRequest = {
	id: string,
	etag?: string,
};

/** `{id, add, remove}` as `RelatedAssignment` publishes it: ids of the picked or listed records. */
export type ScopeDeltaRequest = RecordActionRequest & {
	add?: string[],
	remove?: string[],
};

export type ProductSelectorKey = 'product_template_id' | 'product_variant_id';

/** `manage_products` adds `{product_template_id}` or `{product_variant_id}` objects and removes selector row ids. */
export type ProductDeltaRequest = RecordActionRequest & {
	add?: Partial<Record<ProductSelectorKey, string>>[],
	remove?: string[],
};

/**
 * Posts `{resource}/{id}/{action}`, or `{resource}/{action}` for a collection action. The id goes into the
 * sub-path: `manageM2m`'s `primaryResourceId` applies only to a nested resource, so a top-level post without it
 * lands on the collection route, which the backend answers 405.
 */
export function postRecordAction(
	service: StoreCrudServiceBase, request: Record<string, unknown>, action: string,
): Promise<ServiceResult<dyn.RestMutateResponse>> {
	const id = request.id as string | undefined;
	const path = id ? `${id}/${action}` : action;
	return service.manageM2m(request as dyn.RestManageM2mRequest, path);
}

export function payloadOf(command: Command): Record<string, unknown> {
	return (command.payload ?? {}) as Record<string, unknown>;
}

export function recordActionRequest(command: Command): RecordActionRequest {
	const payload = payloadOf(command);
	return {
		id: String(payload.id ?? ''),
		etag: payload.etag == null ? undefined : String(payload.etag),
	};
}

/** Empty sides are omitted, and blank or duplicate ids dropped: the backend could only reject them. */
export function scopeDeltaRequest(command: Command): ScopeDeltaRequest {
	const payload = payloadOf(command);
	return withSides(recordActionRequest(command), idList(payload.add), idList(payload.remove));
}

/** The picker hands over a record id; the backend wants it named as a template or a variant. */
export function productDeltaRequest(command: Command, key: ProductSelectorKey): ProductDeltaRequest {
	const payload = payloadOf(command);
	const add = idList(payload.add).map(id => ({ [key]: id }));
	return withSides(recordActionRequest(command), add, idList(payload.remove));
}

function withSides<TAdd>(
	request: RecordActionRequest, add: TAdd[], remove: string[],
): RecordActionRequest & { add?: TAdd[], remove?: string[] } {
	return {
		...request,
		...(add.length > 0 ? { add } : {}),
		...(remove.length > 0 ? { remove } : {}),
	};
}

function idList(value: unknown): string[] {
	if (!Array.isArray(value)) {
		return [];
	}
	const ids = value
		.filter(item => (typeof item === 'string' && item !== '') || typeof item === 'number')
		.map(String);
	return Array.from(new Set(ids));
}
