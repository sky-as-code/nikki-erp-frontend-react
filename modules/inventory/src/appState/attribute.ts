import { createSelector } from '@reduxjs/toolkit';

import {
	reducer,
	actions,
	listAttributes,
	getAttribute,
	createAttribute,
	updateAttribute,
	deleteAttribute,
	type AttributeState,
} from '../features/attribute/attributeSlice';


const STATE_KEY = 'attribute';

export const attributeReducer = {
	[STATE_KEY]: reducer,
};

export const attributeActions = {
	listAttributes,
	getAttribute,
	createAttribute,
	updateAttribute,
	deleteAttribute,
	...actions,
};

export const selectAttributeState = (state: { [STATE_KEY]: AttributeState }) => state[STATE_KEY];

export const selectAttributeList = createSelector(
	selectAttributeState,
	(state) => state.list,
);

export const selectAttributeDetail = createSelector(
	selectAttributeState,
	(state) => state.detail,
);

export const selectCreateAttribute = createSelector(
	selectAttributeState,
	(state) => state.create,
);

export const selectUpdateAttribute = createSelector(
	selectAttributeState,
	(state) => state.update,
);

export const selectDeleteAttribute = createSelector(
	selectAttributeState,
	(state) => state.delete,
);
