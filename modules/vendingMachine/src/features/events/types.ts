import { Kiosk } from '../kiosks/types';
import { Theme } from '../themes/types';

export interface EventProduct {
	id: string;
	productId: string;
	code: string;
	name: string;
	image: string;
	badgeImage?: string; // Badge image overlay
	originalPrice: number;
	eventPrice: number; // Price during event
}

export interface SlideshowPlaylist {
	id: string;
	type: 'idle' | 'shopping'; // idle = màn hình chờ, shopping = màn hình mua hàng
	media: Array<{
		id: string;
		mediaId: string;
		url: string;
		thumbnailUrl?: string;
		type: 'image' | 'video';
		duration?: number;
		order: number;
	}>;
}

export interface Event {
	id: string;
	code: string;
	name: string;
	description?: string;
	status: 'active' | 'inactive' | 'completed';
	startDate: string;
	endDate: string;
	kiosks?: Kiosk[]; // Danh sách kiosk đang chạy sự kiện này
	products?: EventProduct[]; // Danh sách sản phẩm giảm giá
	themeId?: string; // Theme được sử dụng
	theme?: Theme; // Theme object
	slideshowPlaylists?: SlideshowPlaylist[]; // Playlist trình chiếu (màn hình chờ và màn hình mua hàng)
	createdAt: string;
	etag: string;
}

