import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ControlPanelFilterConfig } from '@/components';

import { type KioskSetting } from '../types';


export const useKioskSettingFilter = (settings: KioskSetting[]) => {
	const { t: translate } = useTranslation();
	const [searchValue, setSearchValue] = useState('');
	const [statusFilter, setStatusFilter] = useState<string[]>([]);

	const filteredSettings = useMemo(() => {
		let filtered = settings || [];

		if (statusFilter.length > 0) {
			filtered = filtered.filter((s: KioskSetting) => statusFilter.includes(s.status));
		}

		if (searchValue.trim()) {
			const searchLower = searchValue.toLowerCase().trim();
			filtered = filtered.filter(
				(s: KioskSetting) =>
					s.code.toLowerCase().includes(searchLower) ||
					s.name.toLowerCase().includes(searchLower),
			) as KioskSetting[];
		}

		return filtered;
	}, [settings, statusFilter, searchValue]);

	const filters: ControlPanelFilterConfig[] = useMemo(() => [
		{
			value: statusFilter,
			onChange: setStatusFilter,
			options: [
				{ value: 'active', label: translate('nikki.general.status.active') },
				{ value: 'inactive', label: translate('nikki.general.status.inactive') },
			],
			placeholder: translate('nikki.vendingMachine.kioskSettings.filter.status'),
		},
	], [statusFilter, translate]);

	return {
		filteredSettings,
		filters,
		searchValue,
		setSearchValue,
	};
};
