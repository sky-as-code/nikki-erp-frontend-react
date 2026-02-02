import { Box, Button, Group, Stack, Text } from '@mantine/core';
import { IconFilter } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ConditionTreeView } from './ConditionTreeView';
import { FilterConditionNode, FilterConfig, FilterState } from './types';


export interface FilterSectionProps {
	filterConfig: FilterConfig | FilterConditionNode;
	state: FilterState;
	onFilterChange: (nodeId: string, value: any) => void;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
	filterConfig,
	state,
	onFilterChange,
}) => {
	const { t: translate } = useTranslation();

	if (!filterConfig) return null;

	return (
		<Box>
			<Group gap='xs' mb='xs'>
				<IconFilter size={16} style={{ color: '#e64980' }} />
				<Text size='sm' fw={500}>
					{translate('nikki.general.filter.title')}
				</Text>
			</Group>
			<Stack gap='xs'>
				<ConditionTreeView
					filterConfig={filterConfig}
					filterState={state.filter}
					onFilterChange={onFilterChange}
				/>
				<Button
					variant='subtle'
					size='xs'
					mt='xs'
					onClick={(e) => {
						e.stopPropagation();
						// TODO: Add custom filter
						console.log('Add custom filter');
					}}
				>
					{translate('nikki.general.filter.add_custom')}
				</Button>
			</Stack>
		</Box>
	);
};
