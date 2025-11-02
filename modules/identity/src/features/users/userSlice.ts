import {
	ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction,
} from '@reduxjs/toolkit';

import { User } from './types';
import { userService } from './userService';


export const SLICE_NAME = 'identity.user';

export type UserState = {
	users: User[];
	isLoadingList: boolean;
	errorList: string | null;
	userDetail: User | undefined;
	isLoadingDetail: boolean;
	errorDetail: string | null;
};

const initialState: UserState = {
	users: [],
	isLoadingList: false,
	errorList: null,
	userDetail: undefined,
	isLoadingDetail: false,
	errorDetail: null,
};

export const listUsers = createAsyncThunk<
	User[],
	void,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/fetchUsers`,
	async (_, { rejectWithValue }) => {
		try {
			const result = await userService.listUsers();
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to list users';
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
		getUserReducers(builder);
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


// Action creators are generated for each case reducer function
export const actions = {
	...userSlice.actions,
};

export const { reducer } = userSlice;