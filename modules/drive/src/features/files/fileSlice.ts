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
	DriveFileStatus,
	GetDriveFileAncestorsResponse,
	RestoreDriveFileFromTrashResponse,
	DriveFileType,
} from './types';


export const SLICE_NAME = 'drive.file';

export type TreeExpandedState = Record<string, boolean>;

export type DriveFileUIState = {
	driveFileModal: DriveFileModalUIState;
	openPropertiesCard: boolean;
	openCreateFileModal: boolean;
	openUpdateMetadataModal: boolean;
};

export type DriveFileModalUIState = {
	openedModal: boolean;
	type: ModalType;
	title: string;
};

export type ModalType =
	| { type: 'properties' }
	| { type: 'share' }
	| { type: 'create'; defaultIsFolder?: boolean }
	| { type: 'update' }
	| {
		type: 'file-selector';
		afterSelectFn: (selectedId: string[] | string) => void;
		mode?: 'file' | 'folder';
		multiple?: boolean;
		action?: string;
	}
	| {
		type: 'delete-confirm';
		fileId: string;
		fileName: string;
		parentDriveFileRef?: string;
	}
	| { type: 'preview' };

export type CurrentListContext = {
	source?: 'byParent' | 'search' | 'shared';
	parentId: string;
	page: number;
	size: number;
	graph?: Record<string, unknown>;
};

export type DriveFileState = {
	/** Danh sách file của folder hiện tại (main content) */
	files: DriveFile[];
	/** Thông tin folder hiện tại (dùng cho tiêu đề, breadcrumb, v.v.) */
	currentFolder?: DriveFile;
	/** Danh sách file root cho sidebar FileTree */
	treeRootItems: DriveFile[];
	/** Thông tin pagination cho từng parent trong FileTree */
	treePaging: Record<
		string,
		{
			page: number;
			size: number;
			total: number;
			loaded: number;
		}
	>;
	/** Trạng thái expand của FileTree, persist để sống qua remount khi navigate */
	treeExpandedState: TreeExpandedState;
	fileDetail?: DriveFile;
	ancestors?: DriveFile[];
	ui: DriveFileUIState;
	currentListContext?: CurrentListContext;

	create: ReduxActionState<CreateDriveFileResponse>;
	updateMetadata: ReduxActionState<UpdateDriveFileMetadataResponse>;
	delete: ReduxActionState<void>;
	moveToTrash: ReduxActionState<void>;
	getById: ReduxActionState<GetDriveFileResponse>;
	getByParent: ReduxActionState<GetDriveFileByParentResponse>;
	getByParentForTree: ReduxActionState<GetDriveFileByParentResponse>;
	search: ReduxActionState<SearchDriveFileByParentResponse>;
	getAncestors: ReduxActionState<GetDriveFileAncestorsResponse>;
	restoreFromTrash: ReduxActionState<RestoreDriveFileFromTrashResponse>;
};

