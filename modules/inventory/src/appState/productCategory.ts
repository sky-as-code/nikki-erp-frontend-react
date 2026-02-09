import { createSelector } from '@reduxjs/toolkit';

import {
	actions,
	createProductCategory,
	deleteProductCategory,
	listProductCategories,
	reducer,
	updateProductCategory,
	type ProductCategoryState,
} from '../features/productCategory/productCategorySlice';


const STATE_KEY = 'productCategory';

export const productCategoryReducer = {
	[STATE_KEY]: reducer,
};

export const productCategoryActions = {
	listProductCategories,
	createProductCategory,
	updateProductCategory,
	deleteProductCategory,
	...actions,
};

export const selectProductCategoryState = (state: { [STATE_KEY]: ProductCategoryState }) => state[STATE_KEY];

export const selectProductCategoryList = createSelector(
	selectProductCategoryState,
	(state) => state.list,
);

export const selectCreateProductCategory = createSelector(
	selectProductCategoryState,
	(state) => state.create,
);

export const selectUpdateProductCategory = createSelector(
	selectProductCategoryState,
	(state) => state.update,
);

export const selectDeleteProductCategory = createSelector(
	selectProductCategoryState,
	(state) => state.delete,
);
