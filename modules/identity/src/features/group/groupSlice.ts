import { baseReduxActionState, ReduxActionState } from '@nikkierp/ui/appState';
import {
	ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction,
} from '@reduxjs/toolkit';

import { groupService } from './groupService';
import {
	CreateGroupRequest,
	CreateGroupResponse,
	DeleteGroupResponse,
	Group,
	ManageGroupUsersRequest,
	ManageGroupUsersResponse,
	SearchGroupsResponse,
	UpdateGroupRequest,
	UpdateGroupResponse,
} from './types';


export const SLICE_NAME = 'identity.group';

export type GroupState = {
	detail: ReduxActionState<Group>;
	list: ReduxActionState<Group[]>;
	create: ReduxActionState<CreateGroupResponse>
	update: ReduxActionState<UpdateGroupResponse>
	delete: ReduxActionState<DeleteGroupResponse>
	manageUsers: ReduxActionState<ManageGroupUsersResponse>
};

const initialState: GroupState = {
	detail: baseReduxActionState,
	list: { ...baseReduxActionState, data: [] },
	create: baseReduxActionState,
	update: baseReduxActionState,
	delete: baseReduxActionState,
	manageUsers: baseReduxActionState,
};

export const listGroups = createAsyncThunk<
	SearchGroupsResponse,
	string,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/fetchGroups`,
	async (orgId, { rejectWithValue }) => {
		try {
			const result = await groupService.listGroups(orgId);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to list groups';
			return rejectWithValue(errorMessage);
		}
	},
);

export const getGroup = createAsyncThunk<
	Group,
	string,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/fetchGroup`,
	async (id, { rejectWithValue }) => {
		try {
			const result = await groupService.getGroup(id);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to get group';
			return rejectWithValue(errorMessage);
		}
	},
);

export const createGroup = createAsyncThunk<
	CreateGroupResponse,
	CreateGroupRequest,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/createGroup`,
	async (data, { rejectWithValue }) => {
		try {
			const result = await groupService.createGroup(data);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create group';
			return rejectWithValue(errorMessage);
		}
	},
);

export const updateGroup = createAsyncThunk<
	UpdateGroupResponse,
	UpdateGroupRequest,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/updateGroup`,
	async (data, { rejectWithValue }) => {
		try {
			const result = await groupService.updateGroup(data);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to update group';
			return rejectWithValue(errorMessage);
		}
	},
);

export const deleteGroup = createAsyncThunk<
	void,
	string,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/deleteGroup`,
	async (id, { rejectWithValue }) => {
		try {
			await groupService.deleteGroup(id);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete group';
			return rejectWithValue(errorMessage);
		}
	},
);

export const manageGroupUsers = createAsyncThunk<
	ManageGroupUsersResponse,
	ManageGroupUsersRequest,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/manageGroupUsers`,
	async (data, { rejectWithValue }) => {
		try {
			const result = await groupService.manageGroupUsers(data);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to manage group users';
			return rejectWithValue(errorMessage);
		}
	},
);


const groupSlice = createSlice({
	name: SLICE_NAME,
	initialState,
	reducers: {
		setGroups: (state, action: PayloadAction<any[]>) => {
			state.list.data = action.payload;
		},
		resetCreateGroup: (state) => {
			state.create = baseReduxActionState;
		},
		resetUpdateGroup: (state) => {
			state.update = baseReduxActionState;
		},
		resetDeleteGroup: (state) => {
			state.delete = baseReduxActionState;
		},
		resetManageUsers: (state) => {
			state.manageUsers = baseReduxActionState;
		},
	},
	extraReducers: (builder) => {
		listGroupsReducers(builder);
		getGroupReducers(builder);
		createGroupReducers(builder);
		updateGroupReducers(builder);
		deleteGroupReducers(builder);
		manageUsersReducers(builder);
	},
});

