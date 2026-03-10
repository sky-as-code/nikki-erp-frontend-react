import { ReduxActionState, baseReduxActionState } from '@nikkierp/ui/appState';
import {
	ActionReducerMapBuilder,
	createAsyncThunk,
	createSlice,
	PayloadAction,
} from '@reduxjs/toolkit';

import { fileService, type CreateDriveFileFormPayload } from './fileService';
import {
	CreateDriveFileResponse,
	DriveFile,
	GetDriveFileByParentRequest,
	GetDriveFileByParentResponse,
	GetDriveFileResponse,
	SearchDriveFileByParentResponse,
	UpdateDriveFileMetadataRequest,
	UpdateDriveFileMetadataResponse,
} from './types';


export const SLICE_NAME = 'drive.file';

/** Trạng thái expand của từng node trong FileTree (value -> expanded). Dùng để khôi phục khi remount. */
export type TreeExpandedState = Record<string, boolean>;

export type DriveFileUIState = {
	openPropertiesCard: boolean;
	openCreateFileModal: boolean;
};

export type DriveFileState = {
	/** Danh sách file của folder hiện tại (main content) */
	files: DriveFile[];
	/** Thông tin folder hiện tại (dùng cho tiêu đề, breadcrumb, v.v.) */
	currentFolder?: DriveFile;
	/** Danh sách file root cho sidebar FileTree */
	treeRootItems: DriveFile[];
	/** Thông tin pagination cho từng parent trong FileTree */
	treePaging: Record<string, {
		page: number;
		size: number;
		total: number;
		loaded: number;
	}>;
	/** Trạng thái expand của FileTree, persist để sống qua remount khi navigate */
	treeExpandedState: TreeExpandedState;
	fileDetail?: DriveFile;
	ui: DriveFileUIState;

	create: ReduxActionState<CreateDriveFileResponse>;
	updateMetadata: ReduxActionState<UpdateDriveFileMetadataResponse>;
	delete: ReduxActionState<void>;
	moveToTrash: ReduxActionState<void>;
	getById: ReduxActionState<GetDriveFileResponse>;
	getByParent: ReduxActionState<GetDriveFileByParentResponse>;
	getByParentForTree: ReduxActionState<GetDriveFileByParentResponse>;
	search: ReduxActionState<SearchDriveFileByParentResponse>;
};

export const initialState: DriveFileState = {
	files: [],
	currentFolder: undefined,
	treeRootItems: [],
	treePaging: {},
	treeExpandedState: {},
	fileDetail: undefined,

	ui: {
		openPropertiesCard: false,
		openCreateFileModal: false,
	},

	create: baseReduxActionState,
	updateMetadata: baseReduxActionState,
	delete: baseReduxActionState,
	moveToTrash: baseReduxActionState,
	getById: baseReduxActionState,
	getByParent: baseReduxActionState,
	getByParentForTree: baseReduxActionState,
	search: baseReduxActionState,
};

interface thunkConfig {
	rejectValue: string;
}

export const createDriveFile = createAsyncThunk<
	CreateDriveFileResponse,
	CreateDriveFileFormPayload,
	thunkConfig
>(
	`${SLICE_NAME}/createDriveFile`,
	async (payload: CreateDriveFileFormPayload, { rejectWithValue }) => {
		try {
			const result = await fileService.createFile(payload);
			return result;
		}
		catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to create file';
			return rejectWithValue(errorMessage);
		}
	},
);

export const updateMetadataDriveFile = createAsyncThunk<
	UpdateDriveFileMetadataResponse,
	{ fileId: string; req: UpdateDriveFileMetadataRequest },
	thunkConfig
>(
	`${SLICE_NAME}/updateDriveFile`,
	async ({ fileId, req }, { rejectWithValue }) => {
		try {
			const result = await fileService.updateFileMetadata(fileId, req);
			return result;
		}
		catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to update file';
			return rejectWithValue(errorMessage);
		}
	},
);

