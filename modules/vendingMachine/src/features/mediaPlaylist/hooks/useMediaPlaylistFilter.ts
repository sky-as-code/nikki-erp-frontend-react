import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ControlPanelFilterConfig } from '@/components/ControlPanel/types';
import { buildSimpleSearchGraph } from '@/helpers';
import { ArchivedStatus } from '@/types';


export function useMediaPlaylistFilter() {
	const { t: translate } = useTranslation();
	const [searchValue, setSearchValue] = useState('');
	const [statusFilter, setStatusFilter] = useState<ArchivedStatus[]>([ArchivedStatus.ACTIVE]);

	const filters: ControlPanelFilterConfig[] = useMemo(
		() => [
			{
				key: 'search',
				searchFields: ['name', 'scopeRef'],
				type: 'search' as const,
				value: searchValue,
				onChange: setSearchValue,
				placeholder: translate('nikki.vendingMachine.mediaPlaylist.search.placeholder'),
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
				placeholder: translate('nikki.vendingMachine.mediaPlaylist.filter.status'),
				getGraphValue: (value: ArchivedStatus[]) => value.map((v) => v === ArchivedStatus.ARCHIVED),
			},
		],
		[statusFilter, searchValue, translate],
	);

	const graph = useMemo(() => buildSimpleSearchGraph(filters), [filters]);

	return { filters, graph };
}
