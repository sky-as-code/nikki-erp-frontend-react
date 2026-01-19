import { createSelector } from '@reduxjs/toolkit';

import {
	reducer,
	actions,
	listActions,
	getAction,
	createAction,
	updateAction,
	deleteAction,
	ActionState,
} from '@/features/actions/actionSlice';


const STATE_KEY = 'action';

export const actionReducer = {
	[STATE_KEY]: reducer,
};

export const actionActions = {
	listActions,
	getAction,
	createAction,
	updateAction,
	deleteAction,
	...actions,
};

export const selectActionState = (state: { [STATE_KEY]: ActionState }) => state[STATE_KEY];

export const selectActionList = createSelector(
	selectActionState,
	(state) => state.actions,
);

export const selectActionDetail = createSelector(
	selectActionState,
	(state) => state.actionDetail,
);

export const selectCreateAction = createSelector(
	selectActionState,
	(state) => state.create,
);

export const selectUpdateAction = createSelector(
	selectActionState,
	(state) => state.update,
);

export const selectDeleteAction = createSelector(
	selectActionState,
	(state) => state.delete,
);
