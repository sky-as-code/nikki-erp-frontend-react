
import React from 'react';
import { useTranslation } from 'react-i18next';



import { FilterGroup, SearchGraph, useFilterState } from '@/components/FilterGroup';

import { filterConfig } from './filterConfig';




export interface KioskModelFilterProps {
	onSearchGraphChange: (graph: SearchGraph) => void;
}

export const KioskModelFilter: React.FC<KioskModelFilterProps> = ({
	onSearchGraphChange,
}) => {
	const { t: translate } = useTranslation();
	const { state, updateState, resetState } = useFilterState({
		config: filterConfig,
		onSearchGraphChange,
	});

	return (
		<FilterGroup
			config={filterConfig}
			state={state}
			updateState={updateState}
			resetState={resetState}
			placeholder={translate('nikki.vendingMachine.kioskModels.search.placeholder')}
		/>
	);
};

