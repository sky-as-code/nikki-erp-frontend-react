import { baseReduxActionState, ReduxActionState } from '@nikkierp/ui/appState';
import {
	ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction,
} from '@reduxjs/toolkit';

import { CreateUserResponse, SearchUserResponse, UpdateUserRequest, UpdateUserResponse, User, DeleteUserResponse } from './types';
import { CreateUserRequest } from './types';
import { userService } from './userService';


export const SLICE_NAME = 'identity.user';

export type UserState = {
	detail :ReduxActionState<User>;
	list: ReduxActionState<User[]>;
	create: ReduxActionState<CreateUserResponse>;
	update: ReduxActionState<UpdateUserResponse>;
	delete: ReduxActionState<DeleteUserResponse>;
};

const initialState: UserState = {
	detail: baseReduxActionState,
	list: { ...baseReduxActionState, data: [] },

	create: baseReduxActionState,
	update: baseReduxActionState,
	delete: baseReduxActionState,
};

export const listUsers = createAsyncThunk<
	SearchUserResponse,
	string,
	{ rejectValue: string; state: any }
>(
	`${SLICE_NAME}/fetchUsers`,
	async (orgId, { rejectWithValue }) => {
		try {
			const result = await userService.listUsers(orgId);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to list users';
			return rejectWithValue(errorMessage);
		}
	},
);

export const getUser = createAsyncThunk<
	User,
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
	CreateUserRequest,
	{ rejectValue: string; state: any }
>(
	`${SLICE_NAME}/createUser`,
	async (data, { rejectWithValue }) => {
		try {
			const result = await userService.createUser(data);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create user';
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
	async (data, { rejectWithValue }) => {
		try {
			const result = await userService.updateUser(data);
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
		setUsers: (state, action: PayloadAction<User[]>) => {
			state.list.data = action.payload;
		},
		resetCreateUser: (state) => {
			state.create = baseReduxActionState;
		},
		resetUpdateUser: (state) => {
			state.update = baseReduxActionState;
		},
		resetDeleteUser: (state) => {
			state.delete = baseReduxActionState;
		},
	},
	extraReducers: (builder) => {
		listUsersReducers(builder);
		getUserReducers(builder);
		createUserReducers(builder);
		updateUserReducers(builder);
		deleteUserReducers(builder);
	},
});

function listUsersReducers(builder: ActionReducerMapBuilder<UserState>) {
	builder
		.addCase(listUsers.pending, (state) => {
			state.list.status = 'pending';
			state.list.error = null;
			state.list.data = [];
		})
		.addCase(listUsers.fulfilled, (state, action) => {
			state.list.status = 'success';
			state.list.data = action.payload.items;
			state.list.error = null;
		})
		.addCase(listUsers.rejected, (state, action) => {
			state.list.status = 'error';
			state.list.data = [];
			state.list.error = action.payload || 'Failed to list users';
		});
}

function getUserReducers(builder: ActionReducerMapBuilder<UserState>) {
	builder
		.addCase(getUser.pending, (state) => {
			state.detail.status = 'pending';
			state.detail.error = null;
			state.detail.data = undefined;
		})
		.addCase(getUser.fulfilled, (state, action) => {
			state.detail.status = 'success';
			state.detail.data = action.payload;
			state.detail.error = null;
		})
		.addCase(getUser.rejected, (state, action) => {
			state.detail.status = 'error';
			state.detail.data = undefined;
			state.detail.error = action.payload || 'Failed to get user';
		});
}

function createUserReducers(builder: ActionReducerMapBuilder<UserState>) {
	builder
		.addCase(createUser.pending, (state) => {
			state.create.status = 'pending';
			state.create.error = null;
			state.create.data = undefined;
		})
		.addCase(createUser.fulfilled, (state, action) => {
			state.create.status = 'success';
			state.create.data = action.payload;
			state.create.error = null;
		})
		.addCase(createUser.rejected, (state, action) => {
			state.create.status = 'error';
			state.create.error = action.payload || 'Failed to create user';
			state.create.data = undefined;
		});
}

function updateUserReducers(builder: ActionReducerMapBuilder<UserState>) {
	builder
		.addCase(updateUser.pending, (state) => {
			state.update.status = 'pending';
			state.update.error = null;
			state.update.data = undefined;
		})
		.addCase(updateUser.fulfilled, (state, action) => {
			state.update.status = 'success';
			if (state.detail.data) {
				state.detail.data.etag = action.payload.etag;
				state.detail.data.updatedAt = action.payload.updatedAt;
			}
			state.update.error = null;
		})
		.addCase(updateUser.rejected, (state, action) => {
			state.update.status = 'error';
			state.update.error = action.payload || 'Failed to update user';
			state.update.data = undefined;
		});
}

function deleteUserReducers(builder: ActionReducerMapBuilder<UserState>) {
	builder
		.addCase(deleteUser.pending, (state) => {
			state.delete.status = 'pending';
			state.delete.error = null;
			state.delete.data = undefined;
		})
		.addCase(deleteUser.fulfilled, (state) => {
			state.delete.status = 'success';
			state.detail.data = undefined;
			state.delete.error = null;
		})
		.addCase(deleteUser.rejected, (state, action) => {
			state.delete.status = 'error';
			state.delete.error = action.payload || 'Failed to delete user';
			state.delete.data = undefined;
		});
}

// Action creators are generated for each case reducer function
export const actions = {
	...userSlice.actions,
};

export const { reducer } = userSlice;