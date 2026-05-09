import { ThunkPackUseSelectorFn } from '@nikkierp/ui/appState';

import * as svc from './groupService';


export const useCreateGroup = (useSelectorFn: ThunkPackUseSelectorFn) => svc.createGroup.useHook(useSelectorFn);
export const useDeleteGroup = (useSelectorFn: ThunkPackUseSelectorFn) => svc.deleteGroup.useHook(useSelectorFn);
export const useGetGroup = (useSelectorFn: ThunkPackUseSelectorFn) => svc.getGroupById.useHook(useSelectorFn);
export const useGetGroupSchema = (useSelectorFn: ThunkPackUseSelectorFn) => svc.getGroupSchema.useHook(useSelectorFn);
export const useGroupExists = (useSelectorFn: ThunkPackUseSelectorFn) => svc.groupExists.useHook(useSelectorFn);
export const useManageGroupUsers = (useSelectorFn: ThunkPackUseSelectorFn) =>
	svc.manageGroupUsers.useHook(useSelectorFn);
export const useSearchGroups = (useSelectorFn: ThunkPackUseSelectorFn) => svc.searchGroups.useHook(useSelectorFn);
export const useUpdateGroup = (useSelectorFn: ThunkPackUseSelectorFn) => svc.updateGroup.useHook(useSelectorFn);
