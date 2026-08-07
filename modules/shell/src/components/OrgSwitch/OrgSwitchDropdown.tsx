import { useIsAuthenticated } from '@nikkierp/shell/authenticate';
import { routingService, useActiveOrgModule } from '@nikkierp/shell/routing';
import { useMyOrgs } from '@nikkierp/shell/userContext';
import { useServiceLayer } from '@nikkierp/ui/appState/store';
import { FlatSearchableSelect, FlatSearchableSelectProps, SearchableSelectItem } from '@nikkierp/ui/components';
import React, { useMemo } from 'react';

import { sharedStateService } from '../../features/sharedState';


export type OrgSwitchDropdownProps = Pick<FlatSearchableSelectProps, 'dropdownWidth'> & {
	hideIfEmpty: boolean,
};

export function OrgSwitchDropdown(props: OrgSwitchDropdownProps): React.ReactNode {
	const isAuthenticated = useIsAuthenticated();
	const { orgSlug } = useActiveOrgModule();
	const orgs = useMyOrgs();
	const { dispatchMethod: setCurrentOrgId } = useServiceLayer(sharedStateService.setCurrentOrgId);

	const items = useMemo(() => {
		if (!isAuthenticated) return [];
		const options: SearchableSelectItem[] = [];
		options.push(...orgs.map<SearchableSelectItem>((org) => ({
			value: org.slug,
			label: org.display_name,
		})));
		return options;
	}, [orgs, isAuthenticated]);

	// The id is resolved and stored *before* navigating: the new route's data fetches start as
	// soon as it renders, and they read this to scope themselves to the right org.
	const handleOrgChange = (newOrgSlug: string) => {
		const selected = orgs.find(org => org.slug === newOrgSlug);
		setCurrentOrgId(selected?.id ?? null);
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
