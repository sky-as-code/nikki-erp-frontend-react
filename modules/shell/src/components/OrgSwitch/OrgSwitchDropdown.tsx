import { useIsAuthenticated } from '@nikkierp/shell/auth';
import { useMyOrgs } from '@nikkierp/shell/userContext';
import { navigateToAction, useActiveOrgModule } from '@nikkierp/ui/appState/routingSlice';
import { FlatSearchableSelect, FlatSearchableSelectProps, SearchableSelectItem } from '@nikkierp/ui/components';
import React, { useMemo } from 'react';
import { useDispatch } from 'react-redux';


export type OrgSwitchDropdownProps = Pick<FlatSearchableSelectProps, 'dropdownWidth'> & {
	hideIfEmpty: boolean;
};

export function OrgSwitchDropdown(props: OrgSwitchDropdownProps): React.ReactNode {
	const dispatch = useDispatch();
	const isAuthenticated = useIsAuthenticated();
	const { orgSlug } = useActiveOrgModule();
	const orgs = useMyOrgs();

	const items = useMemo(() => {
		if (!isAuthenticated || !orgs.length) return [];
		return orgs.map<SearchableSelectItem>((org) => ({
			value: org.slug,
			label: org.name,
		}));
	}, [orgs, isAuthenticated]);

	const handleOrgChange = (newOrgSlug: string) => {
		dispatch(navigateToAction(`/${newOrgSlug}`));
	};

	return isAuthenticated && (orgs.length || !props.hideIfEmpty) && (
		<FlatSearchableSelect
			{...props}
			actionOptionLabel='Manage organizations...'
			searchPlaceholder='Search organization'
			unselectedPlaceholder='Select organization'
			dropdownWidth={props.dropdownWidth}
			items={items}
			value={orgSlug}
			onChange={handleOrgChange}
		/>
	);
};
