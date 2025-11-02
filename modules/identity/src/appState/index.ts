import { combineReducers, Dispatch, ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';

import { userReducer } from './user';


export { userActions, selectUserState, selectUserList as selectUsers } from './user';

export const reducer = combineReducers({
	...userReducer,
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