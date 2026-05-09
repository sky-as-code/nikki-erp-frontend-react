import { ThunkPackUseSelectorFn } from '@nikkierp/ui/appState';

import * as svc from './orgService';


export const useCreateOrganization = (useSelectorFn: ThunkPackUseSelectorFn) => svc.createOrg.useHook(useSelectorFn);
export const useDeleteOrganization = (useSelectorFn: ThunkPackUseSelectorFn) => svc.deleteOrg.useHook(useSelectorFn);
export const useGetOrganization = (useSelectorFn: ThunkPackUseSelectorFn) => svc.getOrgById.useHook(useSelectorFn);
export const useGetOrganizationSchema = (useSelectorFn: ThunkPackUseSelectorFn) =>
	svc.getOrgSchema.useHook(useSelectorFn);
export const useOrganizationExists = (useSelectorFn: ThunkPackUseSelectorFn) => svc.orgExists.useHook(useSelectorFn);
export const useSearchOrganizations = (useSelectorFn: ThunkPackUseSelectorFn) => svc.searchOrgs.useHook(useSelectorFn);
export const useUpdateOrganization = (useSelectorFn: ThunkPackUseSelectorFn) => svc.updateOrg.useHook(useSelectorFn);
