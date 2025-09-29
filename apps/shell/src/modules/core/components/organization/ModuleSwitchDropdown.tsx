

import { useMemo } from 'react'


import { FlatSearchableSelect, FlatSearchableSelectProps, SearchableSelectItem } from '@/common/components/SearchableSelect'
import { useConfig } from '@/common/context/ConfigProvider'
import { useTenantUrl } from '@/common/context/TenantUrlProvider'


export type ModuleSwitchDropdownProps = Pick<FlatSearchableSelectProps, 'dropdownWidth'>

export const ModuleSwitchDropdown: React.FC<ModuleSwitchDropdownProps> = (props) => {
	const { redirectToModule } = useTenantUrl()
	const { userSettings, activeModule } = useConfig()

	const items = useMemo(() => {
		if (!userSettings?.modules) return []
		return userSettings?.modules.map<SearchableSelectItem>((mod) => ({
			value: mod.slug,
			label: mod.label,
		}))
	}, [userSettings?.modules])

	const handleModuleChange = (modSlug: string) => {
		redirectToModule(modSlug)
	}

	return (
		<FlatSearchableSelect
			{...props}
			actionOptionLabel='Manage modules...'
			searchPlaceholder='Search module'
			unselectedPlaceholder='Select module'
			targetClass='box-content'
			// targetColor='#000'
			targetFz='h3'
			targetFw='normal'
			targetPb='xs'
			targetPt='xs'
			dropdownWidth={props.dropdownWidth}
			items={items}
			value={activeModule?.slug}
			onChange={handleModuleChange}
		/>
	)
}
