import { useSelector } from 'react-redux';

import * as svc from './groupService';


export const useCreateGroup = () => useSelector(svc.createGroup.selector);
export const useDeleteGroup = () => useSelector(svc.deleteGroup.selector);
export const useGetGroup = () => useSelector(svc.getGroupById.selector);
export const useGetGroupSchema = () => useSelector(svc.getGroupSchema.selector);
export const useGroupExists = () => useSelector(svc.groupExists.selector);
export const useManageGroupUsers = () => useSelector(svc.manageGroupUsers.selector);
export const useSearchGroups = () => useSelector(svc.searchGroups.selector);
export const useUpdateGroup = () => useSelector(svc.updateGroup.selector);
