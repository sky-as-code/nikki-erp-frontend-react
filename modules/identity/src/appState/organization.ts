import { createSelector } from '@reduxjs/toolkit';

import { reducer, actions, listOrganizations, getOrganization, createOrganization, updateOrganization, deleteOrganization, OrganizationState } from '../features/organization/organizationSlice';


const STATE_KEY = 'organization';

export const organizationReducer = {
	[STATE_KEY]: reducer,
};

export const organizationActions = {
	listOrganizations,
	getOrganization,
	createOrganization,
	updateOrganization,
	deleteOrganization,
	...actions,
};

export const selectOrganizationState = (state: { [STATE_KEY]: OrganizationState }) => state[STATE_KEY];

export const selectOrganizationList = createSelector(
	selectOrganizationState,
	(state) => state.organizations,
);

export const selectOrganizationDetail = createSelector(
	selectOrganizationState,
	(state) => state.organizationDetail,
);

export const selectCreateOrganization = createSelector(
	selectOrganizationState,
	(state) => state.create,
);

export const selectUpdateOrganization = createSelector(
	selectOrganizationState,
	(state) => state.update,
);

export const selectDeleteOrganization = createSelector(
	selectOrganizationState,
	(state) => state.delete,
);
