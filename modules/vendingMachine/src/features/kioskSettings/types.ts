import { ViewMode } from '@/components/ControlPanel/ControlPanel';

import { Game } from '../games/types';
import { Kiosk } from '../kiosks/types';
import { Slideshow } from '../mediaPlaylist/types';
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
	themeId?: string;
	theme?: Theme;
	gameId?: string;
	game?: Game;
	idlePlaylist?: Slideshow;
	shoppingPlaylist?: Slideshow;
	createdAt: string;
	etag: string;
}


export type KioskSettingListViewMode = Extract<ViewMode, 'list' | 'grid'>;
