import * as svc from './userService';


export const useCreateUser = () => svc.createUser.useHook();
export const useDeleteUser = () => svc.deleteUser.useHook();
export const useGetUserById = () => svc.getUserById.useHook();
export const useGetUserSchema = () => svc.getUserSchema.useHook();
export const useSearchUsers = () => svc.searchUsers.useHook();
export const useSetUserIsArchived = () => svc.setUserIsArchived.useHook();
export const useUserExists = () => svc.userExists.useHook();
export const useUpdateUser = () => svc.updateUser.useHook();