export const deleteDriveFile = createAsyncThunk<void, string, thunkConfig>(
	`${SLICE_NAME}/deleteDriveFile`,
	async (fileId, { rejectWithValue }) => {
		try {
			await fileService.deleteDriveFile(fileId);
		}
		catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to delete file';
			return rejectWithValue(errorMessage);
		}
	},
);

export const moveDriveFileToTrash = createAsyncThunk<void, string, thunkConfig>(
	`${SLICE_NAME}/moveDriveFileToTrash`,
	async (fileId, { rejectWithValue }) => {
		try {
			await fileService.moveDriveFileToTrash(fileId);
		}
		catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to move file to trash';
			return rejectWithValue(errorMessage);
		}
	},
);

export const getDriveFileById = createAsyncThunk<
	GetDriveFileResponse,
	string,
	thunkConfig
>(
	`${SLICE_NAME}/getDriveFileById`,
	async (fileId, { rejectWithValue }) => {
		try {
			const result = await fileService.getDriveFileById(fileId);
			return result;
		}
		catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to get file by id';
			return rejectWithValue(errorMessage);
		}
	},
);

export const getCurrentFolderById = createAsyncThunk<
	GetDriveFileResponse,
	string,
	thunkConfig
>(
	`${SLICE_NAME}/getCurrentFolderById`,
	async (fileId, { rejectWithValue }) => {
		try {
			const result = await fileService.getDriveFileById(fileId);
			return result;
		}
		catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to get current folder by id';
			return rejectWithValue(errorMessage);
		}
	},
);

const getDriveFileByParentPayload = async (
	parentId: string,
	req?: GetDriveFileByParentRequest,
): Promise<GetDriveFileByParentResponse> => {
	const hasPagination = req && (req.page != null || req.size != null);
	return hasPagination
		? fileService.getDriveFileByParent(parentId, req)
		: fileService.getDriveFileByParentAll(parentId);
};

/** Thêm default order cho list/search: folder trước, rồi tới file; trong mỗi nhóm sort theo name ASC. */
function withDefaultListGraph(
	req?: GetDriveFileByParentRequest,
): GetDriveFileByParentRequest {
	const baseReq: GetDriveFileByParentRequest = { ...(req ?? {}) };
	const existingGraph = (baseReq.graph ?? {}) as Record<string, unknown>;
	const existingOrder = Array.isArray((existingGraph as any).order)
		? (existingGraph as any).order
		: [];

	const graphObject: Record<string, unknown> = {
		...existingGraph,
		order: [
			// backend field is likely snake_case
			['is_folder', 'desc'],
			['name', 'asc'],
			// Giữ thêm order cũ nếu có
			...existingOrder,
		],
	};

	return {
		...baseReq,
		graph: graphObject,
	};
}

/** Load folder cho main content (trang folder) — cập nhật files + treeRootItems */
export const getDriveFileByParent = createAsyncThunk<
	GetDriveFileByParentResponse,
	{ parentId: string; req?: GetDriveFileByParentRequest },
	thunkConfig
>(
	`${SLICE_NAME}/getDriveFileByParent`,
	async ({ parentId, req }, { rejectWithValue }) => {
		try {
			const listReq = withDefaultListGraph(req);
			return await getDriveFileByParentPayload(parentId, listReq);
		}
		catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to get file by parent';
			return rejectWithValue(errorMessage);
		}
	},
);

export const getDriveFileByParentForTree = createAsyncThunk<
	GetDriveFileByParentResponse,
	{ parentId: string; req?: GetDriveFileByParentRequest },
	thunkConfig
