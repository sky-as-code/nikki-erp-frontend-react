/**
 * Aligns with CoreMart `vending_machine` domain: playlist, kiosk_media, playlist_kiosk_media.
 * REST base path prefix: `vending-machine/` (via @nikkierp/common/request).
 */

/** API: domain.ResourceScopeType */
export enum ResourceScopeType {
	DOMAIN = 'domain',
	ORG = 'org',
	HIERARCHY = 'hierarchy',
	PRIVATE = 'private',
}

/** API: vending_machine.playlist (vdmc_playlists) */
export interface Playlist {
	id: string;
	name: string;
	etag: string;
	scopeType: ResourceScopeType;
	scopeRef?: string | null;
	isArchived?: boolean | null;
	/** Optional UI count when list API enriches rows (e.g. linked kiosk media). */
	mediaItems?: number | null;
	createdAt: string;
	updatedAt?: string | null;
	createdBy?: string | null;
	updatedBy?: string | null;
}

/** API: vending_machine.kiosk_media (vdmc_kiosk_media) */
export interface KioskMedia {
	id: string;
	name: string;
	storageKey: string;
	mediaType: string;
	etag: string;
	scopeType: ResourceScopeType;
	scopeRef?: string | null;
	isArchived?: boolean | null;
	createdAt: string;
	updatedAt?: string | null;
	createdBy?: string | null;
	updatedBy?: string | null;
}

export enum ObjectFit {
	FILL = 'fill',
	CONTAIN = 'contain',
	COVER = 'cover',
	NONE = 'none',
	SCALE_DOWN = 'scale-down',
}

/** Mặc định khi API/UI không gửi — khớp CSS `object-fit: contain`. */
export function normalizePlaylistObjectFit(value?: ObjectFit | null): ObjectFit {
	if (value != null && (Object.values(ObjectFit) as string[]).includes(value)) {
		return value;
	}
	return ObjectFit.CONTAIN;
}

/** API: vending_machine.playlist_kiosk_media */
export interface PlaylistKioskMedia {
	id: string;
	playlistRef: string;
	kioskMediaRef: string;
	playOrder?: number | null;
	durationSec?: number | null;
	objectFit?: ObjectFit | null;
	etag?: string;
	createdAt?: string | null;
	updatedAt?: string | null;
}

/** Body item for PUT `/playlists/:id/kiosk-medias` (replace all links). */
export interface PlaylistKioskMediaReplaceItem {
	kioskMediaRef: string;
	durationSec: number;
	playOrder: number;
	objectFit?: ObjectFit | null;
}

/** @deprecated Use Playlist — kept for legacy imports (kiosk/event forms). */
export type Slideshow = Playlist;

/**
 * UI row for playlist detail media table (mapped from PlaylistKioskMedia + KioskMedia).
 * Replaces former SlideshowMedia for playlist screens.
 */
export interface PlaylistMediaRow {
	id: string;
	kioskMediaRef: string;
	name: string;
	type: 'image' | 'video';
	url: string;
	thumbnailUrl?: string;
	order: number;
	durationSec?: number;
	/** Hiển thị media trong khung preview/kiosk; mặc định `contain`. */
	objectFit?: ObjectFit | null;
}

/** @deprecated Use PlaylistMediaRow */
export type SlideshowMedia = PlaylistMediaRow;

export interface GalleryFolder {
	id: string;
	name: string;
	parentId?: string;
	children?: GalleryFolder[];
	mediaCount?: number;
}

export interface GalleryMedia {
	id: string;
	code: string;
	name: string;
	type: 'image' | 'video';
	url: string;
	thumbnailUrl?: string;
	duration?: number;
	folderId?: string;
	size?: number;
	createdAt: string;
}
