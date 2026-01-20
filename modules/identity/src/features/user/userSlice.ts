import {
	ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction,
} from '@reduxjs/toolkit';

import { CreateUserResponse, SearchUserResponse, UpdateUserRequest, UpdateUserResponse, User, DeleteUserResponse } from './types';
import { CreateUserRequest } from './types';
import { userService } from './userService';
import { initialReduxActionState, ReduxActionState } from '../../appState/reduxActionState';


export const SLICE_NAME = 'identity.user';

export type UserState = {
	users: User[];
	userDetail?: User;
	isLoading: boolean;
	error: string | null;
	create: ReduxActionState<CreateUserResponse>;
	update: ReduxActionState<UpdateUserResponse>;
	delete: ReduxActionState<DeleteUserResponse>;
};

const initialState: UserState = {
	users: [],
	userDetail: undefined,
	isLoading: false,
	error: null,
	create: initialReduxActionState<CreateUserResponse>(),
	update: initialReduxActionState<UpdateUserResponse>(),
	delete: initialReduxActionState<DeleteUserResponse>(),
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
			state.users = action.payload;
		},
		setIsLoading: (state, action: PayloadAction<boolean>) => {
			state.isLoading = action.payload;
		},
		setError: (state, action: PayloadAction<string | null>) => {
			state.error = action.payload;
		},
		resetCreateUser: (state) => {
			state.create = initialReduxActionState<CreateUserResponse>();
		},
		resetUpdateUser: (state) => {
			state.update = initialReduxActionState<UpdateUserResponse>();
		},
		resetDeleteUser: (state) => {
			state.delete = initialReduxActionState<DeleteUserResponse>();
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
			state.isLoading = true;
			state.error = null;
		})
		.addCase(listUsers.fulfilled, (state, action) => {
			state.isLoading = false;
			state.users = action.payload.items;
			state.error = null;
		})
		.addCase(listUsers.rejected, (state, action) => {
			state.isLoading = false;
			state.users = [];
			state.error = action.payload || 'Failed to list users';
		});
}

function getUserReducers(builder: ActionReducerMapBuilder<UserState>) {
	builder
		.addCase(getUser.pending, (state) => {
			state.isLoading = true;
			state.error = null;
		})
		.addCase(getUser.fulfilled, (state, action) => {
			state.isLoading = false;
			state.userDetail = action.payload;
			state.error = null;
		})
		.addCase(getUser.rejected, (state, action) => {
			state.isLoading = false;
			state.userDetail = undefined;
			state.error = action.payload || 'Failed to get user';
		});
}

function createUserReducers(builder: ActionReducerMapBuilder<UserState>) {
	builder
		.addCase(createUser.pending, (state) => {
			state.create.status = 'pending';
			state.create.error = null;
		})
		.addCase(createUser.fulfilled, (state, action) => {
			state.create.status = 'success';
			state.create.data = action.payload;
			state.create.error = null;
		})
		.addCase(createUser.rejected, (state, action) => {
			state.create.status = 'error';
			state.create.error = action.payload || 'Failed to create user';
		});
}

function updateUserReducers(builder: ActionReducerMapBuilder<UserState>) {
	builder
		.addCase(updateUser.pending, (state) => {
			state.update.status = 'pending';
			state.update.error = null;
		})
		.addCase(updateUser.fulfilled, (state, action) => {
			state.update.status = 'success';
			if (state.userDetail) {
				state.userDetail.etag = action.payload.etag;
				state.userDetail.updatedAt = action.payload.updatedAt;
			}
			state.update.error = null;
		})
		.addCase(updateUser.rejected, (state, action) => {
			state.update.status = 'error';
			state.update.error = action.payload || 'Failed to update user';
		});
}

function deleteUserReducers(builder: ActionReducerMapBuilder<UserState>) {
	builder
		.addCase(deleteUser.pending, (state) => {
			state.delete.status = 'pending';
			state.delete.error = null;
		})
		.addCase(deleteUser.fulfilled, (state) => {
			state.delete.status = 'success';
			state.userDetail = undefined;
			state.delete.error = null;
		})
		.addCase(deleteUser.rejected, (state, action) => {
			state.delete.status = 'error';
			state.delete.error = action.payload || 'Failed to delete user';
		});
}

// Action creators are generated for each case reducer function
export const actions = {
	...userSlice.actions,
};

export const { reducer } = userSlice;