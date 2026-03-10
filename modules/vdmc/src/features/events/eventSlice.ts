import { baseReduxActionState, ReduxActionState } from '@nikkierp/ui/appState';
import {
	ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction,
} from '@reduxjs/toolkit';

import { eventService } from './eventService';
import { Event } from './types';



export const SLICE_NAME = 'vendingMachine.event';

export type EventState = {
	detail: ReduxActionState<Event>;
	list: ReduxActionState<Event[]>;
	create: ReduxActionState<Event>;
	update: ReduxActionState<Event>;
	delete: ReduxActionState<void>;
};

export const initialEventState: EventState = {
	detail: baseReduxActionState,
	list: { ...baseReduxActionState, data: [] },
	create: baseReduxActionState,
	update: baseReduxActionState,
	delete: baseReduxActionState,
};


export const listEvents = createAsyncThunk<
	Event[],
	void,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/listEvents`,
	async (_, { rejectWithValue }) => {
		try {
			const result = await eventService.listEvents();
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to list events';
			return rejectWithValue(errorMessage);
		}
	},
);

export const getEvent = createAsyncThunk<
	Event | undefined,
	string,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/getEvent`,
	async (id, { rejectWithValue }) => {
		try {
			const result = await eventService.getEvent(id);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to get event';
			return rejectWithValue(errorMessage);
		}
	},
);

export const createEvent = createAsyncThunk<
	Event,
	Omit<Event, 'id' | 'createdAt' | 'etag'>,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/createEvent`,
	async (event, { rejectWithValue }) => {
		try {
			const result = await eventService.createEvent(event);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create event';
			return rejectWithValue(errorMessage);
		}
	},
);

export const updateEvent = createAsyncThunk<
	Event,
	{ id: string; etag: string; updates: Partial<Omit<Event, 'id' | 'createdAt' | 'etag'>> },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/updateEvent`,
	async ({ id, etag, updates }, { rejectWithValue }) => {
		try {
			const result = await eventService.updateEvent(id, etag, updates);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to update event';
			return rejectWithValue(errorMessage);
		}
	},
);

export const deleteEvent = createAsyncThunk<
	void,
	{ id: string; },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/deleteEvent`,
	async ({ id }, { rejectWithValue }) => {
		try {
			await eventService.deleteEvent(id);
			return undefined;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete event';
			return rejectWithValue(errorMessage);
		}
	},
);

const eventSlice = createSlice({
	name: SLICE_NAME,
	initialState: initialEventState,
	reducers: {
		setEvents: (state, action: PayloadAction<Event[]>) => {
			state.list.data = action.payload;
		},
		resetCreateEvent: (state) => {
			state.create = baseReduxActionState;
		},
		resetUpdateEvent: (state) => {
			state.update = baseReduxActionState;
		},
		resetDeleteEvent: (state) => {
			state.delete = baseReduxActionState;
		},
	},
	extraReducers: (builder) => {
		listEventsReducers(builder);
		getEventReducers(builder);
		createEventReducers(builder);
		updateEventReducers(builder);
		deleteEventReducers(builder);
	},
});

function listEventsReducers(builder: ActionReducerMapBuilder<EventState>) {
	builder
		.addCase(listEvents.pending, (state) => {
			state.list.status = 'pending';
			state.list.error = null;
		})
		.addCase(listEvents.fulfilled, (state, action) => {
			state.list.status = 'success';
			state.list.data = action.payload;
			state.list.error = null;
		})
		.addCase(listEvents.rejected, (state, action) => {
			state.list.status = 'error';
			state.list.error = action.payload || 'Failed to list events';
			state.list.data = [];
		});
}

function getEventReducers(builder: ActionReducerMapBuilder<EventState>) {
	builder
		.addCase(getEvent.pending, (state) => {
			state.detail.status = 'pending';
			state.detail.error = null;
			state.detail.data = undefined;
		})
		.addCase(getEvent.fulfilled, (state, action) => {
			state.detail.status = 'success';
			state.detail.data = action.payload;
		})
		.addCase(getEvent.rejected, (state, action) => {
			state.detail.status = 'error';
			state.detail.error = action.payload || 'Failed to get event';
			state.detail.data = undefined;
		});
}

function createEventReducers(builder: ActionReducerMapBuilder<EventState>) {
	builder
		.addCase(createEvent.pending, (state, _action) => {
			state.create.status = 'pending';
			state.create.error = null;
		})
		.addCase(createEvent.fulfilled, (state, action) => {
			state.create.status = 'success';
			state.create.data = action.payload;
		})
		.addCase(createEvent.rejected, (state, action) => {
			state.create.status = 'error';
			state.create.error = action.payload || 'Failed to create event';
		});
}

function updateEventReducers(builder: ActionReducerMapBuilder<EventState>) {
	builder
		.addCase(updateEvent.pending, (state, _action) => {
			state.update.status = 'pending';
			state.update.error = null;
		})
		.addCase(updateEvent.fulfilled, (state, action) => {
			state.update.status = 'success';
			state.update.data = action.payload;
			state.detail.data = action.payload;
			if (state.list.data) {
				const listIndex = state.list.data.findIndex((e) => e.id === action.payload.id);
				if (listIndex >= 0) {
					state.list.data[listIndex] = action.payload;
				}
			}
		})
		.addCase(updateEvent.rejected, (state, action) => {
			state.update.status = 'error';
			state.update.error = action.payload || 'Failed to update event';
		});
}

function deleteEventReducers(builder: ActionReducerMapBuilder<EventState>) {
	builder
		.addCase(deleteEvent.pending, (state, _action) => {
			state.delete.status = 'pending';
			state.delete.error = null;
		})
		.addCase(deleteEvent.fulfilled, (state, action) => {
			state.delete.status = 'success';
			if (state.list.data) {
				state.list.data = state.list.data.filter((e) => e.id !== action.meta.arg.id);
			}
			if (state.detail.data?.id === action.meta.arg.id) {
				state.detail.data = undefined;
			}
		})
		.addCase(deleteEvent.rejected, (state, action) => {
			state.delete.status = 'error';
			state.delete.error = action.payload || 'Failed to delete event';
		});
}


export const actions = {
	...eventSlice.actions,
};

export const { reducer } = eventSlice;

