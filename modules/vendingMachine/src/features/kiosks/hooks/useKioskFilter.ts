import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ControlPanelFilterConfig } from '@/components';
import { buildSimpleSearchGraph } from '@/helpers';
import { ArchivedStatus } from '@/types';

import { KioskMode } from '../types';


export function useKioskFilter() {
	const { t: translate } = useTranslation();
	const [searchValue, setSearchValue] = useState('');
	const [statusFilter, setStatusFilter] = useState<ArchivedStatus[]>([ArchivedStatus.ACTIVE]);
	const [modeFilter, setModeFilter] = useState<KioskMode[]>([]);

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
			key: 'isArchived',
			type: 'multiSelect' as const,
			value: statusFilter,
			onChange: setStatusFilter,
			options: [
				{ value: ArchivedStatus.ACTIVE, label: translate('nikki.general.status.active') },
				{ value: ArchivedStatus.ARCHIVED, label: translate('nikki.general.status.archived') },
			],
			placeholder: translate('nikki.vendingMachine.kiosk.filter.status'),
			getGraphValue: (value: ArchivedStatus[]) => value.map((v) => v === ArchivedStatus.ARCHIVED),
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
			onChange: setModeFilter,
			options: [
				{ value: KioskMode.PENDING, label: translate('nikki.vendingMachine.kiosk.mode.pending') },
				{ value: KioskMode.SELLING, label: translate('nikki.vendingMachine.kiosk.mode.selling') },
				{ value: KioskMode.SLIDESHOW_ONLY, label: translate('nikki.vendingMachine.kiosk.mode.slideshowOnly') },
			],
			placeholder: translate('nikki.vendingMachine.kiosk.filter.mode'),
		},
	], [searchValue, statusFilter, modeFilter, translate]);

	const graph = useMemo( () => buildSimpleSearchGraph(filters), [filters]);

	return { filters, graph };
}
