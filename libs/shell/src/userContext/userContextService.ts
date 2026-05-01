import * as request from '@nikkierp/common/request';
import * as uiState from '@nikkierp/ui/appState';

import { GetUserContextResponse, SLICE_NAME } from './types';


export const getUserContext = uiState.createThunkPack<GetUserContextResponse, void, 'getUserContext'>(
	SLICE_NAME, 'getUserContext',
	async function getUserContextThunk() {
		const data = await request.get<GetUserContextResponse>('identity/me/context');
		return data;
	},
);
