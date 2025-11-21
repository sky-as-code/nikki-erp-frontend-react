import { combineReducers, Dispatch, ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';

import { resourceReducer } from './resource';


export { resourceActions, selectResourceState, selectResourceList } from './resource';

export const reducer = combineReducers({
	...resourceReducer,
});

export type AuthorizeDispatch = ThunkDispatch<
	ReturnType<typeof reducer>,
	undefined,
	UnknownAction
> &
	Dispatch<UnknownAction>;
