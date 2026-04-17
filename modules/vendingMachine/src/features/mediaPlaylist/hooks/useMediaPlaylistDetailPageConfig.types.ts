import { BreadcrumbItem } from '@/components/BreadCrumbs';
import { ControlPanelProps } from '@/components/ControlPanel/ControlPanel';

import type { Playlist } from '../types';



export type UseMediaPlaylistDetailPageConfigReturn = {
	breadcrumbs: BreadcrumbItem[];
	actions: ControlPanelProps['actions'];
	formResetNonce: number;
	isSubmitting: boolean;
	onSaveClick: () => void;
	closeDeleteModal: () => void;
	confirmDelete: () => void;
	isOpenDeleteModal: boolean;
	isOpenArchiveModal: boolean;
	pendingArchive: { playlist: Playlist; targetArchived: boolean } | null;
	handleConfirmArchive: () => void;
	handleCloseArchiveModal: () => void;
	playlistForDelete: Playlist | null;
};
