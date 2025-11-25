import { selectMyOrgIdBySlug } from '@nikkierp/shell/userContext';
import {
	ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction,
} from '@reduxjs/toolkit';


import { CreateUserResponse, UpdateUserRequest, UpdateUserResponse, User } from './types';
import { CreateUserRequest } from './types';
import { userService } from './userService';


export const SLICE_NAME = 'identity.user';

export type UserState = {
	users: User[];
	usersByGroup: User[];
	isLoadingList: boolean;
	isLoadingUsersByGroup: boolean;
	errorList: string | null;
	errorUsersByGroup: string | null;
	userDetail: User | undefined;
	createUserResponse: CreateUserResponse | null;
	updateUserResponse: UpdateUserResponse | null;
	isLoadingDetail: boolean;
	isCreatingUser: boolean;
	isUpdatingUser: boolean;
	isDeletingUser: boolean;
	errorDetail: string | null;
	createUserError: string | null;
	updateUserError: string | null;
	deleteUserError: string | null;
};

const initialState: UserState = {
	users: [],
	usersByGroup: [],
	isLoadingList: false,
	isLoadingUsersByGroup: false,
	errorList: null,
	errorUsersByGroup: null,
	userDetail: undefined,
	createUserResponse: null,
	updateUserResponse: null,
	isLoadingDetail: false,
	isCreatingUser: false,
	isUpdatingUser: false,
	isDeletingUser: false,
	errorDetail: null,
	createUserError: null,
	updateUserError: null,
	deleteUserError: null,
};

export const listUsers = createAsyncThunk<
	User[],
	string,
	{ rejectValue: string; state: any }
>(
	`${SLICE_NAME}/fetchUsers`,
	async (orgSlug, { rejectWithValue, getState }) => {
		try {
			const state = getState();
			const orgId = selectMyOrgIdBySlug(state, orgSlug);

			if (!orgId) {
				return rejectWithValue('Organization not found');
			}

			const result = await userService.listUsers(orgId);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to list users';
			return rejectWithValue(errorMessage);
		}
	},
);

export const listUsersByGroupId = createAsyncThunk<
	User[],
	string,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/fetchUsersByGroupId`,
	async (groupId, { rejectWithValue }) => {
		try {
			const result = await userService.listUsersByGroupId(groupId);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to list users by group';
			return rejectWithValue(errorMessage);
		}
	},
);

export const getUser = createAsyncThunk<
	User | undefined,
	string,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/fetchUser`,
	async (id, { rejectWithValue }) => {
		try {
			const result = await userService.getUser(id);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to get user';
			return rejectWithValue(errorMessage);
		}
	},
);

export const createUser = createAsyncThunk<
	CreateUserResponse,
	{ orgSlug: string; data: CreateUserRequest },
	{ rejectValue: string; state: any }
>(
	`${SLICE_NAME}/createUser`,
	async ({ orgSlug, data }, { rejectWithValue, getState }) => {
		try {
			const state = getState();
			const orgId = selectMyOrgIdBySlug(state, orgSlug);

			if (!orgId) {
				return rejectWithValue('Organization not found');
			}

			const dataWithOrg = { ...data, orgId };

			const result = await userService.createUser(dataWithOrg);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create user';
			console.error('Create user error:', error);
			return rejectWithValue(errorMessage);
		}
	},
);

export const updateUser = createAsyncThunk<
	UpdateUserResponse,
	UpdateUserRequest,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/updateUser`,
	async ({ id, ...data }, { rejectWithValue }) => {
		try {
			const result = await userService.updateUser(id, data);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
			return rejectWithValue(errorMessage);
		}
	},
);

export const deleteUser = createAsyncThunk<
	void,
	string,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/deleteUser`,
	async (id, { rejectWithValue }) => {
		try {
			await userService.deleteUser(id);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete user';
			return rejectWithValue(errorMessage);
		}
	},
);

