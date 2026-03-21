import { createSelector } from '@reduxjs/toolkit';

import {
	reducer,
	actions,
	listProducts,
	getProduct,
	createProduct,
	updateProduct,
	deleteProduct,
	type ProductState,
} from '../features/product/productSlice';


const STATE_KEY = 'product';

export const productReducer = {
	[STATE_KEY]: reducer,
};

export const productActions = {
	listProducts,
	getProduct,
	createProduct,
	updateProduct,
	deleteProduct,
	...actions,
};

export const selectProductState = (state: { [STATE_KEY]: ProductState }) => state[STATE_KEY];

export const selectProductList = createSelector(
	selectProductState,
	(state) => state.list,
);

export const selectProductDetail = createSelector(
	selectProductState,
	(state) => state.detail,
);

export const selectCreateProduct = createSelector(
	selectProductState,
	(state) => state.create,
);

export const selectUpdateProduct = createSelector(
	selectProductState,
	(state) => state.update,
);

export const selectDeleteProduct = createSelector(
	selectProductState,
	(state) => state.delete,
);
