import { useIsAuthenticated } from '@nikkierp/shell/authenticate';
import { routingService, useActiveOrgModule } from '@nikkierp/shell/routing';
import { useMyOrgs } from '@nikkierp/shell/userContext';
import { useServiceLayer } from '@nikkierp/ui/appState/store';
import { FlatSearchableSelect, FlatSearchableSelectProps, SearchableSelectItem } from '@nikkierp/ui/components';
import { useLocaleCollator, useLocalize } from '@nikkierp/ui/i18n';
import React, { useMemo } from 'react';

import { sharedStateService } from '../../features/sharedState';


export type OrgSwitchDropdownProps = Pick<FlatSearchableSelectProps, 'dropdownWidth'> & {
	hideIfEmpty: boolean,
};

export function OrgSwitchDropdown(props: OrgSwitchDropdownProps): React.ReactNode {
	const isAuthenticated = useIsAuthenticated();
	const lc = useLocalize();
	const compareLocalized = useLocaleCollator();
	const { orgSlug } = useActiveOrgModule();
	const orgs = useMyOrgs();
	const { dispatchMethod: setCurrentOrgId } = useServiceLayer(sharedStateService.setCurrentOrgId);

	// display_name is LangJson, so it is localized rather than rendered directly, then sorted by
	// the text that localization produced.
	const items = useMemo(() => {
		if (!isAuthenticated) return [];
		return orgs
			.map<SearchableSelectItem>((org) => ({
				value: org.slug,
				label: lc(org.display_name),
			}))
			.sort((a, b) => compareLocalized(a.label, b.label));
	}, [orgs, isAuthenticated, lc, compareLocalized]);

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
