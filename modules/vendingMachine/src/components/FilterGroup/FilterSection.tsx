/* eslint-disable max-lines-per-function */
import { Box, Button, Group, MultiSelect, Select, Stack, Text } from '@mantine/core';
import { IconFilter } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { FilterConfig, FilterState } from './types';


export interface FilterSectionProps {
	filterConfigs: FilterConfig[];
	state: FilterState;
	onFilterChange: (key: string, values: (string | number | boolean)[]) => void;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
	filterConfigs,
	state,
	onFilterChange,
}) => {
	const { t: translate } = useTranslation();

	if (!filterConfigs || filterConfigs.length === 0) return null;

	return (
		<Box>
			<Group gap='xs' mb='xs'>
				<IconFilter size={16} style={{ color: '#e64980' }} />
				<Text size='sm' fw={500}>
					{translate('nikki.general.filter.title')}
				</Text>
			</Group>
			<Stack gap='xs'>
				{filterConfigs.map((filterConfig) => {
					const filterValue = state.filter.find((f) => f.key === filterConfig.key);
					const selectedValues = filterValue?.values.map(String) || [];

					if (filterConfig.type === 'select' && filterConfig.options) {
						return (
							<Box
								key={filterConfig.key}
								onMouseDown={(e) => e.stopPropagation()}
							>
								<Select
									label={filterConfig.label}
									placeholder={filterConfig.label}
									data={filterConfig.options}
									value={selectedValues[0] || null}
									onChange={(value) => {
										onFilterChange(
											filterConfig.key,
											value ? [value] : [],
										);
									}}
									size='sm'
									clearable
								/>
							</Box>
						);
					}

					if (filterConfig.type === 'multiselect' && filterConfig.options) {
						return (
							<Box
								key={filterConfig.key}
								onMouseDown={(e) => e.stopPropagation()}
							>
								<MultiSelect
									label={filterConfig.label}
									placeholder={filterConfig.label}
									data={filterConfig.options}
									value={selectedValues}
									onChange={(values) => {
										onFilterChange(
											filterConfig.key,
											values?.map(String) || [],
										);
									}}
									size='sm'
									clearable
								/>
							</Box>
						);
					}

					// Custom component or other types
					if (filterConfig.customComponent) {
						const CustomComponent = filterConfig.customComponent;
						return (
							<CustomComponent
								key={filterConfig.key}
								value={filterValue?.values}
								onChange={(values: (string | number | boolean)[]) => {
									onFilterChange(filterConfig.key, values);
								}}
							/>
						);
					}

					return null;
				})}
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
