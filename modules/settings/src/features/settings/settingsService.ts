import * as request from '@nikkierp/common/request';
import { storeAsyncMethod, storeService } from '@nikkierp/ui/appState/store';

import { resolveSettingsOrgId } from './orgScope';
import { settingsStore } from '../../store';

import type {
	GetSettingsRequest, GetSettingsResponse, SetSettingsRequest, SetSettingsResponse,
} from './types';
import type { ServiceResult } from '@nikkierp/common/commandBus';


const SLICE_NAME = 'SettingsService';
const ORG_ID_FIELD = 'org_id';

/**
 * Reads and writes one module's settings at one level.
 *
 * The read is the Settings module's; the write goes to the owning module's own endpoint, which
 * validates against its own data (an enabled language, say) before persisting. Every module serves
 * it at the same path shape, so the module key alone names it.
 *
 * Not a `StoreCrudServiceBase`: settings are not a dynamic-model resource. There is no record id
 * and no schema registration -- a setting is addressed by module, level and name, and the level
 * is a path segment rather than a payload field so that a caller holding org permission cannot
 * reach the tenant level by sending a different string.
 *
 * The owner is derived by the backend from the token (the user, or the tenant constraint), except at
 * the org level, where a user may belong to several orgs: there the org the UI is showing is sent as
 * `org_id`, exactly as on every org-scoped resource, and the backend checks membership.
 */
@storeService(SLICE_NAME, settingsStore)
export class SettingsService {

	@storeAsyncMethod
	public async getSettings(req: GetSettingsRequest): Promise<ServiceResult<GetSettingsResponse>> {
		const orgId = await resolveSettingsOrgId(req);
		return request.get<GetSettingsResponse>(settingsPath(req.level, req.moduleKey), {
			searchParams: orgId ? [[ORG_ID_FIELD, orgId]] : [],
		});
	}

	@storeAsyncMethod
	public async setSettings(req: SetSettingsRequest): Promise<ServiceResult<SetSettingsResponse>> {
		const orgId = await resolveSettingsOrgId(req);
		return request.patch<SetSettingsResponse>(moduleSettingsPath(req.level, req.moduleKey), {
			// Only the changed items. See `SetSettingsRequest.items`.
			json: orgId ? { items: req.items, [ORG_ID_FIELD]: orgId } : { items: req.items },
		});
	}
}

/**
 * `v1/settings/{level}/{module_key}`, with no leading slash -- the request layer joins against a
 * `prefixUrl`, which a leading slash would discard.
 */
function settingsPath(level: string, moduleKey: string): string {
	return `v1/settings/${level}/${encodeURIComponent(moduleKey)}`;
}

/** `v1/{module_key}/settings/{level}`: the owning module's update endpoint. */
function moduleSettingsPath(level: string, moduleKey: string): string {
	return `v1/${encodeURIComponent(moduleKey)}/settings/${level}`;
}

export const settingsService = new SettingsService();
