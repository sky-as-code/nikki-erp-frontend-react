import { combineReducers, Dispatch, ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';

import { groupReducer } from './group';
import { hierarchyReducer } from './hierarchy';
import { organizationReducer } from './organization';
import { userReducer } from './user';


export { userActions, selectUserState, selectSearchUsers as selectUsers } from './user';
export { groupActions, selectGroupState, selectGroupList as selectGroups } from './group';
export { hierarchyActions, selectHierarchyState, selectHierarchyList as selectHierarchies } from './hierarchy';
export { hierarchyActions as orgUnitActions, selectHierarchyState as selectOrgUnitState, selectHierarchyList as selectOrgUnits } from './hierarchy';
export { organizationActions, selectOrganizationState, selectOrganizationList as selectOrganizations, selectOrganizationDetail, selectManageOrganizationUsers } from './organization';

export const reducer = combineReducers({
	...userReducer,
	...groupReducer,
	...hierarchyReducer,
	...organizationReducer,
});

export type IdentityDispatch = ThunkDispatch<
	ReturnType<typeof reducer>,
	undefined,
	UnknownAction
> &
	Dispatch<UnknownAction>;

// export const userActions = {
// 	fetchUsers,
// 	...userAct,
// };

// export const selectUserState = (state: ReturnType<typeof reducer>) => state.user;