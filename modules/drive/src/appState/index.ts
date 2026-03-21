import { combineReducers, Dispatch, ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';

import { actionReducer } from './file';
import { actionReducer as fileShareActionReducer } from './fileShare';
import { identityReducer } from './identity';


export const reducer = combineReducers({
	...actionReducer,
	...fileShareActionReducer,
	...identityReducer,
});

export type AuthorizeDispatch = ThunkDispatch<
	ReturnType<typeof reducer>,
	undefined,
	UnknownAction
> &
	Dispatch<UnknownAction>;
