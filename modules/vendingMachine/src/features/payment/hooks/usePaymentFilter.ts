import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ControlPanelFilterConfig } from '@/components/ControlPanel/types';
import { buildSimpleSearchGraph } from '@/helpers';
import { ArchivedStatus } from '@/types';


export function usePaymentFilter() {
	const { t: translate } = useTranslation();
	const [searchValue, setSearchValue] = useState('');
	const [statusFilter, setStatusFilter] = useState<ArchivedStatus[]>([ArchivedStatus.ACTIVE]);

	const filters: ControlPanelFilterConfig[] = useMemo(
		() => [
			{
				key: 'search',
				type: 'search',
				value: searchValue,
				onChange: setSearchValue,
				searchFields: ['name', 'method'],
				placeholder: translate('nikki.vendingMachine.payment.search.placeholder'),
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
				placeholder: translate('nikki.vendingMachine.payment.filter.status'),
				getGraphValue: (value: ArchivedStatus[]) => value.map((v) => v === ArchivedStatus.ARCHIVED),
			},
		],
		[statusFilter, searchValue, translate],
	);

	const graph = useMemo(() => buildSimpleSearchGraph(filters), [filters]);

	return { filters, graph };
}
