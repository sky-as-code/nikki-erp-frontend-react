import { createSelector } from '@reduxjs/toolkit';

import {
	actions,
	createAttributeValue,
	deleteAttributeValue,
	getAttributeValue,
	listAttributeValues,
	reducer,
	updateAttributeValue,
	type AttributeValueState,
} from '../features/attributeValue/attributeValueSlice';


const STATE_KEY = 'attributeValue';

export const attributeValueReducer = {
	[STATE_KEY]: reducer,
};

export const attributeValueActions = {
	listAttributeValues,
	getAttributeValue,
	createAttributeValue,
	updateAttributeValue,
	deleteAttributeValue,
	...actions,
};

export const selectAttributeValueState = (state: { [STATE_KEY]: AttributeValueState }) => state[STATE_KEY];

export const selectAttributeValueList = createSelector(
	selectAttributeValueState,
	(state) => state.list,
);

export const selectAttributeValueDetail = createSelector(
	selectAttributeValueState,
	(state) => state.detail,
);

export const selectCreateAttributeValue = createSelector(
	selectAttributeValueState,
	(state) => state.create,
);

export const selectUpdateAttributeValue = createSelector(
	selectAttributeValueState,
	(state) => state.update,
);

export const selectDeleteAttributeValue = createSelector(
	selectAttributeValueState,
	(state) => state.delete,
);
