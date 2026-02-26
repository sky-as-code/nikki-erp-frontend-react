import { createSelector } from '@reduxjs/toolkit';

import {
	reducer,
	actions,
	listEvents,
	getEvent,
	createEvent,
	updateEvent,
	deleteEvent,
	EventState,
	initialEventState,
} from '@/features/events/eventSlice';


const STATE_KEY = 'event';

export const eventReducer = {
	[STATE_KEY]: reducer,
};

export const eventActions = {
	listEvents,
	getEvent,
	createEvent,
	updateEvent,
	deleteEvent,
	...actions,
};

export const selectEventState = (state: { [STATE_KEY]?: EventState }) => state?.[STATE_KEY] ?? initialEventState;

export const selectEventList = createSelector(
	selectEventState,
	(state) => state.list,
);

export const selectEventDetail = createSelector(
	selectEventState,
	(state) => state.detail,
);

export const selectCreateEvent = createSelector(
	selectEventState,
	(state) => state.create,
);

export const selectUpdateEvent = createSelector(
	selectEventState,
	(state) => state.update,
);

export const selectDeleteEvent = createSelector(
	selectEventState,
	(state) => state.delete,
);

