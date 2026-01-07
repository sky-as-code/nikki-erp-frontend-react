import { selectMyOrgIdBySlug } from '@nikkierp/shell/userContext';
import {
	ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction,
} from '@reduxjs/toolkit';

import { groupService } from './groupService';
import { CreateGroupResponse, Group, ManageGroupUsersRequest, ManageGroupUsersResponse } from './types';
import { CreateGroupRequest } from './types';


export const SLICE_NAME = 'identity.group';

export type GroupState = {
	groups: Group[];
	isLoadingList: boolean;
	errorList: string | null;
	groupDetail: Group | undefined;
	createGroupResponse: CreateGroupResponse | null;
	isLoadingDetail: boolean;
	isCreatingGroup: boolean;
	isUpdatingGroup: boolean;
	isDeletingGroup: boolean;
	isManagingUsers: boolean;
	errorDetail: string | null;
	createGroupError: string | null;
	updateGroupError: string | null;
	deleteGroupError: string | null;
	manageUsersError: string | null;
};

const initialState: GroupState = {
	groups: [],
	isLoadingList: false,
	errorList: null,
	groupDetail: undefined,
	createGroupResponse: null,
	isLoadingDetail: false,
	isCreatingGroup: false,
	isUpdatingGroup: false,
	isDeletingGroup: false,
	isManagingUsers: false,
	errorDetail: null,
	createGroupError: null,
	updateGroupError: null,
	deleteGroupError: null,
	manageUsersError: null,
};

export const listGroups = createAsyncThunk<
	Group[],
	string,
	{ rejectValue: string, state: any }
>(
	`${SLICE_NAME}/fetchGroups`,
	async (orgSlug, { rejectWithValue, getState }) => {
		try {
			const state = getState();
			const orgId = selectMyOrgIdBySlug(state, orgSlug);

			if (!orgId) {
				return rejectWithValue('Organization not found');
			}

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
	Group | undefined,
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
	{ orgSlug: string; data: CreateGroupRequest },
	{ rejectValue: string, state: any }
>(
	`${SLICE_NAME}/createGroup`,
	async ({ orgSlug, data }, { rejectWithValue, getState }) => {
		try {
			const state = getState();
			const orgId = selectMyOrgIdBySlug(state, orgSlug);

			if (!orgId) {
				return rejectWithValue('Organization not found');
			}

			const dataWithOrg = { ...data, orgId };

			const result = await groupService.createGroup(dataWithOrg);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create group';
			return rejectWithValue(errorMessage);
		}
	},
);

export const updateGroup = createAsyncThunk<
	Group,
	{ id: string } & Partial<Group>,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/updateGroup`,
	async ({ id, ...data }, { rejectWithValue }) => {
		try {
			const result = await groupService.updateGroup(id, data as any);
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
			state.groups = action.payload;
		},
		setIsLoadingList: (state, action: PayloadAction<boolean>) => {
			state.isLoadingList = action.payload;
		},
		setErrorList: (state, action: PayloadAction<string | null>) => {
			state.errorList = action.payload;
		},
	},
	extraReducers: (builder) => {
		listGroupsReducers(builder);
		getGroupReducers(builder);
		createGroupReducers(builder);
		updateGroupReducers(builder);
		deleteGroupReducers(builder);
		manageGroupUsersReducers(builder);
	},
});

function listGroupsReducers(builder: ActionReducerMapBuilder<GroupState>) {
	builder
		.addCase(listGroups.pending, (state) => {
			state.isLoadingList = true;
			state.errorList = null;
		})
		.addCase(listGroups.fulfilled, (state, action) => {
			state.isLoadingList = false;
			state.groups = action.payload;
			state.errorList = null;
		})
		.addCase(listGroups.rejected, (state, action) => {
			state.isLoadingList = false;
			state.groups = [];
			state.errorList = action.payload || 'Failed to list groups';
		});
}

function getGroupReducers(builder: ActionReducerMapBuilder<GroupState>) {
	builder
		.addCase(getGroup.pending, (state) => {
			state.isLoadingDetail = true;
			state.errorDetail = null;
		})
		.addCase(getGroup.fulfilled, (state, action) => {
			state.isLoadingDetail = false;
			state.groupDetail = action.payload;
			state.errorDetail = null;
		})
		.addCase(getGroup.rejected, (state, action) => {
			state.isLoadingDetail = false;
			state.groupDetail = undefined;
			state.errorDetail = action.payload || 'Failed to get group';
		});
}

function createGroupReducers(builder: ActionReducerMapBuilder<GroupState>) {
	builder
		.addCase(createGroup.pending, (state) => {
			state.isCreatingGroup = true;
			state.createGroupError = null;
		})
		.addCase(createGroup.fulfilled, (state, action) => {
			state.isCreatingGroup = false;
			state.createGroupResponse = action.payload;
			state.createGroupError = null;
		})
		.addCase(createGroup.rejected, (state, action) => {
			state.isCreatingGroup = false;
			state.createGroupError = action.payload || 'Failed to create group';
		});
}

function updateGroupReducers(builder: ActionReducerMapBuilder<GroupState>) {
	builder
		.addCase(updateGroup.pending, (state) => {
			state.isUpdatingGroup = true;
			state.updateGroupError = null;
		})
		.addCase(updateGroup.fulfilled, (state, action) => {
			state.isUpdatingGroup = false;
			state.groupDetail = action.payload;
			state.updateGroupError = null;
		})
		.addCase(updateGroup.rejected, (state, action) => {
			state.isUpdatingGroup = false;
			state.updateGroupError = action.payload || 'Failed to update group';
		});
}

function deleteGroupReducers(builder: ActionReducerMapBuilder<GroupState>) {
	builder
		.addCase(deleteGroup.pending, (state) => {
			state.isDeletingGroup = true;
			state.deleteGroupError = null;
		})
		.addCase(deleteGroup.fulfilled, (state) => {
			state.isDeletingGroup = false;
			state.groupDetail = undefined;
			state.deleteGroupError = null;
		})
		.addCase(deleteGroup.rejected, (state, action) => {
			state.isDeletingGroup = false;
			state.deleteGroupError = action.payload || 'Failed to delete group';
		});
}

function manageGroupUsersReducers(builder: ActionReducerMapBuilder<GroupState>) {
	builder
		.addCase(manageGroupUsers.pending, (state) => {
			state.isManagingUsers = true;
			state.manageUsersError = null;
		})
		.addCase(manageGroupUsers.fulfilled, (state, action) => {
			state.isManagingUsers = false;
			if (state.groupDetail) {
				state.groupDetail.etag = action.payload.etag;
				state.groupDetail.updatedAt = action.payload.updatedAt;
			}
			state.manageUsersError = null;
		})
		.addCase(manageGroupUsers.rejected, (state, action) => {
			state.isManagingUsers = false;
			state.manageUsersError = action.payload || 'Failed to manage group users';
		});
}

// Action creators are generated for each case reducer function
export const actions = {
	...groupSlice.actions,
};

export const { reducer } = groupSlice;
