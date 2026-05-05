import { useIsAuthenticated } from '@nikkierp/shell/authenticate';
import { useMyOrgs } from '@nikkierp/shell/userContext';
import { actions as routingActions, useActiveOrgModule } from '@nikkierp/ui/appState/routingSlice';
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
		if (!isAuthenticated) return [];
		const options: SearchableSelectItem[] = [];
		options.push(...orgs.map<SearchableSelectItem>((org) => ({
			value: org.slug,
			label: org.display_name,
		})));
		return options;
	}, [orgs, isAuthenticated]);

	const handleOrgChange = (newOrgSlug: string) => {
		dispatch(routingActions.navigateTo(`/${newOrgSlug}`));
	};

	return isAuthenticated && (items.length || !props.hideIfEmpty) && (
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