>(
	`${SLICE_NAME}/getDriveFileByParentForTree`,
	async ({ parentId, req }, { rejectWithValue }) => {
		try {
			// Luôn filter chỉ lấy folder cho FileTree bằng graph.isFolder = true
			const baseReq: GetDriveFileByParentRequest = { ...(req ?? {}) };
			const existingGraph = (baseReq.graph ?? {}) as Record<string, unknown>;

			const graphObject: Record<string, unknown> = {
				...existingGraph,
				isFolder: true,
			};

			const treeReq: GetDriveFileByParentRequest = {
				...baseReq,
				graph: graphObject,
			};

			return await getDriveFileByParentPayload(parentId, treeReq);
		}
		catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to get file by parent';
			return rejectWithValue(errorMessage);
		}
	},
);

export const searchDriveFile = createAsyncThunk<
	SearchDriveFileByParentResponse,
	{ req: GetDriveFileByParentRequest },
	thunkConfig
>(
	`${SLICE_NAME}/searchDriveFile`,
	async ({ req }, { rejectWithValue }) => {
		try {
			const listReq = withDefaultListGraph(req);
			const result = await fileService.searchDriveFile(listReq);
			return result;
		}
		catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to search file';
			return rejectWithValue(errorMessage);
		}
	},
);

const driveFileSlice = createSlice({
	name: SLICE_NAME,
	initialState,
	reducers: {
		setFiles: (state, action: PayloadAction<DriveFile[]>) => {
			state.files = action.payload;
		},
		setFileDetail: (state, action: PayloadAction<DriveFile>) => {
			state.fileDetail = action.payload;
		},
		resetCurrentFolder: (state) => {
			state.currentFolder = undefined;
		},
		resetFileDetail: (state) => {
			state.fileDetail = undefined;
		},
		resetCreateFile: (state) => {
			state.create = baseReduxActionState;
		},
		resetUpdateMetadataFile: (state) => {
			state.updateMetadata = baseReduxActionState;
		},
		resetDeleteFile: (state) => {
			state.delete = baseReduxActionState;
		},
		resetMoveToTrashFile: (state) => {
			state.moveToTrash = baseReduxActionState;
		},
		resetGetByIdFile: (state) => {
			state.getById = baseReduxActionState;
		},
		resetGetByParentFile: (state) => {
			state.getByParent = baseReduxActionState;
		},
		resetSearchFile: (state) => {
			state.search = baseReduxActionState;
		},
		setTreeExpandedState: (state, action: PayloadAction<TreeExpandedState>) => {
			state.treeExpandedState = action.payload;
		},
		setOpenPropertiesCard: (state, action: PayloadAction<boolean>) => {
			state.ui.openPropertiesCard = action.payload;
		},
		resetOpenPropertiesCard: (state) => {
			state.ui.openPropertiesCard = false;
		},
		setOpenCreateFileModal: (state, action: PayloadAction<boolean>) => {
			state.ui.openCreateFileModal = action.payload;
		},
		resetOpenCreateFileModal: (state) => {
			state.ui.openCreateFileModal = false;
		},
	},
	extraReducers: (builder) => {
		createDriveFileReducers(builder);
		updateDriveFileReducers(builder);
		deleteDriveFileReducers(builder);
		moveDriveFileToTrashReducers(builder);
		getDriveFileByIdReducers(builder);
		getCurrentFolderByIdReducers(builder);
		getDriveFileByParentReducers(builder);
		getDriveFileByParentForTreeReducers(builder);
		searchDriveFileReducers(builder);
	},
});

function createDriveFileReducers(
	builder: ActionReducerMapBuilder<DriveFileState>,
) {
	builder
		.addCase(createDriveFile.pending, (state) => {
			state.create.status = 'pending';
			state.create.error = null;
		})
		.addCase(createDriveFile.fulfilled, (state, action) => {
			state.create.status = 'success';
			state.create.data = action.payload;
		})
		.addCase(createDriveFile.rejected, (state, action) => {
			state.create.status = 'error';
			state.create.error = action.payload || 'Failed to create file';
		});
}

