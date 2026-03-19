import { createSelector } from '@reduxjs/toolkit';

import {
	actions,
	createUnitCategory,
	deleteUnitCategory,
	getUnitCategory,
	listUnitCategories,
	reducer,
	updateUnitCategory,
	type UnitCategoryState,
} from '../features/unitCategory/unitCategorySlice';


const STATE_KEY = 'unitCategory';

export const unitCategoryReducer = {
	[STATE_KEY]: reducer,
};

export const unitCategoryActions = {
	listUnitCategories,
	getUnitCategory,
	createUnitCategory,
	updateUnitCategory,
	deleteUnitCategory,
	...actions,
};

export const selectUnitCategoryState = (state: { [STATE_KEY]: UnitCategoryState }) => state[STATE_KEY];

export const selectUnitCategoryDetail = createSelector(
	selectUnitCategoryState,
	(state) => state.detail,
);

export const selectUnitCategoryList = createSelector(
	selectUnitCategoryState,
	(state) => state.list,
);

export const selectCreateUnitCategory = createSelector(
	selectUnitCategoryState,
	(state) => state.create,
);

export const selectUpdateUnitCategory = createSelector(
	selectUnitCategoryState,
	(state) => state.update,
);

export const selectDeleteUnitCategory = createSelector(
	selectUnitCategoryState,
	(state) => state.delete,
);
