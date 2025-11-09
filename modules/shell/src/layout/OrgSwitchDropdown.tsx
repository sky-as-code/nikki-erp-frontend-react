import { useIsAuthenticated } from '@nikkierp/shell/auth';
import { useMyOrgs } from '@nikkierp/shell/userContext';
import { FlatSearchableSelect, FlatSearchableSelectProps, SearchableSelectItem } from '@nikkierp/ui/components';
import React, { useMemo } from 'react';


export type OrgSwitchDropdownProps = Pick<FlatSearchableSelectProps, 'dropdownWidth'> & {
	hideIfEmpty: boolean;
};

export function OrgSwitchDropdown(props: OrgSwitchDropdownProps): React.ReactNode {
	// const { userSettings } = useConfig();
	// const { orgSlug, redirectToOrg } = useTenantUrl();
	const isAuthenticated = useIsAuthenticated();
	const orgs = useMyOrgs();

	const items = useMemo(() => {
		if (!isAuthenticated || !orgs.length) return [];
		return orgs.map<SearchableSelectItem>((org) => ({
			value: org.slug,
			label: org.name,
		}));
	}, [orgs, isAuthenticated]);

	const handleOrgChange = (orgSlug: string) => {
		// redirectToOrg(orgSlug);
	};

	return isAuthenticated && (orgs.length || !props.hideIfEmpty) && (
		<FlatSearchableSelect
			{...props}
			actionOptionLabel='Manage organizations...'
			searchPlaceholder='Search organization'
			unselectedPlaceholder='Select organization'
			targetClass='box-content'
			// targetColor='#000'
			targetFz='h3'
			targetFw='bolder'
			dropdownWidth={props.dropdownWidth}
			items={items}
			// value={orgSlug}
			onChange={handleOrgChange}
		/>
	);
};
