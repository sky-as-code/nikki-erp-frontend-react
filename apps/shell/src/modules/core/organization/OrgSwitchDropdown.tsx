'use client';

import { SearchableSelect, SearchableSelectProps } from '@components/SearchableSelect';
import React from 'react';

import { useTenant } from '@/common/context/TenantProvider';

type OrgSwitchDropdownProps = SearchableSelectProps;

export const OrgSwitchDropdown: React.FC<OrgSwitchDropdownProps> = (props) => {
	const { org, setOrg } = useTenant();

	const handleOrgChange = (orgSlug: string) => {
		setOrg(orgSlug);
	};

	return (
		<SearchableSelect
			{...props}
			value={org}
			onChange={handleOrgChange}
		/>
	);
};
