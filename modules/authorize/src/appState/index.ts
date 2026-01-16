import { combineReducers, Dispatch, ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';

import { actionReducer } from './action';
import { entitlementReducer } from './entitlement';
import { grantRequestReducer } from './grantRequest';
import { identityReducer } from './identity';
import { resourceReducer } from './resource';
import { revokeRequestReducer } from './revokeRequest';
import { roleReducer } from './role';
import { roleSuiteReducer } from './roleSuite';


export const reducer = combineReducers({
	...actionReducer,
	...entitlementReducer,
	...grantRequestReducer,
	...identityReducer,
	...resourceReducer,
	...revokeRequestReducer,
	...roleReducer,
	...roleSuiteReducer,
});

export * from './action';
export * from './entitlement';
export * from './grantRequest';
export * from './identity';
export * from './resource';
export * from './revokeRequest';
export * from './role';
export * from './roleSuite';

export type AuthorizeDispatch = ThunkDispatch<
	ReturnType<typeof reducer>,
	undefined,
	UnknownAction
> &
	Dispatch<UnknownAction>;
