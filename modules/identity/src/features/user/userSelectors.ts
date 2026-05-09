import { ThunkPackUseSelectorFn } from '@nikkierp/ui/appState';

import * as svc from './userService';


export const useCreateUser = (useSelectorFn: ThunkPackUseSelectorFn) => svc.createUser.useHook(useSelectorFn);
export const useDeleteUser = (useSelectorFn: ThunkPackUseSelectorFn) => svc.deleteUser.useHook(useSelectorFn);
export const useGetUserById = (useSelectorFn: ThunkPackUseSelectorFn) => svc.getUserById.useHook(useSelectorFn);
export const useGetUserSchema = (useSelectorFn: ThunkPackUseSelectorFn) => svc.getUserSchema.useHook(useSelectorFn);
export const useSearchUsers = (useSelectorFn: ThunkPackUseSelectorFn) => svc.searchUsers.useHook(useSelectorFn);
export const useSetUserIsArchived = (useSelectorFn: ThunkPackUseSelectorFn) =>
	svc.setUserIsArchived.useHook(useSelectorFn);
export const useUserExists = (useSelectorFn: ThunkPackUseSelectorFn) => svc.userExists.useHook(useSelectorFn);
export const useUpdateUser = (useSelectorFn: ThunkPackUseSelectorFn) => svc.updateUser.useHook(useSelectorFn);