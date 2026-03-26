import { ReduxActionState, baseReduxActionState } from '@nikkierp/ui/appState';
import {
	ActionReducerMapBuilder,
	createAsyncThunk,
	createSlice,
} from '@reduxjs/toolkit';

import { fileShareService } from './fileShareService';

import type {
	ResolvedDriveFileShareRequest,
	ResolvedDriveFileShareResponse,
	CreateDriveFileShareBulkRequest,
	CreateDriveFileShareBulkResponse,
	CreateDriveFileShareRequest,
	CreateDriveFileShareResponse,
	DeleteDriveFileShareResponse,
	DriveFileShare,
	GetDriveFileShareAncestorsResponse,
	GetDriveFileShareResponse,
	GetDriveFileSharesByUserResponse,
	SearchDriveFileShareRequest,
	SearchDriveFileShareResponse,
	UpdateDriveFileShareRequest,
	UpdateDriveFileShareResponse,
} from './type';


const SLICE_NAME = 'drive.fileShare';

export type DriveFileShareState = {
	shares: DriveFileShare[];
	selectedShare?: DriveFileShare;
	search: ReduxActionState<SearchDriveFileShareResponse>;
	update: ReduxActionState<UpdateDriveFileShareResponse>;
	getById: ReduxActionState<GetDriveFileShareResponse>;
	create: ReduxActionState<CreateDriveFileShareResponse>;
	createBulk: ReduxActionState<CreateDriveFileShareBulkResponse>;
	deleteShare: ReduxActionState<DeleteDriveFileShareResponse>;
	ancestors: ReduxActionState<GetDriveFileShareAncestorsResponse>;
	resolved: ReduxActionState<ResolvedDriveFileShareResponse>;
	sharesByUser: ReduxActionState<GetDriveFileSharesByUserResponse>;
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
	create: baseReduxActionState,
	createBulk: baseReduxActionState,
	deleteShare: baseReduxActionState,
	ancestors: baseReduxActionState,
	resolved: baseReduxActionState,
	sharesByUser: baseReduxActionState,
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

export const createFileShare = createAsyncThunk<
	CreateDriveFileShareResponse,
	{ fileId: string; req: CreateDriveFileShareRequest },
	thunkConfig
>(
	`${SLICE_NAME}/createFileShare`,
	async ({ fileId, req }, { rejectWithValue }) => {
		try {
			return await fileShareService.createFileShare(fileId, req);
		}
		catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to create file share';
			return rejectWithValue(errorMessage);
		}
	},
);

export const createFileShareBulk = createAsyncThunk<
	CreateDriveFileShareBulkResponse,
	{ fileId: string; req: CreateDriveFileShareBulkRequest },
	thunkConfig
>(
	`${SLICE_NAME}/createFileShareBulk`,
	async ({ fileId, req }, { rejectWithValue }) => {
		try {
			return await fileShareService.createFileShareBulk(fileId, req);
		}
		catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to create file shares';
			return rejectWithValue(errorMessage);
		}
	},
);

export const deleteFileShare = createAsyncThunk<
	DeleteDriveFileShareResponse,
	{ fileId: string; shareId: string },
	thunkConfig
>(
	`${SLICE_NAME}/deleteFileShare`,
	async ({ fileId, shareId }, { rejectWithValue }) => {
		try {
			return await fileShareService.deleteFileShare(fileId, shareId);
		}
		catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to delete file share';
			return rejectWithValue(errorMessage);
		}
	},
);

export const getFileShareAncestors = createAsyncThunk<
	GetDriveFileShareAncestorsResponse,
	{ fileId: string },
	thunkConfig
>(
	`${SLICE_NAME}/getFileShareAncestors`,
	async ({ fileId }, { rejectWithValue }) => {
		try {
			return await fileShareService.getFileShareAncestors(fileId);
		}
		catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to get file share ancestors';
			return rejectWithValue(errorMessage);
		}
	},
);

export const getResolvedFileShares = createAsyncThunk<
	ResolvedDriveFileShareResponse,
	{ fileId: string; params?: ResolvedDriveFileShareRequest },
	thunkConfig
>(
	`${SLICE_NAME}/getResolvedFileShares`,
	async ({ fileId, params }, { rejectWithValue }) => {
		try {
			return await fileShareService.getResolvedFileShares(fileId, params);
		}
		catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to get resolved file shares';
			return rejectWithValue(errorMessage);
		}
	},
);

export const getFileSharesByUser = createAsyncThunk<
	GetDriveFileSharesByUserResponse,
	{ fileId: string; userId: string },
	thunkConfig
