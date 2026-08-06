import { useIsAuthenticated } from '@nikkierp/shell/authenticate';
import { routingService, useActiveOrgModule } from '@nikkierp/shell/routing';
import { useMyOrgs } from '@nikkierp/shell/userContext';
import { FlatSearchableSelect, FlatSearchableSelectProps, SearchableSelectItem } from '@nikkierp/ui/components';
import React, { useMemo } from 'react';


export type OrgSwitchDropdownProps = Pick<FlatSearchableSelectProps, 'dropdownWidth'> & {
	hideIfEmpty: boolean,
};

export function OrgSwitchDropdown(props: OrgSwitchDropdownProps): React.ReactNode {
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
		void routingService.navigateTo({ to: `/${newOrgSlug}` });
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
