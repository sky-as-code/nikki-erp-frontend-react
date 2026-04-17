import * as request from '@nikkierp/common/request';
import { buildColumnsQuery, camelToSnakeObject, cleanEmptyString, snakeToCamelObject } from '@nikkierp/common/utils';


import type { Playlist, ResourceScopeType } from './types';
import type {
	PagedSearchResponse,
	RestArchiveResponse,
	RestCreateResponse,
	RestDeleteResponse,
	SearchParams,
	RestUpdateResponse,
} from '@/types';

import { buildSearchParams } from '@/helpers';


const BASE_PATH = 'vending-machine/playlists';

export type PlaylistSearchParams = SearchParams<Playlist> & {
	includeArchived?: boolean;
};

function playlistSearchParams(params?: PlaylistSearchParams): [string, string][] {
	const base = buildSearchParams<Playlist>(params) as [string, string][];
	if (params?.includeArchived !== undefined) {
		return [...base, ['include_archived', String(params.includeArchived)]];
	}
	return base;
}
export const playlistService = {
	async searchPlaylists(params?: PlaylistSearchParams): Promise<PagedSearchResponse<Playlist>> {
		const result = await request.get<any>(BASE_PATH, {
			searchParams: playlistSearchParams(params),
		});
		return snakeToCamelObject(result) as PagedSearchResponse<Playlist>;
	},

	async getPlaylist(id: string, columns?: Array<keyof Playlist>): Promise<Playlist> {
		const result = await request.get<any>(`${BASE_PATH}/${id}`, {
			searchParams: columns?.length ? [...buildColumnsQuery<Playlist>(columns)] : undefined,
		});
		return snakeToCamelObject(result) as Playlist;
	},

	async createPlaylist(body: {
		name: string;
		scopeType: ResourceScopeType;
		scopeRef?: string | null;
	}): Promise<RestCreateResponse> {
		const cleaned = cleanEmptyString(body as object);
		const result = await request.post<any>(BASE_PATH, { json: camelToSnakeObject(cleaned) });
		return snakeToCamelObject(result) as RestCreateResponse;
	},

	async updatePlaylist(
		id: string,
		body: { etag: string } & Partial<Pick<Playlist, 'name' | 'scopeType' | 'scopeRef'>>,
	): Promise<RestUpdateResponse> {
		const cleaned = cleanEmptyString(body as object);
		const result = await request.put<any>(`${BASE_PATH}/${id}`, { json: camelToSnakeObject(cleaned) });
		return snakeToCamelObject(result) as RestUpdateResponse;
	},

	async deletePlaylist(id: string): Promise<RestDeleteResponse> {
		const result = await request.del<any>(`${BASE_PATH}/${id}`);
		return snakeToCamelObject(result) as RestDeleteResponse;
	},

	async setPlaylistArchived(id: string, body: { etag: string; isArchived: boolean }): Promise<RestArchiveResponse> {
		const result = await request.post<any>(`${BASE_PATH}/${id}/archived`, {
			json: camelToSnakeObject(body),
		});
		return snakeToCamelObject(result) as RestArchiveResponse;
	},
};