function listGroupsReducers(builder: ActionReducerMapBuilder<GroupState>) {
	builder
		.addCase(listGroups.pending, (state) => {
			state.list.status = 'pending';
			state.list.error = null;
			state.list.data = [];
		})
		.addCase(listGroups.fulfilled, (state, action) => {
			state.list.status = 'success';
			state.list.data = action.payload.items;
			state.list.error = null;
		})
		.addCase(listGroups.rejected, (state, action) => {
			state.list.status = 'error';
			state.list.data = [];
			state.list.error = action.payload || 'Failed to list groups';
		});
}

function getGroupReducers(builder: ActionReducerMapBuilder<GroupState>) {
	builder
		.addCase(getGroup.pending, (state) => {
			state.detail.status = 'pending';
			state.detail.error = null;
			state.detail.data = undefined;
		})
		.addCase(getGroup.fulfilled, (state, action) => {
			state.detail.status = 'success';
			state.detail.data = action.payload;
			state.detail.error = null;
		})
		.addCase(getGroup.rejected, (state, action) => {
			state.detail.status = 'error';
			state.detail.data = undefined;
			state.detail.error = action.payload || 'Failed to get group';
		});
}

function createGroupReducers(builder: ActionReducerMapBuilder<GroupState>) {
	builder
		.addCase(createGroup.pending, (state) => {
			state.create.status = 'pending';
			state.create.error = null;
			state.create.data = undefined;

		})
		.addCase(createGroup.fulfilled, (state, action) => {
			state.create.status = 'success';
			state.create.data = action.payload;
			state.create.error = null;
		})
		.addCase(createGroup.rejected, (state, action) => {
			state.create.status = 'error';
			state.create.error = action.payload || 'Failed to create group';
			state.create.data = undefined;
		});
}

function updateGroupReducers(builder: ActionReducerMapBuilder<GroupState>) {
	builder
		.addCase(updateGroup.pending, (state) => {
			state.update.status = 'pending';
			state.update.error = null;
			state.update.data = undefined;
		})
		.addCase(updateGroup.fulfilled, (state, action) => {
			state.update.status = 'success';
			if (state.detail.data) {
				state.detail.data.etag = action.payload.etag;
				state.detail.data.updatedAt = action.payload.updatedAt;
			}
			state.update.error = null;
		})
		.addCase(updateGroup.rejected, (state, action) => {
			state.update.status = 'error';
			state.update.error = action.payload || 'Failed to update group';
			state.update.data = undefined;
		});
}

function deleteGroupReducers(builder: ActionReducerMapBuilder<GroupState>) {
	builder
		.addCase(deleteGroup.pending, (state) => {
			state.delete.status = 'pending';
			state.delete.error = null;
			state.delete.data = undefined;
		})
		.addCase(deleteGroup.fulfilled, (state) => {
			state.delete.status = 'success';
			state.detail.data = undefined;
			state.delete.error = null;
		})
		.addCase(deleteGroup.rejected, (state, action) => {
			state.delete.status = 'error';
			state.delete.error = action.payload || 'Failed to delete group';
			state.delete.data = undefined;
		});
}

function manageUsersReducers(builder: ActionReducerMapBuilder<GroupState>) {
	builder
		.addCase(manageGroupUsers.pending, (state) => {
			state.manageUsers.status = 'pending';
			state.manageUsers.error = null;
			state.manageUsers.data = undefined;
		})
		.addCase(manageGroupUsers.fulfilled, (state, action) => {
			state.manageUsers.status = 'success';
			if (state.detail.data) {
				state.detail.data.etag = action.payload.etag;
				state.detail.data.updatedAt = action.payload.updatedAt;
			}
			state.manageUsers.error = null;
		})
		.addCase(manageGroupUsers.rejected, (state, action) => {
			state.manageUsers.status = 'error';
			state.manageUsers.error = action.payload || 'Failed to manage group users';
			state.manageUsers.data = undefined;
		});
}

// Action creators are generated for each case reducer function
export const actions = {
	...groupSlice.actions,
};

export const { reducer } = groupSlice;
