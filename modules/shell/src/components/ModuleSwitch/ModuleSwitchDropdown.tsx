import { useIsAuthenticated } from '@nikkierp/shell/authenticate';
import { useListAllModules } from '@nikkierp/shell/erpModules';
import { actions as routingActions, useActiveOrgModule } from '@nikkierp/ui/appState/routingSlice';
import { FlatSearchableSelect, FlatSearchableSelectProps, SearchableSelectItem } from '@nikkierp/ui/components';
import { useMemo } from 'react';
import { useDispatch } from 'react-redux';


export type ModuleSwitchDropdownProps = Pick<FlatSearchableSelectProps, 'dropdownWidth'> & {
	hideIfEmpty: boolean;
};

export function ModuleSwitchDropdown(props: ModuleSwitchDropdownProps): React.ReactNode {
	const dispatch = useDispatch();
	const isAuthenticated = useIsAuthenticated();
	const listAllModules = useListAllModules();
	const modules = listAllModules.data?.items ?? [];
	const { orgSlug, moduleSlug } = useActiveOrgModule();

	const items = useMemo(() => {
		return modules.map<SearchableSelectItem>((mod) => ({
			value: mod.name,
			label: mod.name,
		}));
	}, [modules]);

	const handleModuleChange = (newModSlug: string) => {
		dispatch(routingActions.navigateTo(`/${orgSlug}/${newModSlug}`));
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