>(
	`${SLICE_NAME}/getFileSharesByUser`,
	async ({ fileId, userId }, { rejectWithValue }) => {
		try {
			return await fileShareService.getFileSharesByUser(fileId, userId);
		}
		catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to get file shares by user';
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
		resetCreate: (state) => {
			state.create = baseReduxActionState;
		},
		resetCreateBulk: (state) => {
			state.createBulk = baseReduxActionState;
		},
		resetDeleteShare: (state) => {
			state.deleteShare = baseReduxActionState;
		},
		resetAncestors: (state) => {
			state.ancestors = baseReduxActionState;
		},
		resetResolved: (state) => {
			state.resolved = baseReduxActionState;
		},
		resetSharesByUser: (state) => {
			state.sharesByUser = baseReduxActionState;
		},
	},
	extraReducers: (builder) => {
		searchFileSharesReducers(builder);
		getFileShareReducers(builder);
		updateFileShareReducers(builder);
		createFileShareReducers(builder);
		createFileShareBulkReducers(builder);
		deleteFileShareReducers(builder);
		getFileShareAncestorsReducers(builder);
		getResolvedFileSharesReducers(builder);
		getFileSharesByUserReducers(builder);
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

function createFileShareReducers(
	builder: ActionReducerMapBuilder<DriveFileShareState>,
) {
	builder
		.addCase(createFileShare.pending, (state) => {
			state.create.status = 'pending';
			state.create.error = null;
		})
		.addCase(createFileShare.fulfilled, (state, action) => {
			state.create.status = 'success';
			state.create.data = action.payload;
		})
		.addCase(createFileShare.rejected, (state, action) => {
			state.create.status = 'error';
			state.create.error = action.payload || 'Failed to create file share';
		});
}

function createFileShareBulkReducers(
	builder: ActionReducerMapBuilder<DriveFileShareState>,
) {
	builder
		.addCase(createFileShareBulk.pending, (state) => {
			state.createBulk.status = 'pending';
			state.createBulk.error = null;
		})
		.addCase(createFileShareBulk.fulfilled, (state, action) => {
			state.createBulk.status = 'success';
			state.createBulk.data = action.payload;
		})
		.addCase(createFileShareBulk.rejected, (state, action) => {
			state.createBulk.status = 'error';
			state.createBulk.error = action.payload || 'Failed to create file shares';
		});
}

function deleteFileShareReducers(
	builder: ActionReducerMapBuilder<DriveFileShareState>,
) {
	builder
		.addCase(deleteFileShare.pending, (state) => {
			state.deleteShare.status = 'pending';
			state.deleteShare.error = null;
		})
		.addCase(deleteFileShare.fulfilled, (state, action) => {
			state.deleteShare.status = 'success';
			state.deleteShare.data = action.payload;
			const { shareId } = action.meta.arg;
			state.shares = state.shares.filter((share) => share.id !== shareId);
			if (state.selectedShare?.id === shareId) {
				state.selectedShare = undefined;
			}
		})
		.addCase(deleteFileShare.rejected, (state, action) => {
			state.deleteShare.status = 'error';
			state.deleteShare.error = action.payload || 'Failed to delete file share';
		});
}

function getFileShareAncestorsReducers(
	builder: ActionReducerMapBuilder<DriveFileShareState>,
) {
	builder
		.addCase(getFileShareAncestors.pending, (state) => {
			state.ancestors.status = 'pending';
			state.ancestors.error = null;
		})
		.addCase(getFileShareAncestors.fulfilled, (state, action) => {
			state.ancestors.status = 'success';
			state.ancestors.data = action.payload;
		})
		.addCase(getFileShareAncestors.rejected, (state, action) => {
			state.ancestors.status = 'error';
			state.ancestors.error = action.payload || 'Failed to get file share ancestors';
		});
}

function getResolvedFileSharesReducers(
	builder: ActionReducerMapBuilder<DriveFileShareState>,
) {
	builder
		.addCase(getResolvedFileShares.pending, (state) => {
			state.resolved.status = 'pending';
			state.resolved.error = null;
		})
		.addCase(getResolvedFileShares.fulfilled, (state, action) => {
			state.resolved.status = 'success';
			state.resolved.data = action.payload;
		})
		.addCase(getResolvedFileShares.rejected, (state, action) => {
			state.resolved.status = 'error';
			state.resolved.error = action.payload || 'Failed to get resolved file shares';
		});
}

function getFileSharesByUserReducers(
	builder: ActionReducerMapBuilder<DriveFileShareState>,
) {
	builder
		.addCase(getFileSharesByUser.pending, (state) => {
			state.sharesByUser.status = 'pending';
			state.sharesByUser.error = null;
		})
		.addCase(getFileSharesByUser.fulfilled, (state, action) => {
			state.sharesByUser.status = 'success';
			state.sharesByUser.data = action.payload;
		})
		.addCase(getFileSharesByUser.rejected, (state, action) => {
			state.sharesByUser.status = 'error';
			state.sharesByUser.error = action.payload || 'Failed to get file shares by user';
		});
}

export const { reducer } = driveFileShareSlice;
export const {
	resetSelectedShare,
	resetShareSearch,
	resetUpdate,
	resetGetById,
	resetCreate,
	resetCreateBulk,
	resetDeleteShare,
	resetAncestors,
	resetResolved,
	resetSharesByUser,
} = driveFileShareSlice.actions;
