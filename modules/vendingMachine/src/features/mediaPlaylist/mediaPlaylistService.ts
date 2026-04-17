import { getKioskMediaStreamUrl, kioskMediaService } from './kioskMediaService';
import { playlistKioskMediaService } from './playlistKioskMediaService';
import { playlistService } from './playlistService';
import {
	normalizePlaylistObjectFit,
	ObjectFit,
	ResourceScopeType,
	type Playlist,
	type PlaylistKioskMediaReplaceItem,
	type PlaylistMediaRow,
} from './types';

import type { PagedSearchResponse, RestArchiveResponse, SearchParams } from '@/types';


function inferMediaType(mediaType: string): 'image' | 'video' {
	const t = (mediaType || '').toLowerCase();
	return t.includes('video') ? 'video' : 'image';
}

/** Chuẩn bị body PUT `/playlists/:id/kiosk-medias` từ state UI. */
export function playlistMediaRowsToReplaceItems(rows: PlaylistMediaRow[]): PlaylistKioskMediaReplaceItem[] {
	const sorted = [...rows].sort((a, b) => a.order - b.order);
	return sorted.map((row) => ({
		kioskMediaRef: row.kioskMediaRef,
		durationSec: Math.max(0, row.durationSec ?? 0),
		playOrder: row.order,
		objectFit: normalizePlaylistObjectFit(row.objectFit),
	}));
}

const PLAYLIST_SEARCH_COLUMNS: Array<keyof Playlist> = [
	'id',
	'name',
	'etag',
	'scopeType',
	'scopeRef',
	'isArchived',
	'createdAt',
	'updatedAt',
];

export const mediaPlaylistService = {
	async searchMediaPlaylists(params?: SearchParams<Playlist>): Promise<PagedSearchResponse<Playlist>> {
		return playlistService.searchPlaylists({
			columns: PLAYLIST_SEARCH_COLUMNS,
			...(params || {}),
		});
	},

	async getMediaPlaylist(id: string): Promise<Playlist | undefined> {
		return playlistService.getPlaylist(id);
	},

	async loadPlaylistMediaRows(playlistId: string): Promise<PlaylistMediaRow[]> {
		const links = await playlistKioskMediaService.searchPlaylistKioskMedias(playlistId, { size: 500 });
		const rows: PlaylistMediaRow[] = [];
		for (const link of links.items) {
			const km = await kioskMediaService.getKioskMediaById(link.kioskMediaRef);
			const order = link.playOrder ?? 0;
			rows.push({
				id: link.id,
				kioskMediaRef: link.kioskMediaRef,
				name: km.name,
				type: inferMediaType(km.mediaType),
				url: getKioskMediaStreamUrl(link.kioskMediaRef),
				order,
				durationSec: link.durationSec ?? undefined,
				objectFit:
					link.objectFit != null ? normalizePlaylistObjectFit(link.objectFit as ObjectFit) : undefined,
			});
		}
		rows.sort((a, b) => a.order - b.order);
		return rows;
	},

	getKioskMediaStreamUrl,

	async createMediaPlaylist(payload: {
		name: string;
		scopeType?: ResourceScopeType;
		scopeRef?: string | null;
	}): Promise<Playlist> {
		const created = await playlistService.createPlaylist({
			name: payload.name,
			scopeType: payload.scopeType ?? ResourceScopeType.DOMAIN,
			scopeRef: payload.scopeRef,
		});
		return playlistService.getPlaylist(created.id);
	},

	async updateMediaPlaylist(
		id: string,
		etag: string,
		updates: Partial<Pick<Playlist, 'name' | 'scopeType' | 'scopeRef'>>,
	): Promise<Playlist> {
		await playlistService.updatePlaylist(id, { etag, ...updates });
		return playlistService.getPlaylist(id);
	},

	async deleteMediaPlaylist(id: string): Promise<void> {
		await playlistService.deletePlaylist(id);
	},

	async setPlaylistArchived(id: string, body: { etag: string; isArchived: boolean }): Promise<RestArchiveResponse> {
		return playlistService.setPlaylistArchived(id, body);
	},

	async replacePlaylistMedia(playlistId: string, items: PlaylistKioskMediaReplaceItem[]) {
		return playlistKioskMediaService.replacePlaylistKioskMedias(playlistId, items);
	},
};
