import { useIsAuthenticated } from '@nikkierp/shell/authenticate';
import { useListAllModules } from '@nikkierp/shell/erpModules';
import { actions as routingActions, useActiveOrgModule } from '@nikkierp/ui/appState/routingSlice';
import { FlatSearchableSelect, FlatSearchableSelectProps, SearchableSelectItem } from '@nikkierp/ui/components';
import { useTranslate } from '@nikkierp/ui/i18n';
import { useMemo } from 'react';
import { useDispatch } from 'react-redux';


export type ModuleSwitchDropdownProps = Pick<FlatSearchableSelectProps, 'dropdownWidth'> & {
	hideIfEmpty: boolean;
};

export function ModuleSwitchDropdown(props: ModuleSwitchDropdownProps): React.ReactNode {
	const dispatch = useDispatch();
	const t = useTranslate('common');
	const isAuthenticated = useIsAuthenticated();
	const listAllModules = useListAllModules();
	const modules = listAllModules.data?.items ?? [];
	const { orgSlug, moduleSlug } = useActiveOrgModule();

	const items = useMemo(() => {
		return modules.map<SearchableSelectItem>((mod) => ({
			value: mod.name,
			label: t(`module.label.${mod.name}`),
		}));
	}, [modules]);

	const handleModuleChange = (newModSlug: string) => {
		dispatch(routingActions.navigateTo({ to: `/${orgSlug}/${newModSlug}` }));
	};

	return isAuthenticated && (modules.length || !props.hideIfEmpty) && (
		<FlatSearchableSelect
			{...props}
			actionOptionLabel={t('module.manageModules')}
			searchPlaceholder={t('module.filterModules')}
			unselectedPlaceholder={t('module.selectModule')}
			dropdownWidth={props.dropdownWidth}
			items={items}
			value={moduleSlug ?? ''}
			onChange={handleModuleChange}
		/>
	);
};
