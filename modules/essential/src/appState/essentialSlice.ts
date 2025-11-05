import { createSlice, PayloadAction } from '@reduxjs/toolkit';


export const SLICE_NAME = 'essential';

export type EssentialState = {
	modules: any[];
	isLoading: boolean;
	error: string | null;
};

const initialState: EssentialState = {
	modules: [],
	isLoading: false,
	error: null,
};

const essentialSlice = createSlice({
	name: SLICE_NAME,
	initialState,
	reducers: {
		setModules: (state, action: PayloadAction<any[]>) => {
			state.modules = action.payload;
		},
		setIsLoading: (state, action: PayloadAction<boolean>) => {
			state.isLoading = action.payload;
		},
		setError: (state, action: PayloadAction<string | null>) => {
			state.error = action.payload;
		},
	},
});


// Action creators are generated for each case reducer function
export const actions = {
	...essentialSlice.actions,
};

export const { reducer } = essentialSlice;