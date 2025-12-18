import { combineReducers, Dispatch, ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';

import { actionReducer } from './action';
import { entitlementReducer } from './entitlement';
import { grantRequestReducer } from './grantRequest';
import { identityReducer } from './identity';
import { resourceReducer } from './resource';
import { roleReducer } from './role';
import { roleSuiteReducer } from './roleSuite';


export { actionActions, selectActionState, selectActionList } from './action';
export { entitlementActions, selectEntitlementState, selectEntitlementList } from './entitlement';
export { grantRequestActions, selectGrantRequestState, selectGrantRequestList } from './grantRequest';
export { identityActions, selectIdentityState, selectUserList, selectGroupList } from './identity';
export { resourceActions, selectResourceState, selectResourceList } from './resource';
export { roleActions, selectRoleState, selectRoleList } from './role';
export { roleSuiteActions, selectRoleSuiteState, selectRoleSuiteList } from './roleSuite';

export const reducer = combineReducers({
	...actionReducer,
	...entitlementReducer,
	...grantRequestReducer,
	...identityReducer,
	...resourceReducer,
	...roleReducer,
	...roleSuiteReducer,
});

export type AuthorizeDispatch = ThunkDispatch<
	ReturnType<typeof reducer>,
	undefined,
	UnknownAction
> &
	Dispatch<UnknownAction>;
