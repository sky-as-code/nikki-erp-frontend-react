import type { Kiosk } from './types';
import type { InterfaceMode } from '@/features/kioskModels/types';

/** Giá trị form tab Cài đặt kiosk (đồng bộ với `kioskSetting-schema.json`). */
export interface KioskSettingFormData {
	interfaceMode?: InterfaceMode;
	waitingPlaylistId?: string;
	shoppingPlaylistId?: string;
	themeId?: string;
	gameId?: string;
}

/** Map từ `Kiosk` → defaultValues / reset cho FormFieldProvider. */
export function kioskToSettingFormValues(kiosk: Kiosk): KioskSettingFormData {
	return {
		interfaceMode: kiosk.interfaceMode,
		waitingPlaylistId: kiosk.waitingPlaylist?.id,
		shoppingPlaylistId: kiosk.shoppingPlaylist?.id,
		themeId: kiosk.theme?.id,
		gameId: kiosk.game?.id,
	};
}

/** Chọn entity hiển thị: ưu tiên bản draft khi user vừa chọn, sau đó dữ liệu từ kiosk. */
export function pickEntityById<T extends { id: string }>(
	id: string | undefined,
	fromKiosk: T | undefined,
	draft: T | undefined,
): T | undefined {
	if (!id) return undefined;
	if (draft?.id === id) return draft;
	if (fromKiosk?.id === id) return fromKiosk;
	return undefined;
}