function updateDriveFileReducers(
	builder: ActionReducerMapBuilder<DriveFileState>,
) {
	builder
		.addCase(updateMetadataDriveFile.pending, (state) => {
			state.updateMetadata.status = 'pending';
			state.updateMetadata.error = null;
		})
		.addCase(updateMetadataDriveFile.fulfilled, (state, action) => {
			state.updateMetadata.status = 'success';
			state.updateMetadata.data = action.payload;
		})
		.addCase(updateMetadataDriveFile.rejected, (state, action) => {
			state.updateMetadata.status = 'error';
			state.updateMetadata.error = action.payload || 'Failed to update file';
		});
}

function deleteDriveFileReducers(
	builder: ActionReducerMapBuilder<DriveFileState>,
) {
	builder
		.addCase(deleteDriveFile.pending, (state) => {
			state.delete.status = 'pending';
			state.delete.error = null;
		})
		.addCase(deleteDriveFile.fulfilled, (state) => {
			state.delete.status = 'success';
		})
		.addCase(deleteDriveFile.rejected, (state, action) => {
			state.delete.status = 'error';
			state.delete.error = action.payload || 'Failed to delete file';
		});
}

function moveDriveFileToTrashReducers(
	builder: ActionReducerMapBuilder<DriveFileState>,
) {
	builder
		.addCase(moveDriveFileToTrash.pending, (state) => {
			state.moveToTrash.status = 'pending';
			state.moveToTrash.error = null;
		})
		.addCase(moveDriveFileToTrash.fulfilled, (state) => {
			state.moveToTrash.status = 'success';
		})
		.addCase(moveDriveFileToTrash.rejected, (state, action) => {
			state.moveToTrash.status = 'error';
			state.moveToTrash.error =
				action.payload || 'Failed to move file to trash';
		});
}

function getDriveFileByIdReducers(
	builder: ActionReducerMapBuilder<DriveFileState>,
) {
	builder
		.addCase(getDriveFileById.pending, (state) => {
			state.getById.status = 'pending';
			state.getById.error = null;
		})
		.addCase(getDriveFileById.fulfilled, (state, action) => {
			state.getById.status = 'success';
			state.getById.data = action.payload;
			state.fileDetail = action.payload;
		})
		.addCase(getDriveFileById.rejected, (state, action) => {
			state.getById.status = 'error';
			state.getById.error = action.payload || 'Failed to get file by id';
		});
}

function getCurrentFolderByIdReducers(
	builder: ActionReducerMapBuilder<DriveFileState>,
) {
	builder
		.addCase(getCurrentFolderById.pending, (_state) => {
			// giữ nguyên currentFolder khi đang loading
		})
		.addCase(getCurrentFolderById.fulfilled, (state, action) => {
			state.currentFolder = action.payload;
		})
		.addCase(getCurrentFolderById.rejected, (state) => {
			state.currentFolder = undefined;
		});
}

/** API có thể trả is_folder (snake_case), chuẩn hóa sang isFolder. */
function normalizeDriveFile(
	item: DriveFile & { is_folder?: boolean },
): DriveFile {
	return {
		...item,
		isFolder: item.isFolder ?? item.is_folder ?? false,
		children: (item.children ?? []).map((c) =>
			normalizeDriveFile(c as DriveFile & { is_folder?: boolean }),
		),
	};
}

/** Merge incoming items với existing: giữ children đã load của từng item (getByParent không đệ quy). */
function mergeChildren(
	existing: DriveFile[],
	incoming: DriveFile[],
): DriveFile[] {
	const incomingIds = new Set(incoming.map((item) => item.id));

	const updatedIncoming = incoming.map((item) => {
		const normalized = normalizeDriveFile(
			item as DriveFile & { is_folder?: boolean },
		);
		const existingItem = existing.find((e) => e.id === item.id);
		const preservedChildren = existingItem?.children?.length
			? existingItem.children
			: (normalized.children ?? []);
		return { ...normalized, children: preservedChildren };
	});

	const remainingExisting = existing.filter((item) => !incomingIds.has(item.id));

	return [...remainingExisting, ...updatedIncoming];
}

