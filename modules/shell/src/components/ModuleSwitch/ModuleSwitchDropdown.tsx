import { useIsAuthenticated } from '@nikkierp/shell/authenticate';
import { moduleService, SearchModuleResponse } from '@nikkierp/shell/erpModules';
import { routingService, useActiveOrgModule } from '@nikkierp/shell/routing';
import { useServiceLayer } from '@nikkierp/ui/appState/store';
import { FlatSearchableSelect, FlatSearchableSelectProps, SearchableSelectItem } from '@nikkierp/ui/components';
import { useTranslate } from '@nikkierp/ui/i18n';
import { useMemo } from 'react';

import { sharedStateService } from '../../features/sharedState';


export type ModuleSwitchDropdownProps = Pick<FlatSearchableSelectProps, 'dropdownWidth'> & {
	hideIfEmpty: boolean,
};

export function ModuleSwitchDropdown(props: ModuleSwitchDropdownProps): React.ReactNode {
	const t = useTranslate('common');
	const isAuthenticated = useIsAuthenticated();
	// Read-only: `ShellRoutes` is what dispatches `listAll`, so this reflects that result.
	const { data } = useServiceLayer<SearchModuleResponse>(moduleService.listAll);
	const modules = data?.items ?? [];
	const { orgSlug, moduleSlug } = useActiveOrgModule();
	const { dispatchMethod: setCurrentModule } = useServiceLayer(sharedStateService.setCurrentModule);

	const items = useMemo(() => {
		return modules.map<SearchableSelectItem>((mod) => ({
			value: mod.name,
			label: t(`module.label.${mod.name}`),
		}));
	}, [modules]);

	// Stored before navigating, for the same reason as the org switcher.
	const handleModuleChange = (newModSlug: string) => {
		setCurrentModule(newModSlug);
		void routingService.navigateTo({ to: `/${orgSlug}/${newModSlug}` });
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
