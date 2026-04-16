export enum MediaPlayListStatus {
	ACTIVE = 'active',
	INACTIVE = 'inactive',
	DELETED = 'deleted',
}

export enum MediaStatus {
	ACTIVE = 'active',
	INACTIVE = 'inactive',
	DELETED = 'deleted',
}

export enum MediaType {
	IMAGE = 'image',
	VIDEO = 'video',
}
export interface MediaPlaylist {
	id: string;
	title: string;
	description?: string;
	status: MediaPlayListStatus;
	mediaItems: MediaPlaylistItem[];
	createdAt: string;
}

export interface MediaPlaylistItem {
	id: string;
	mediaId: string;
	media: Media;
	playOrder: number;
	duration: number;
}

export interface Media {
	id: string;
	name: string;
	status: MediaStatus;
	type: MediaType;
	url: string;
	thumbnailUrl?: string;
}




// TODO: Remove this after migration
export interface Slideshow {
	id: string;
	code: string;
	name: string;
	description?: string;
	status: 'active' | 'inactive' | 'expired';
	startDate: string;
	endDate: string;
	media: SlideshowMedia[];
	createdAt: string;
	etag: string;
}

export interface SlideshowMedia {
	id: string;
	code: string;
	name: string;
	duration?: number;
	type: 'image' | 'video';
	url: string;
	thumbnailUrl?: string;
	order: number;
}

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