/** Cập nhật children tại parentId trong tree, giữ children đã load của từng item. */
function updateTreeChildrenAt(
	tree: DriveFile[],
	parentId: string,
	newChildren: DriveFile[],
): DriveFile[] {
	if (parentId === '') {
		return mergeChildren(tree, newChildren);
	}
	if (tree.length === 0) return tree;
	return tree.map((item) => {
		if (item.id === parentId) {
			return {
				...item,
				children: mergeChildren(item.children ?? [], newChildren),
			};
		}
		if (item.children?.length) {
			return {
				...item,
				children: updateTreeChildrenAt(item.children, parentId, newChildren),
			};
		}
		return item;
	});
}

function getDriveFileByParentReducers(
	builder: ActionReducerMapBuilder<DriveFileState>,
) {
	builder
		.addCase(getDriveFileByParent.pending, (state) => {
			state.getByParent.status = 'pending';
			state.getByParent.error = null;
		})
		.addCase(getDriveFileByParent.fulfilled, (state, action) => {
			state.getByParent.status = 'success';
			state.getByParent.data = action.payload;
			state.files = action.payload.items ?? [];
		})
		.addCase(getDriveFileByParent.rejected, (state, action) => {
			state.getByParent.status = 'error';
			state.getByParent.error =
				action.payload || 'Failed to get file by parent';
		});
}

function getDriveFileByParentForTreeReducers(
	builder: ActionReducerMapBuilder<DriveFileState>,
) {
	builder
		.addCase(getDriveFileByParentForTree.pending, (state) => {
			state.getByParentForTree.status = 'pending';
			state.getByParentForTree.error = null;
		})
		.addCase(getDriveFileByParentForTree.fulfilled, (state, action) => {
			state.getByParentForTree.status = 'success';
			state.getByParentForTree.data = action.payload;

			const parentId = action.meta.arg.parentId;
			const pageFromReq = action.meta.arg.req?.page ?? 0;
			const sizeFromReq = action.meta.arg.req?.size ?? (action.payload.items?.length ?? 0);
			const totalFromRes = action.payload.total ?? (action.payload.items?.length ?? 0);
			const currentPaging = state.treePaging[parentId];
			const loadedCount = action.payload.items?.length ?? 0;

			const loaded = currentPaging && pageFromReq > currentPaging.page
				? currentPaging.loaded + loadedCount
				: loadedCount;

			state.treePaging[parentId] = {
				page: pageFromReq,
				size: sizeFromReq,
				total: totalFromRes,
				loaded,
			};

			const sortedItems = (action.payload.items ?? []).slice().sort((a, b) =>
				a.name.localeCompare(b.name),
			);

			state.treeRootItems = updateTreeChildrenAt(
				state.treeRootItems,
				parentId,
				sortedItems,
			);
		})
		.addCase(getDriveFileByParentForTree.rejected, (state, action) => {
			state.getByParentForTree.status = 'error';
			state.getByParentForTree.error =
				action.payload || 'Failed to get file by parent';
		});
}

function searchDriveFileReducers(
	builder: ActionReducerMapBuilder<DriveFileState>,
) {
	builder
		.addCase(searchDriveFile.pending, (state) => {
			state.search.status = 'pending';
			state.search.error = null;
		})
		.addCase(searchDriveFile.fulfilled, (state, action) => {
			state.search.status = 'success';
			state.search.data = action.payload;
			state.files = action.payload.items ?? [];
		})
		.addCase(searchDriveFile.rejected, (state, action) => {
			state.search.status = 'error';
			state.search.error = action.payload || 'Failed to search file';
		});
}

export const actions = {
	...driveFileSlice.actions,
};

export const { reducer } = driveFileSlice;