export const initialState: DriveFileState = {
	files: [],
	currentFolder: undefined,
	treeRootItems: [],
	treePaging: {},
	treeExpandedState: {},
	fileDetail: undefined,
	ancestors: [],
	ui: {
		driveFileModal: {
			openedModal: false,
			type: {
				type: 'properties',
			},
			title: '',
		},
		openPropertiesCard: false,
		openCreateFileModal: false,
		openUpdateMetadataModal: false,
	},

	create: baseReduxActionState,
	updateMetadata: baseReduxActionState,
	delete: baseReduxActionState,
	moveToTrash: baseReduxActionState,
	getById: baseReduxActionState,
	getByParent: baseReduxActionState,
	getByParentForTree: baseReduxActionState,
	getAncestors: baseReduxActionState,
	restoreFromTrash: baseReduxActionState,
	search: baseReduxActionState,
	currentListContext: undefined,
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
		} catch (error) {
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
		} catch (error) {
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
		} catch (error) {
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
		} catch (error) {
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
>(`${SLICE_NAME}/getDriveFileById`, async (fileId, { rejectWithValue }) => {
	try {
		const result = await fileService.getDriveFileById(fileId);
		return result;
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : 'Failed to get file by id';
		return rejectWithValue(errorMessage);
	}
});

export const getCurrentFolderById = createAsyncThunk<
	GetDriveFileResponse,
	string,
	thunkConfig
>(`${SLICE_NAME}/getCurrentFolderById`, async (fileId, { rejectWithValue }) => {
	try {
		const result = await fileService.getDriveFileById(fileId);
		return result;
	} catch (error) {
		const errorMessage =
			error instanceof Error
				? error.message
				: 'Failed to get current folder by id';
		return rejectWithValue(errorMessage);
	}
});

const getDriveFileByParentPayload = async (
	parentId: string,
	req?: GetDriveFileByParentRequest,
): Promise<GetDriveFileByParentResponse> => {
	const hasPagination = req && (req.page != null || req.size != null);
	return hasPagination
		? fileService.getDriveFileByParent(parentId, req)
		: fileService.getDriveFileByParentAll(parentId);
};

/** Thêm default order cho list/search: folder trước, rồi tới file; trong mỗi nhóm sort theo name ASC.
 *  Nếu caller đã truyền order thì ưu tiên dùng order đó, KHÔNG gắn default nữa.
 */
function withDefaultListGraph(
	req?: GetDriveFileByParentRequest,
): GetDriveFileByParentRequest {
	const baseReq: GetDriveFileByParentRequest = { ...(req ?? {}) };
	const existingGraph = (baseReq.graph ?? {}) as Record<string, unknown>;
	const existingOrder = Array.isArray((existingGraph as any).order)
		? (existingGraph as any).order
		: [];

	const graphObject: Record<string, unknown> =
		existingOrder.length > 0
			? {
				...existingGraph,
				order: existingOrder,
			}
			: {
				...existingGraph,
				order: [
					['is_folder', 'desc'],
					['name', 'asc'],
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
		} catch (error) {
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
			// Luôn filter chỉ lấy ACTIVE folder cho FileTree
			const baseReq: GetDriveFileByParentRequest = { ...(req ?? {}) };
			const existingGraph = (baseReq.graph ?? {}) as Record<string, unknown>;

			const graphObject: Record<string, unknown> = {
				...existingGraph,
				isFolder: true,
				if: ['status', '=', DriveFileStatus.ACTIVE],
			};

			const treeReq: GetDriveFileByParentRequest = {
				...baseReq,
				graph: graphObject,
			};

			return await getDriveFileByParentPayload(parentId, treeReq);
		} catch (error) {
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
>(`${SLICE_NAME}/searchDriveFile`, async ({ req }, { rejectWithValue }) => {
	try {
		const listReq = withDefaultListGraph(req);
		const result = await fileService.searchDriveFile(listReq);
		return result;
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : 'Failed to search file';
		return rejectWithValue(errorMessage);
	}
});

export const searchDriveFileShared = createAsyncThunk<
	SearchDriveFileByParentResponse,
	{ req: GetDriveFileByParentRequest },
	thunkConfig
>(`${SLICE_NAME}/searchDriveFileShared`, async ({ req }, { rejectWithValue }) => {
	try {
		const listReq = withDefaultListGraph(req);
		const result = await fileService.searchDriveFileShared(listReq);
		return result;
	} catch (error) {
		const errorMessage =
			error instanceof Error
				? error.message
				: 'Failed to search shared files';
		return rejectWithValue(errorMessage);
	}
});

export const getDriveFileAncestors = createAsyncThunk<
	GetDriveFileAncestorsResponse,
	string,
	thunkConfig
>(
	`${SLICE_NAME}/getDriveFileAncestors`,
	async (fileId, { rejectWithValue }) => {
		try {
			const result = await fileService.getDriveFileAncestors(fileId);
			return result;
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to get file ancestors';
			return rejectWithValue(errorMessage);
		}
	},
);

export const restoreDriveFileFromTrash = createAsyncThunk<
	RestoreDriveFileFromTrashResponse,
	{ fileId: string; parentDriveFileRef: string | null },
	thunkConfig
>(
	`${SLICE_NAME}/restoreDriveFileFromTrash`,
	async ({ fileId, parentDriveFileRef }, { rejectWithValue }) => {
		try {
			const result = await fileService.restoreDriveFileFromTrash(
				fileId,
				parentDriveFileRef,
			);
			return result;
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Failed to restore file from trash';
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
		resetDriveFileAncestors: (state) => {
			state.ancestors = [];
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
		setOpenUpdateMetadataModal: (state, action: PayloadAction<boolean>) => {
			state.ui.openUpdateMetadataModal = action.payload;
		},
		resetOpenUpdateMetadataModal: (state) => {
			state.ui.openUpdateMetadataModal = false;
		},
		setDriveFileModal: (
			state,
			action: PayloadAction<DriveFileModalUIState>,
		) => {
			state.ui.driveFileModal = action.payload;
		},
		resetDriveFileModal: (state) => {
			state.ui.driveFileModal.openedModal = false;
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
		searchDriveFileSharedReducers(builder);
		getDriveFileAncestorsReducers(builder);
		restoreDriveFileFromTrashReducers(builder);
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
			state.fileDetail = normalizeDriveFile(action.payload as DriveFile);
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
			state.currentFolder = normalizeDriveFile(action.payload as DriveFile);
		})
		.addCase(getCurrentFolderById.rejected, (state) => {
			state.currentFolder = undefined;
		});
}

const MIME_TO_DRIVE_FILE_TYPE: Record<string, DriveFileType> = {
	// Document
	'application/msword': DriveFileType.DOCUMENT,
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
		DriveFileType.DOCUMENT,
	'application/vnd.google-apps.document': DriveFileType.DOCUMENT,
	'application/vnd.oasis.opendocument.text': DriveFileType.DOCUMENT,

	// Spreadsheet
	'application/vnd.ms-excel': DriveFileType.SPREADSHEET,
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
		DriveFileType.SPREADSHEET,
	'application/vnd.google-apps.spreadsheet': DriveFileType.SPREADSHEET,
	'application/vnd.oasis.opendocument.spreadsheet': DriveFileType.SPREADSHEET,

	// Presentation
	'application/vnd.ms-powerpoint': DriveFileType.PRESENTATION,
	'application/vnd.openxmlformats-officedocument.presentationml.presentation':
		DriveFileType.PRESENTATION,
	'application/vnd.google-apps.presentation': DriveFileType.PRESENTATION,
	'application/vnd.oasis.opendocument.presentation': DriveFileType.PRESENTATION,

	// PDF
	'application/pdf': DriveFileType.PDF,

	// Code
	'application/json': DriveFileType.CODE,
	'application/javascript': DriveFileType.CODE,
	'application/typescript': DriveFileType.CODE,
	'application/xml': DriveFileType.CODE,
	'application/x-sh': DriveFileType.CODE,
	'application/wasm': DriveFileType.CODE,

	// Archive
	'application/zip': DriveFileType.ARCHIVE,
	'application/x-rar-compressed': DriveFileType.ARCHIVE,
	'application/x-7z-compressed': DriveFileType.ARCHIVE,
	'application/x-tar': DriveFileType.ARCHIVE,
	'application/gzip': DriveFileType.ARCHIVE,
	'application/x-bzip2': DriveFileType.ARCHIVE,
	'application/x-xz': DriveFileType.ARCHIVE,
};

export const DRIVE_FILE_TYPE_TO_MIME: Record<DriveFileType, string[]> = {
	[DriveFileType.FOLDER]: ['inode/directory'],
	[DriveFileType.IMAGE]: [
		'image/jpeg',
		'image/png',
		'image/gif',
		'image/webp',
		'image/bmp',
		'image/svg+xml',
		'image/tiff',
		'image/heic',
		'image/heif',
	],
	[DriveFileType.VIDEO]: [
		'video/mp4',
		'video/webm',
		'video/ogg',
		'video/quicktime',
		'video/x-msvideo',
		'video/x-matroska',
		'video/mpeg',
		'video/3gpp',
		'video/3gpp2',
	],
	[DriveFileType.AUDIO]: [
		'audio/mpeg',
		'audio/wav',
		'audio/ogg',
		'audio/aac',
		'audio/flac',
		'audio/webm',
		'audio/mp4',
		'audio/x-m4a',
		'audio/opus',
	],
	[DriveFileType.DOCUMENT]: [
		'application/msword',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		'application/vnd.google-apps.document',
		'application/vnd.oasis.opendocument.text',
	],
	[DriveFileType.SPREADSHEET]: [
		'application/vnd.ms-excel',
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		'application/vnd.google-apps.spreadsheet',
		'application/vnd.oasis.opendocument.spreadsheet',
	],
	[DriveFileType.PRESENTATION]: [
		'application/vnd.ms-powerpoint',
		'application/vnd.openxmlformats-officedocument.presentationml.presentation',
		'application/vnd.google-apps.presentation',
		'application/vnd.oasis.opendocument.presentation',
	],
	[DriveFileType.PDF]: ['application/pdf'],
	[DriveFileType.TEXT]: ['text/plain'],
	[DriveFileType.CODE]: [
		'application/json',
		'application/javascript',
		'application/typescript',
		'application/xml',
		'application/x-sh',
		'application/wasm',
	],
	[DriveFileType.ARCHIVE]: [
		'application/zip',
		'application/x-rar-compressed',
		'application/x-7z-compressed',
		'application/x-tar',
		'application/gzip',
		'application/x-bzip2',
		'application/x-xz',
	],
	[DriveFileType.OTHER]: ['application/octet-stream'],
};

const CODE_TEXT_SUBTYPES = new Set([
	'javascript',
	'typescript',
	'x-python',
	'x-java',
	'x-c',
	'x-c++',
	'x-go',
	'x-rust',
	'x-php',
	'html',
	'css',
	'xml',
	'x-sh',
	'x-shellscript',
]);

function mimeToDriveFileType(mime: string): DriveFileType {
	if (mime.startsWith('image/')) return DriveFileType.IMAGE;
	if (mime.startsWith('video/')) return DriveFileType.VIDEO;
	if (mime.startsWith('audio/')) return DriveFileType.AUDIO;

	if (mime.startsWith('text/')) {
		const subtype = mime.split('/')[1];
		return CODE_TEXT_SUBTYPES.has(subtype)
			? DriveFileType.CODE
			: DriveFileType.TEXT;
	}

	return MIME_TO_DRIVE_FILE_TYPE[mime] ?? DriveFileType.OTHER;
}

function normalizeDriveFile(item: DriveFile): DriveFile {
	let type: DriveFileType = DriveFileType.FOLDER;
	if (!item.isFolder) {
		type = mimeToDriveFileType(item.mime);
	}

	return {
		...item,
		type: type,
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

	const remainingExisting = existing.filter(
		(item) => !incomingIds.has(item.id),
	);

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
			state.files = (action.payload.items ?? []).map((item) =>
				normalizeDriveFile(item as DriveFile),
			);

			const parentId = action.meta.arg.parentId;
			const req = action.meta.arg.req;

			state.currentListContext = {
				source: 'byParent',
				parentId,
				page: req?.page ?? 0,
				size: req?.size ?? action.payload.items?.length ?? 20,
				graph: (req?.graph ?? {}) as Record<string, unknown>,
			};
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
			const sizeFromReq =
				action.meta.arg.req?.size ?? action.payload.items?.length ?? 0;
			const totalFromRes =
				action.payload.total ?? action.payload.items?.length ?? 0;
			const currentPaging = state.treePaging[parentId];
			const loadedCount = action.payload.items?.length ?? 0;

			const loaded =
				currentPaging && pageFromReq > currentPaging.page
					? currentPaging.loaded + loadedCount
					: loadedCount;

			state.treePaging[parentId] = {
				page: pageFromReq,
				size: sizeFromReq,
				total: totalFromRes,
				loaded,
			};

			const sortedItems = (action.payload.items ?? [])
				.slice()
				.sort((a, b) => a.name.localeCompare(b.name));

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
			state.files = (action.payload.items ?? []).map((item) =>
				normalizeDriveFile(item as DriveFile),
			);

			const req = action.meta.arg.req;
			state.currentListContext = {
				source: 'search',
				parentId: '',
				page: req?.page ?? 0,
				size: req?.size ?? action.payload.items?.length ?? 20,
				graph: (req?.graph ?? {}) as Record<string, unknown>,
			};
		})
		.addCase(searchDriveFile.rejected, (state, action) => {
			state.search.status = 'error';
			state.search.error = action.payload || 'Failed to search file';
		});
}

function searchDriveFileSharedReducers(
	builder: ActionReducerMapBuilder<DriveFileState>,
) {
	builder
		.addCase(searchDriveFileShared.pending, (state) => {
			state.search.status = 'pending';
			state.search.error = null;
		})
		.addCase(searchDriveFileShared.fulfilled, (state, action) => {
			state.search.status = 'success';
			state.search.data = action.payload;
			state.files = (action.payload.items ?? []).map((item) =>
				normalizeDriveFile(item as DriveFile),
			);

			const req = action.meta.arg.req;
			state.currentListContext = {
				source: 'shared',
				parentId: '',
				page: req?.page ?? 0,
				size: req?.size ?? action.payload.items?.length ?? 20,
				graph: (req?.graph ?? {}) as Record<string, unknown>,
			};
		})
		.addCase(searchDriveFileShared.rejected, (state, action) => {
			state.search.status = 'error';
			state.search.error = action.payload || 'Failed to search shared files';
		});
}

function getDriveFileAncestorsReducers(
	builder: ActionReducerMapBuilder<DriveFileState>,
) {
	builder
		.addCase(getDriveFileAncestors.pending, (state) => {
			state.getAncestors.status = 'pending';
			state.getAncestors.error = null;
		})
		.addCase(getDriveFileAncestors.fulfilled, (state, action) => {
			state.getAncestors.status = 'success';
			state.getAncestors.data = action.payload;
			state.ancestors = action.payload.map((item) =>
				normalizeDriveFile(item as DriveFile),
			);
		})
		.addCase(getDriveFileAncestors.rejected, (state) => {
			state.getAncestors.status = 'error';
			state.getAncestors.error = 'Failed to get file ancestors';
			state.ancestors = undefined;
		});
}

function restoreDriveFileFromTrashReducers(
	builder: ActionReducerMapBuilder<DriveFileState>,
) {
	builder
		.addCase(restoreDriveFileFromTrash.pending, (state) => {
			state.restoreFromTrash.status = 'pending';
			state.restoreFromTrash.error = null;
		})
		.addCase(restoreDriveFileFromTrash.fulfilled, (state, action) => {
			state.restoreFromTrash.status = 'success';
			state.restoreFromTrash.data = action.payload;
		})
		.addCase(restoreDriveFileFromTrash.rejected, (state, action) => {
			state.restoreFromTrash.status = 'error';
			state.restoreFromTrash.error =
				action.payload || 'Failed to restore file from trash';
		});
}

export const actions = {
	...driveFileSlice.actions,
};

export const { reducer } = driveFileSlice;
