import { useIsAuthenticated } from '@nikkierp/shell/auth';
import { GLOBAL_CONTEXT_SLUG } from '@nikkierp/shell/constants';
import { useHasDomainAccess, useMyOrgs } from '@nikkierp/shell/userContext';
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
	const hasDomainAccess = useHasDomainAccess();

	const items = useMemo(() => {
		if (!isAuthenticated) return [];
		const options: SearchableSelectItem[] = [];
		if (hasDomainAccess) {
			options.push({
				value: GLOBAL_CONTEXT_SLUG,
				label: 'Global',
			});
		}
		options.push(...orgs.map<SearchableSelectItem>((org) => ({
			value: org.slug,
			label: org.name,
		})));
		return options;
	}, [orgs, isAuthenticated, hasDomainAccess]);

	const handleOrgChange = (newOrgSlug: string) => {
		if (newOrgSlug === GLOBAL_CONTEXT_SLUG) {
			dispatch(navigateToAction(`/${GLOBAL_CONTEXT_SLUG}`));
			return;
		}
		dispatch(navigateToAction(`/${newOrgSlug}`));
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
