import { FlatSearchableSelect, FlatSearchableSelectProps, SearchableSelectItem } from '@nikkierp/ui/components';
import React, { useMemo } from 'react';


import { useConfig } from '@/context/ClientConfigProvider';
import { useTenantUrl } from '@/modules/core/context/TenantUrlProvider';


export type OrgSwitchDropdownProps = Pick<FlatSearchableSelectProps, 'dropdownWidth'>;

export const OrgSwitchDropdown: React.FC<OrgSwitchDropdownProps> = (props) => {
	const { userSettings } = useConfig();
	const { orgSlug, redirectToOrg } = useTenantUrl();

	const items = useMemo(() => {
		if (!userSettings?.orgs) return [];
		return userSettings.orgs.map<SearchableSelectItem>((org) => ({
			value: org.slug,
			label: org.name,
		}));
	}, [userSettings?.orgs]);

	const handleOrgChange = (orgSlug: string) => {
		redirectToOrg(orgSlug);
	};

	return (
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
			value={orgSlug}
			onChange={handleOrgChange}
		/>
	);
};
