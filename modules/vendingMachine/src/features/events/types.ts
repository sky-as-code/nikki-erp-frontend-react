import { Slideshow } from '../mediaPlaylist/types';
import { Game } from '../games/types';
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
	gameId?: string; // Game được sử dụng
	game?: Game; // Game object
	idlePlaylist?: Slideshow; // Playlist trình chiếu (màn hình chờ)
	shoppingPlaylist?: Slideshow; // Playlist trình chiếu (màn hình mua hàng)
	createdAt: string;
	etag: string;
}

