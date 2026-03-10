import { Ad } from '../ads/types';
import { EventProduct } from '../events/types';
import { Game } from '../games/types';
import { Kiosk } from '../kiosks/types';
import { Theme } from '../themes/types';

/** Kiosk Setting - nhóm các thông số hoạt động của kiosk (kiosk, trình chiếu, chủ đề, trò chơi, brand...) */
export interface KioskSetting {
	id: string;
	code: string;
	name: string;
	description?: string;
	status: 'active' | 'inactive';
	brand?: string;
	kiosks?: Kiosk[];
	products?: EventProduct[];
	themeId?: string;
	theme?: Theme;
	gameId?: string;
	game?: Game;
	idlePlaylist?: Ad;
	shoppingPlaylist?: Ad;
	createdAt: string;
	etag: string;
}
