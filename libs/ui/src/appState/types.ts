import type { ActionReducerMapBuilder, AsyncThunk, Reducer, Store } from '@reduxjs/toolkit';


/** Any class, abstract or concrete. `createServiceSlice` only ever reads its prototype and `name`. */
export type ServiceClass<TInstance = any> = abstract new (...args: any[]) => TInstance;

/** A `ClientErrorItem` flattened to plain JSON, because the class extends `Error` and is not serializable. */
export type SerializedClientError = {
	key: string,
	message: string,
	type: string,
	field?: string,
};

/** `null` until the method has been dispatched for the first time. */
export type ServiceMethodStatus = 'pending' | 'fulfilled' | 'rejected' | null;

/**
 * How a service method becomes part of its slice.
 *
 * `async` — a `createAsyncThunk` with the full `{status, data, clientErrors, error,
 * doneAt}` envelope. `sync` — a plain reducer whose return value replaces
 * `state[methodName]` outright.
 */
export type ServiceMethodKind = 'async' | 'sync';

/**
 * One service method's request state.
 *
 * `clientErrors` and `error` are deliberately separate. A client error is a validation
 * or business rejection the server returned on purpose — it belongs on the form field
 * that caused it. `error` is a technical failure (the call threw) and belongs in a toast.
 * A call that returns client errors still **completed**, so its status is `fulfilled`.
 */
export type ServiceMethodState<TData = any> = {
	status: ServiceMethodStatus,
	data: TData | null,
	clientErrors: SerializedClientError[],
	error: string | null,
	/** `Date.now()` at the last settle, fulfilled or rejected. `0` if never settled. */
	doneAt: number,
};

/**
 * One service's slice state: a {@link ServiceMethodState} per member.
 *
 * Deliberately loose — it maps over **every** member of the class, not just the methods
 * that became slice entries. Non-method members are `undefined` at runtime, and so is
 * any method left unannotated.
 */
export type ServiceSliceState<TInstance> = {
	[TKey in keyof TInstance]: ServiceMethodState;
};

/** The thunk generated for one service method. Its argument is the method's params. */
export type ServiceMethodThunk = AsyncThunk<any, any, { rejectValue: string }>;

/** Resets one method's state back to its initial value. */
export type ResetActionCreator = (() => { type: string }) & { type?: string };

/**
 * The action dispatched for one `@storeSyncMethod`. Its arguments are the method's
 * params; the reducer runs the method and stores what it returns.
 */
export type SyncActionCreator = ((...args: any[]) => { type: string, payload: any }) & { type?: string };

export type CreateServiceSliceOptions<TState = any> = {
	/**
	 * The slice's name in the module store. Required — `@storeService` passes the name
	 * its caller gave it. It is never derived from the class, which a minifier renames.
	 */
	sliceName?: string,
	/** Merged over the generated per-method initial state. */
	initialState?: Partial<TState>,
	/** Passed straight to `createSlice`. These action creators appear in the returned `actions`. */
	reducers?: Record<string, any>,
	/** Runs after the generated thunk cases, so it can override them. */
	extraReducers?: (builder: ActionReducerMapBuilder<any>) => void,
};

/** What `createServiceSlice` hands back. */
export type ServiceSlice<TInstance = any> = {
	name: string,
	reducer: Reducer<ServiceSliceState<TInstance>>,
	/**
	 * `createSlice().actions` merged with the generated thunks and their reset actions.
	 *
	 * RTK's own `slice.actions` only contains creators from the `reducers` field — thunks
	 * registered through `extraReducers` never appear there, so this map is assembled here.
	 *
	 * Heterogeneous by nature: caller-supplied creators, thunks and reset actions.
	 */
	actions: Record<string, any>,
	/** One per `@storeAsyncMethod`. */
	thunks: Record<string, ServiceMethodThunk>,
	/** One per `@storeSyncMethod`. */
	syncActions: Record<string, SyncActionCreator>,
	resetActions: Record<string, ResetActionCreator>,
	/** Every annotated method, async and sync alike. */
	methodNames: string[],
};

/** A Redux store owned by one module — the Shell, or a single micro-app. */
export type ModuleStore = {
	/** Registry key: a micro-app slug, or `shell`. */
	name: string,
	store: Store,
	dispatch: Store['dispatch'],
	getState: () => Record<string, unknown>,
	/** Adds a reducer under `sliceName` and rebuilds the root reducer. Throws on a duplicate name. */
	injectSliceReducer: (sliceName: string, reducer: Reducer) => void,
	hasSlice: (sliceName: string) => boolean,
	createServiceSlice: <TInstance>(
		serviceClass: ServiceClass<TInstance>,
		instance: TInstance,
		options?: CreateServiceSliceOptions,
	) => ServiceSlice<TInstance>,
};

/**
 * What {@link useServiceLayer} exposes: a {@link ServiceMethodState} with the status
 * expanded into booleans.
 */
export type ServiceLayerResult<TData = any> = {
	isPending: boolean,
	isFulfilled: boolean,
	/** Fulfilled **and** clean — no client errors. The usual success test. */
	isSuccess: boolean,
	isRejected: boolean,
	/** A technical failure: the call threw. Show it as a toast, not on a field. */
	error: string | null,
	/** Validation or business rejections. Show these on the fields that caused them. */
	clientErrors: SerializedClientError[],
	data: TData | null,
	doneAt: number,
};
