export interface Ad {
	id: string;
	code: string;
	name: string;
	description?: string;
	status: 'active' | 'inactive' | 'expired';
	startDate: string;
	endDate: string;
	media: AdMedia[]; // List of media items for this ad
	createdAt: string;
	etag: string;
}

export interface AdMedia {
	id: string;
	code: string;
	name: string;
	duration?: number; // Duration in seconds (for videos and images - display duration)
	type: 'image' | 'video';
	url: string;
	thumbnailUrl?: string; // Optional thumbnail for videos
	order: number; // Order in the playlist
}

export interface GalleryFolder {
	id: string;
	name: string;
	parentId?: string; // For nested folders
	children?: GalleryFolder[]; // Nested folders
	mediaCount?: number; // Number of media items in this folder
}

export interface GalleryMedia {
	id: string;
	code: string;
	name: string;
	type: 'image' | 'video';
	url: string;
	thumbnailUrl?: string;
	duration?: number; // Duration in seconds (for videos and images - display duration)
	folderId?: string; // Which folder this media belongs to
	size?: number; // File size in bytes
	createdAt: string;
}
