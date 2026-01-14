import { combineReducers, Dispatch, ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';

import { actionReducer } from './action';
import { entitlementReducer } from './entitlement';
import { grantRequestReducer } from './grantRequest';
import { identityReducer } from './identity';
import { resourceReducer } from './resource';
import { revokeRequestReducer } from './revokeRequest';
import { roleReducer } from './role';
import { roleSuiteReducer } from './roleSuite';


export { actionActions, selectActionState, selectActionList, selectActionDetail, selectCreateAction, selectUpdateAction, selectDeleteAction } from './action';
export { entitlementActions, selectEntitlementState, selectEntitlementList, selectCreateEntitlement, selectUpdateEntitlement, selectDeleteEntitlement } from './entitlement';
export { grantRequestActions, selectGrantRequestState, selectGrantRequestList, selectCreateGrantRequest, selectRespondGrantRequest, selectCancelGrantRequest, selectDeleteGrantRequest } from './grantRequest';
export { identityActions, selectIdentityState, selectUserList, selectGroupList, selectOrgList } from './identity';
export { resourceActions, selectResourceState, selectResourceList, selectCreateResource, selectUpdateResource, selectDeleteResource } from './resource';
export { revokeRequestActions, selectRevokeRequestState, selectRevokeRequestList, selectCreateRevokeRequest, selectCreateManyRevokeRequest, selectDeleteRevokeRequest } from './revokeRequest';
export { roleActions, selectRoleState, selectRoleList, selectCreateRole, selectUpdateRole, selectDeleteRole, selectAddEntitlementsRole, selectRemoveEntitlementsRole } from './role';
export { roleSuiteActions, selectRoleSuiteState, selectRoleSuiteList, selectCreateRoleSuite, selectUpdateRoleSuite, selectDeleteRoleSuite } from './roleSuite';

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

export type AuthorizeDispatch = ThunkDispatch<
	ReturnType<typeof reducer>,
	undefined,
	UnknownAction
> &
	Dispatch<UnknownAction>;