const userSlice = createSlice({
	name: SLICE_NAME,
	initialState,
	reducers: {
		setUsers: (state, action: PayloadAction<any[]>) => {
			state.users = action.payload;
		},
		setIsLoadingList: (state, action: PayloadAction<boolean>) => {
			state.isLoadingList = action.payload;
		},
		setErrorList: (state, action: PayloadAction<string | null>) => {
			state.errorList = action.payload;
		},
	},
	extraReducers: (builder) => {
		listUsersReducers(builder);
		listUsersByGroupIdReducers(builder);
		getUserReducers(builder);
		createUserReducers(builder);
		updateUserReducers(builder);
		deleteUserReducers(builder);
	},
});

function listUsersReducers(builder: ActionReducerMapBuilder<UserState>) {
	builder
		.addCase(listUsers.pending, (state) => {
			state.isLoadingList = true;
			state.errorList = null;
		})
		.addCase(listUsers.fulfilled, (state, action) => {
			state.isLoadingList = false;
			state.users = action.payload;
			state.errorList = null;
		})
		.addCase(listUsers.rejected, (state, action) => {
			state.isLoadingList = false;
			state.users = [];
			state.errorList = action.payload || 'Failed to list users';
		});
}

function listUsersByGroupIdReducers(builder: ActionReducerMapBuilder<UserState>) {
	builder
		.addCase(listUsersByGroupId.pending, (state) => {
			state.isLoadingUsersByGroup = true;
			state.errorUsersByGroup = null;
		})
		.addCase(listUsersByGroupId.fulfilled, (state, action) => {
			state.isLoadingUsersByGroup = false;
			state.usersByGroup = action.payload;
			state.errorUsersByGroup = null;
		})
		.addCase(listUsersByGroupId.rejected, (state, action) => {
			state.isLoadingUsersByGroup = false;
			state.usersByGroup = [];
			state.errorUsersByGroup = action.payload || 'Failed to list users by group';
		});
}

function getUserReducers(builder: ActionReducerMapBuilder<UserState>) {
	builder
		.addCase(getUser.pending, (state) => {
			state.isLoadingDetail = true;
			state.errorDetail = null;
		})
		.addCase(getUser.fulfilled, (state, action) => {
			state.isLoadingDetail = false;
			state.userDetail = action.payload;
			state.errorDetail = null;
		})
		.addCase(getUser.rejected, (state, action) => {
			state.isLoadingDetail = false;
			state.userDetail = undefined;
			state.errorDetail = action.payload || 'Failed to get user';
		});
}

function createUserReducers(builder: ActionReducerMapBuilder<UserState>) {
	builder
		.addCase(createUser.pending, (state) => {
			state.isCreatingUser = true;
			state.createUserError = null;
		})
		.addCase(createUser.fulfilled, (state, action) => {
			state.isCreatingUser = false;
			state.createUserResponse = action.payload;
			state.createUserError = null;
		})
		.addCase(createUser.rejected, (state, action) => {
			state.isCreatingUser = false;
			state.createUserError = action.payload || 'Failed to create user';
		});
}

function updateUserReducers(builder: ActionReducerMapBuilder<UserState>) {
	builder
		.addCase(updateUser.pending, (state) => {
			state.isUpdatingUser = true;
			state.updateUserError = null;
		})
		.addCase(updateUser.fulfilled, (state, action) => {
			state.isUpdatingUser = false;
			state.updateUserResponse = action.payload;
			state.updateUserError = null;
		})
		.addCase(updateUser.rejected, (state, action) => {
			state.isUpdatingUser = false;
			state.updateUserError = action.payload || 'Failed to update user';
		});
}

function deleteUserReducers(builder: ActionReducerMapBuilder<UserState>) {
	builder
		.addCase(deleteUser.pending, (state) => {
			state.isDeletingUser = true;
			state.deleteUserError = null;
		})
		.addCase(deleteUser.fulfilled, (state) => {
			state.isDeletingUser = false;
			state.userDetail = undefined;
			state.deleteUserError = null;
		})
		.addCase(deleteUser.rejected, (state, action) => {
			state.isDeletingUser = false;
			state.deleteUserError = action.payload || 'Failed to delete user';
		});
}

// Action creators are generated for each case reducer function
export const actions = {
	...userSlice.actions,
};

export const { reducer } = userSlice;