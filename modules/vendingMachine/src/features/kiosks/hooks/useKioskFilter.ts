import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';


import { KioskMode, KioskStatus } from '../types';

import { ControlPanelFilterConfig } from '@/components';
import { buildSimpleSearchGraph } from '@/components/ControlPanel/buildSimpleSearchGraph';




// eslint-disable-next-line max-lines-per-function
export function useKioskFilter() {
	const { t: translate } = useTranslation();
	const [searchValue, setSearchValue] = useState('');
	const [statusFilter, setStatusFilter] = useState<string[]>([]);
	// const [connectionFilter, setConnectionFilter] = useState<string[]>([]);
	const [modeFilter, setModeFilter] = useState<string[]>([]);

	const filters: ControlPanelFilterConfig[] = useMemo(() => [
		{
			key: 'search',
			searchFields: ['code', 'name'],
			type: 'search' as const,
			value: searchValue,
			onChange: setSearchValue,
			placeholder: translate('nikki.vendingMachine.kiosk.search.placeholder'),
		},
		{
			key: 'status',
			type: 'multiSelect' as const,
			value: statusFilter,
			onChange: setStatusFilter,
			options: [
				{ value: KioskStatus.ACTIVE, label: translate('nikki.general.status.active') },
				{ value: KioskStatus.INACTIVE, label: translate('nikki.general.status.inactive') },
				{ value: KioskStatus.DELETED, label: translate('nikki.general.status.deleted') },
			],
			placeholder: translate('nikki.vendingMachine.kiosk.filter.status'),
		},
		// {
		// 	key: 'connection',
		// 	type: 'multiSelect' as const,
		// 	value: connectionFilter,
		// 	onChange: (value: string[]) => setConnectionFilter(value),
		// 	options: [
		// 		{ value: ConnectionStatus.FAST, label: translate('nikki.vendingMachine.kiosk.connectionStatus.fast') },
		// 		{ value: ConnectionStatus.SLOW, label: translate('nikki.vendingMachine.kiosk.connectionStatus.slow') },
		// 		{ value: ConnectionStatus.DISCONNECTED, label: translate('nikki.vendingMachine.kiosk.connectionStatus.disconnected') },
		// 	],
		// 	placeholder: translate('nikki.vendingMachine.kiosk.filter.connection'),
		// },
		{
			key: 'mode',
			type: 'multiSelect' as const,
			value: modeFilter,
			onChange: (value: string[]) => setModeFilter(value),
			options: [
				{ value: KioskMode.PENDING, label: translate('nikki.vendingMachine.kiosk.mode.pending') },
				{ value: KioskMode.SELLING, label: translate('nikki.vendingMachine.kiosk.mode.selling') },
				{ value: KioskMode.SLIDESHOW_ONLY, label: translate('nikki.vendingMachine.kiosk.mode.slideshowOnly') },
			],
			placeholder: translate('nikki.vendingMachine.kiosk.filter.mode'),
		},
	], [searchValue, statusFilter, modeFilter, translate]);

	const graph = useMemo(
		() => buildSimpleSearchGraph(
			filters.map(filter => {
				if (filter.type === 'search') {
					return {
						key: filter.key,
						searchFields: filter.searchFields,
						type: filter.type,
						value: filter.value,
					};
				}
				return {
					key: filter.key,
					type: filter.type,
					value: filter.value,
				};
			}),
		), [filters],
	);

	return { filters, graph };
};
