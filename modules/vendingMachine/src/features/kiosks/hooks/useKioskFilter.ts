import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ControlPanelFilterConfig } from '@/components';

import { type Kiosk } from '../types';
import { ConnectionStatus, KioskMode } from '../types';


export const useKioskFilter = (kiosks: Kiosk[]) => {
	const { t: translate } = useTranslation();
	const [searchValue, setSearchValue] = useState('');
	const [statusFilter, setStatusFilter] = useState<string[]>([]);
	const [connectionFilter, setConnectionFilter] = useState<ConnectionStatus[]>([]);
	const [modeFilter, setModeFilter] = useState<KioskMode[]>([]);

	const filteredKiosks = useMemo(() => {
		let filtered = kiosks || [];

		if (statusFilter.length > 0) {
			filtered = filtered.filter((k: Kiosk) => {
				const isActive = statusFilter.includes('active');
				const isInactive = statusFilter.includes('inactive');
				if (isActive && isInactive) return true;
				if (isActive) return k.isActive;
				if (isInactive) return !k.isActive;
				return true;
			});
		}

		if (connectionFilter.length > 0) {
			filtered = filtered.filter((k: Kiosk) => connectionFilter.includes(k.connectionStatus));
		}

		if (modeFilter.length > 0) {
			filtered = filtered.filter((k: Kiosk) => modeFilter.includes(k.mode));
		}

		if (searchValue.trim()) {
			const searchLower = searchValue.toLowerCase().trim();
			filtered = filtered.filter(
				(k: Kiosk) =>
					k.code.toLowerCase().includes(searchLower) ||
					k.name.toLowerCase().includes(searchLower),
			) as Kiosk[];
		}

		return filtered;
	}, [kiosks, statusFilter, connectionFilter, modeFilter, searchValue]);

	const filters: ControlPanelFilterConfig[] = useMemo(() => [
		{
			value: statusFilter,
			onChange: setStatusFilter,
			options: [
				{ value: 'active', label: translate('nikki.general.status.active') },
				{ value: 'inactive', label: translate('nikki.general.status.inactive') },
			],
		},
		{
			value: connectionFilter,
			onChange: (value: string[]) => setConnectionFilter(value as ConnectionStatus[]),
			options: [
				{ value: 'fast', label: translate('nikki.vendingMachine.kiosk.connectionStatus.fast') },
				{ value: 'slow', label: translate('nikki.vendingMachine.kiosk.connectionStatus.slow') },
				{ value: 'disconnected', label: translate('nikki.vendingMachine.kiosk.connectionStatus.disconnected') },
			],
		},
		{
			value: modeFilter,
			onChange: (value: string[]) => setModeFilter(value as KioskMode[]),
			options: [
				{ value: KioskMode.PENDING, label: translate('nikki.vendingMachine.kiosk.mode.pending') },
				{ value: KioskMode.SELLING, label: translate('nikki.vendingMachine.kiosk.mode.selling') },
				{ value: KioskMode.SLIDESHOWONLY, label: translate('nikki.vendingMachine.kiosk.mode.slideshowOnly') },
			],
		},
	], [statusFilter, connectionFilter, modeFilter, translate]);

	return {
		filteredKiosks,
		filters,
		searchValue,
		setSearchValue,
	};
};
