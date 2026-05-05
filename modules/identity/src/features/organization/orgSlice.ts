import { createSlice, Dispatch, ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';

import * as svc from './orgService';
import { ORGANIZATION_SCHEMA_NAME } from '../../constants';


export const SLICE_NAME = ORGANIZATION_SCHEMA_NAME;

export type OrganizationState = typeof initialState;

export const initialState = {
	[svc.createOrg.stateKey]: svc.createOrg.initialState,
	[svc.deleteOrg.stateKey]: svc.deleteOrg.initialState,
	[svc.getOrgById.stateKey]: svc.getOrgById.initialState,
	[svc.getOrgBySlug.stateKey]: svc.getOrgBySlug.initialState,
	[svc.getOrgSchema.stateKey]: svc.getOrgSchema.initialState,
	[svc.manageOrgUsers.stateKey]: svc.manageOrgUsers.initialState,
	[svc.orgExists.stateKey]: svc.orgExists.initialState,
	[svc.searchOrgs.stateKey]: svc.searchOrgs.initialState,
	[svc.updateOrg.stateKey]: svc.updateOrg.initialState,
};

const organizationSlice = createSlice({
	name: SLICE_NAME,
	initialState,
	reducers: {
		resetCreateOrg: svc.createOrg.resetThunk,
		resetDeleteOrg: svc.deleteOrg.resetThunk,
		resetGetOrgById: svc.getOrgById.resetThunk,
		resetGetOrgBySlug: svc.getOrgBySlug.resetThunk,
		resetGetOrgSchema: svc.getOrgSchema.resetThunk,
		resetManageOrgUsers: svc.manageOrgUsers.resetThunk,
		resetOrgExists: svc.orgExists.resetThunk,
		resetSearchOrgs: svc.searchOrgs.resetThunk,
		resetUpdateOrg: svc.updateOrg.resetThunk,
	},
	extraReducers: (builder) => {
		svc.createOrg.buildThunkReducers(builder);
		svc.deleteOrg.buildThunkReducers(builder);
		svc.getOrgById.buildThunkReducers(builder);
		svc.getOrgBySlug.buildThunkReducers(builder);
		svc.getOrgSchema.buildThunkReducers(builder);
		svc.manageOrgUsers.buildThunkReducers(builder);
		svc.orgExists.buildThunkReducers(builder);
		svc.searchOrgs.buildThunkReducers(builder);
		svc.updateOrg.buildThunkReducers(builder);
	},
});

export const actions = {
	...organizationSlice.actions,
	[svc.createOrg.stateKey]: svc.createOrg.action,
	[svc.deleteOrg.stateKey]: svc.deleteOrg.action,
	[svc.getOrgById.stateKey]: svc.getOrgById.action,
	[svc.getOrgBySlug.stateKey]: svc.getOrgBySlug.action,
	[svc.getOrgSchema.stateKey]: svc.getOrgSchema.action,
	[svc.manageOrgUsers.stateKey]: svc.manageOrgUsers.action,
	[svc.orgExists.stateKey]: svc.orgExists.action,
	[svc.searchOrgs.stateKey]: svc.searchOrgs.action,
	[svc.updateOrg.stateKey]: svc.updateOrg.action,
};

export const { reducer } = organizationSlice;

export type OrgDispatch = ThunkDispatch<
	ReturnType<typeof reducer>,
	undefined,
	UnknownAction
> &
	Dispatch<UnknownAction>;