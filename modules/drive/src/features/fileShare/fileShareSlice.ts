import { ReduxActionState, baseReduxActionState } from '@nikkierp/ui/appState';
import {
	ActionReducerMapBuilder,
	createAsyncThunk,
	createSlice,
} from '@reduxjs/toolkit';

import { fileShareService } from './fileShareService';

import type {
	DriveFileShare,
	GetDriveFileShareResponse,
	SearchDriveFileShareRequest,
	SearchDriveFileShareResponse,
	UpdateDriveFileShareRequest,
	UpdateDriveFileShareResponse,
} from './type';


const SLICE_NAME = 'drive.fileShare';

export type DriveFileShareState = {
	/** Danh sách share theo file hiện tại */
	shares: DriveFileShare[];
	/** Share đang chọn */
	selectedShare?: DriveFileShare;
	search: ReduxActionState<SearchDriveFileShareResponse>;
	update: ReduxActionState<UpdateDriveFileShareResponse>;
	getById: ReduxActionState<GetDriveFileShareResponse>;
};

interface thunkConfig {
	rejectValue: string;
}

export const initialState: DriveFileShareState = {
	shares: [],
	selectedShare: undefined,
	search: baseReduxActionState,
	update: baseReduxActionState,
	getById: baseReduxActionState,
};

export const searchFileShares = createAsyncThunk<
	SearchDriveFileShareResponse,
	{ fileId: string; req?: SearchDriveFileShareRequest },
	thunkConfig
>(
	`${SLICE_NAME}/searchFileShares`,
	async ({ fileId, req }, { rejectWithValue }) => {
		try {
			return await fileShareService.searchFileShares(fileId, req);
		}
		catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to search file shares';
			return rejectWithValue(errorMessage);
		}
	},
);

export const getFileShare = createAsyncThunk<
	GetDriveFileShareResponse,
	{ fileId: string; shareId: string },
	thunkConfig
>(
	`${SLICE_NAME}/getFileShare`,
	async ({ fileId, shareId }, { rejectWithValue }) => {
		try {
			return await fileShareService.getFileShare(fileId, shareId);
		}
		catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to get file share';
			return rejectWithValue(errorMessage);
		}
	},
);

export const updateFileShare = createAsyncThunk<
	UpdateDriveFileShareResponse,
	{ fileId: string; shareId: string; req: UpdateDriveFileShareRequest },
	thunkConfig
>(
	`${SLICE_NAME}/updateFileShare`,
	async ({ fileId, shareId, req }, { rejectWithValue }) => {
		try {
			return await fileShareService.updateFileShare(fileId, shareId, req);
		}
		catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to update file share';
			return rejectWithValue(errorMessage);
		}
	},
);

export const driveFileShareSlice = createSlice({
	name: SLICE_NAME,
	initialState,
	reducers: {
		resetSelectedShare: (state) => {
			state.selectedShare = undefined;
		},
		resetShareSearch: (state) => {
			state.search = baseReduxActionState;
		},
		resetUpdate: (state) => {
			state.update = baseReduxActionState;
		},
		resetGetById: (state) => {
			state.getById = baseReduxActionState;
		},
	},
	extraReducers: (builder) => {
		searchFileSharesReducers(builder);
		getFileShareReducers(builder);
		updateFileShareReducers(builder);
	},
});

function searchFileSharesReducers(
	builder: ActionReducerMapBuilder<DriveFileShareState>,
) {
	builder
		.addCase(searchFileShares.pending, (state) => {
			state.search.status = 'pending';
			state.search.error = null;
		})
		.addCase(searchFileShares.fulfilled, (state, action) => {
			state.search.status = 'success';
			state.search.data = action.payload;
			state.shares = action.payload.items ?? [];
		})
		.addCase(searchFileShares.rejected, (state, action) => {
			state.search.status = 'error';
			state.search.error = action.payload || 'Failed to search file shares';
		});
}

function getFileShareReducers(
	builder: ActionReducerMapBuilder<DriveFileShareState>,
) {
	builder
		.addCase(getFileShare.pending, (state) => {
			state.getById.status = 'pending';
			state.getById.error = null;
		})
		.addCase(getFileShare.fulfilled, (state, action) => {
			state.getById.status = 'success';
			state.getById.data = action.payload;
			state.selectedShare = action.payload;
		})
		.addCase(getFileShare.rejected, (state, action) => {
			state.getById.status = 'error';
			state.getById.error = action.payload || 'Failed to get file share';
		});
}

function updateFileShareReducers(
	builder: ActionReducerMapBuilder<DriveFileShareState>,
) {
	builder
		.addCase(updateFileShare.pending, (state) => {
			state.update.status = 'pending';
			state.update.error = null;
		})
		.addCase(updateFileShare.fulfilled, (state, action) => {
			state.update.status = 'success';
			state.update.data = action.payload;
			const { shareId, req } = action.meta.arg;
			const nextEtag = action.payload?.etag;
			state.shares = state.shares.map((share) =>
				share.id === shareId
					? {
						...share,
						permission: req.permission,
						etag: nextEtag ?? share.etag,
					}
					: share,
			);
			if (state.selectedShare?.id === shareId) {
				state.selectedShare = {
					...state.selectedShare,
					permission: req.permission,
					etag: nextEtag ?? state.selectedShare.etag,
				};
			}
		})
		.addCase(updateFileShare.rejected, (state, action) => {
			state.update.status = 'error';
			state.update.error = action.payload || 'Failed to update file share';
		});
}

export const { reducer } = driveFileShareSlice;
export const {
	resetSelectedShare,
	resetShareSearch,
	resetUpdate,
	resetGetById,
} = driveFileShareSlice.actions;

