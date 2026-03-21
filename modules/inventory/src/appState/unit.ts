import { createSelector } from '@reduxjs/toolkit';

import {
	actions,
	createUnit,
	deleteUnit,
	getUnit,
	listUnits,
	reducer,
	updateUnit,
	type UnitState,
} from '../features/unit/unitSlice';


const STATE_KEY = 'unit';

export const unitReducer = {
	[STATE_KEY]: reducer,
};

export const unitActions = {
	listUnits,
	getUnit,
	createUnit,
	updateUnit,
	deleteUnit,
	...actions,
};

export const selectUnitState = (state: { [STATE_KEY]: UnitState }) => state[STATE_KEY];

export const selectUnitList = createSelector(
	selectUnitState,
	(state) => state.list,
);

export const selectUnitDetail = createSelector(
	selectUnitState,
	(state) => state.detail,
);

export const selectCreateUnit = createSelector(
	selectUnitState,
	(state) => state.create,
);

export const selectUpdateUnit = createSelector(
	selectUnitState,
	(state) => state.update,
);

export const selectDeleteUnit = createSelector(
	selectUnitState,
	(state) => state.delete,
);