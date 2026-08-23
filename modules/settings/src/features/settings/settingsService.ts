import * as request from '@nikkierp/common/request';
import { storeAsyncMethod, storeService } from '@nikkierp/ui/appState/store';

import { settingsStore } from '../../store';

import type {
	GetSettingsRequest, GetSettingsResponse, SetSettingsRequest, SetSettingsResponse,
} from './types';
import type { ServiceResult } from '@nikkierp/common/commandBus';


const SLICE_NAME = 'SettingsService';

/**
 * Reads and writes one module's settings at one level.
 *
 * Not a `StoreCrudServiceBase`: settings are not a dynamic-model resource. There is no record id
 * and no schema registration -- a setting is addressed by module, level and name, and the level
 * is a path segment rather than a payload field so that a caller holding org permission cannot
 * reach the tenant level by sending a different string.
 *
 * The owner is never sent. The backend derives it from the token (the user, their acting org, or
 * the tenant constraint), so a request carries only the module key.
 */
@storeService(SLICE_NAME, settingsStore)
export class SettingsService {

	@storeAsyncMethod
	public async getSettings(req: GetSettingsRequest): Promise<ServiceResult<GetSettingsResponse>> {
		return request.get<GetSettingsResponse>(settingsPath(req.level, req.moduleKey));
	}

	@storeAsyncMethod
	public async setSettings(req: SetSettingsRequest): Promise<ServiceResult<SetSettingsResponse>> {
		return request.patch<SetSettingsResponse>(settingsPath(req.level, req.moduleKey), {
			// Only the changed items. See `SetSettingsRequest.items`.
			json: { items: req.items },
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

export const settingsService = new SettingsService();
