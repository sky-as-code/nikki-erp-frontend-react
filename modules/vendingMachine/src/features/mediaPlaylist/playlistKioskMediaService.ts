import * as request from '@nikkierp/common/request';
import { camelToSnakeObject, snakeToCamelObject } from '@nikkierp/common/utils';

import { buildSearchParams } from '@/helpers';

import type { PlaylistKioskMedia, PlaylistKioskMediaReplaceItem } from './types';
import type { PagedSearchResponse, RestCreateResponse, RestDeleteResponse, SearchParams, RestUpdateResponse } from '@/types';


function baseForPlaylist(playlistId: string): string {
	return `vending-machine/playlists/${playlistId}/kiosk-media-items`;
}

export type PlaylistKioskMediaSearchParams = SearchParams<PlaylistKioskMedia>;

export const playlistKioskMediaService = {
	async searchPlaylistKioskMedias(
		playlistId: string,
		params?: PlaylistKioskMediaSearchParams,
	): Promise<PagedSearchResponse<PlaylistKioskMedia>> {
		const result = await request.get<any>(baseForPlaylist(playlistId), {
			searchParams: buildSearchParams<PlaylistKioskMedia>(params),
		});
		return snakeToCamelObject(result) as PagedSearchResponse<PlaylistKioskMedia>;
	},

	async createPlaylistKioskMedia(
		playlistId: string,
		body: Record<string, unknown>,
	): Promise<RestCreateResponse> {
		const result = await request.post<any>(baseForPlaylist(playlistId), {
			json: camelToSnakeObject(body),
		});
		return snakeToCamelObject(result) as RestCreateResponse;
	},

	async updatePlaylistKioskMedia(
		playlistId: string,
		linkId: string,
		body: Record<string, unknown>,
	): Promise<RestUpdateResponse> {
		const result = await request.put<any>(`${baseForPlaylist(playlistId)}/${linkId}`, {
			json: camelToSnakeObject(body),
		});
		return snakeToCamelObject(result) as RestUpdateResponse;
	},

	async deletePlaylistKioskMedia(playlistId: string, linkId: string): Promise<RestDeleteResponse> {
		const result = await request.del<any>(`${baseForPlaylist(playlistId)}/${linkId}`);
		return snakeToCamelObject(result) as RestDeleteResponse;
	},

	/** PUT `/playlists/:id/kiosk-medias` — replaces entire ordered list. */
	async replacePlaylistKioskMedias(playlistId: string, items: PlaylistKioskMediaReplaceItem[]):
	Promise<RestUpdateResponse> {
		const snakeItems = items.map((item) => camelToSnakeObject(item) as Record<string, unknown>);
		const result = await request.put<any>(`vending-machine/playlists/${playlistId}/kiosk-medias`, {
			json: snakeItems,
		});
		return snakeToCamelObject(result) as RestUpdateResponse;
	},
};
