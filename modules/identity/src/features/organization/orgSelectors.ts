import { useSelector } from 'react-redux';

import * as svc from './orgService';


export const useCreateOrganization = () => useSelector(svc.createOrg.selector);
export const useDeleteOrganization = () => useSelector(svc.deleteOrg.selector);
export const useGetOrganization = () => useSelector(svc.getOrgById.selector);
export const useGetOrganizationSchema = () => useSelector(svc.getOrgSchema.selector);
export const useOrganizationExists = () => useSelector(svc.orgExists.selector);
export const useSearchOrganizations = () => useSelector(svc.searchOrgs.selector);
export const useUpdateOrganization = () => useSelector(svc.updateOrg.selector);
