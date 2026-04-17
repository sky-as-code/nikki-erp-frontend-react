import { useUIState } from '@nikkierp/shell/contexts';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import type { Playlist } from '../types';

import {
	mediaPlaylistActions,
	selectUpdateMediaPlaylist,
	VendingMachineDispatch,
} from '@/appState';




export type PlaylistUpdateFormData = { id: string; etag: string } & Pick<
	Partial<Playlist>,
	'name' | 'scopeType' | 'scopeRef'
>;

function useSubmitHandler(
	dispatch: VendingMachineDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	onUpdateSuccess?: () => void,
) {
	const updateState = useMicroAppSelector(selectUpdateMediaPlaylist);
	const updateRequestIdRef = React.useRef<string | null>(null);

	React.useEffect(() => {
		const requestId = updateState.requestId;
		const matchesDispatch = requestId != null && requestId === updateRequestIdRef.current;
		if (!matchesDispatch) return;

		if (updateState.status === 'success') {
			updateRequestIdRef.current = null;
			dispatch(mediaPlaylistActions.resetUpdateMediaPlaylist());
			onUpdateSuccess?.();
			notification.showInfo(
				translate('nikki.vendingMachine.mediaPlaylist.messages.update_success'),
				translate('nikki.general.messages.success'),
			);
		}
		else if (updateState.status === 'error') {
			updateRequestIdRef.current = null;
			dispatch(mediaPlaylistActions.resetUpdateMediaPlaylist());
			notification.showError(
				updateState.error ?? translate('nikki.general.errors.update_failed'),
				translate('nikki.general.messages.error'),
			);
		}
	}, [updateState, dispatch, notification, translate, onUpdateSuccess]);

	const handleSubmit = useCallback((payload: {
		id: string;
		etag: string;
		updates: Partial<Pick<Playlist, 'name' | 'scopeType' | 'scopeRef'>>;
	}) => {
		const action = dispatch(mediaPlaylistActions.updateMediaPlaylist(payload));
		updateRequestIdRef.current = action.requestId;
	}, [dispatch]);

	return {
		isSubmitting: updateState.status === 'pending',
		handleSubmit,
	};
}

export function usePlaylistEdit({ onUpdateSuccess }: { onUpdateSuccess?: () => void }) {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();

	const { isSubmitting, handleSubmit } = useSubmitHandler(
		dispatch,
		notification,
		translate,
		onUpdateSuccess,
	);

	const submit = useCallback(
		(modelData: PlaylistUpdateFormData) => {
			if (!modelData.id || !modelData.etag) return;
			const { id, etag, name, scopeType, scopeRef } = modelData;
			handleSubmit({
				id,
				etag,
				updates: { name, scopeType, scopeRef },
			});
		},
		[handleSubmit],
	);

	return { isSubmitting, handleSubmit: submit };
}
