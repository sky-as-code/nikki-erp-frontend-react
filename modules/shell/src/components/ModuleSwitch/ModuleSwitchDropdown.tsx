import { useIsAuthenticated } from '@nikkierp/shell/auth';
import { useMyModules } from '@nikkierp/shell/userContext';
import { navigateToAction, useActiveOrgModule } from '@nikkierp/ui/appState/routingSlice';
import { FlatSearchableSelect, FlatSearchableSelectProps, SearchableSelectItem } from '@nikkierp/ui/components';
import { useMemo } from 'react';
import { useDispatch } from 'react-redux';



export type ModuleSwitchDropdownProps = Pick<FlatSearchableSelectProps, 'dropdownWidth'> & {
	hideIfEmpty: boolean;
};

export function ModuleSwitchDropdown(props: ModuleSwitchDropdownProps): React.ReactNode {
	const dispatch = useDispatch();
	const isAuthenticated = useIsAuthenticated();
	const { orgSlug, moduleSlug } = useActiveOrgModule();
	const modules = useMyModules(orgSlug!);

	const items = useMemo(() => {
		return modules.map<SearchableSelectItem>((mod) => ({
			value: mod.slug,
			label: mod.name,
		}));
	}, [modules]);

	const handleModuleChange = (newModSlug: string) => {
		dispatch(navigateToAction(`/${orgSlug}/${newModSlug}`));
	};

	return isAuthenticated && (modules.length || !props.hideIfEmpty) && (
		<FlatSearchableSelect
			{...props}
			actionOptionLabel='Manage modules...'
			searchPlaceholder='Search module'
			unselectedPlaceholder='Select module'
			dropdownWidth={props.dropdownWidth}
			items={items}
			value={moduleSlug ?? ''}
			onChange={handleModuleChange}
		/>
	);
};
