import { createSelector } from '@reduxjs/toolkit';

import {
	reducer,
	actions,
	listVariants,
	listAllVariants,
	getVariant,
	createVariant,
	updateVariant,
	deleteVariant,
	type VariantState,
} from '../features/variant/variantSlice';


const STATE_KEY = 'variant';

export const variantReducer = {
	[STATE_KEY]: reducer,
};

export const variantActions = {
	listVariants,
	listAllVariants,
	getVariant,
	createVariant,
	updateVariant,
	deleteVariant,
	...actions,
};

export const selectVariantState = (state: { [STATE_KEY]: VariantState }) => state[STATE_KEY];

export const selectVariantList = createSelector(
	selectVariantState,
	(state) => state.list,
);

export const selectVariantDetail = createSelector(
	selectVariantState,
	(state) => state.detail,
);

export const selectCreateVariant = createSelector(
	selectVariantState,
	(state) => state.create,
);

export const selectUpdateVariant = createSelector(
	selectVariantState,
	(state) => state.update,
);

export const selectDeleteVariant = createSelector(
	selectVariantState,
	(state) => state.delete,
);
