import { Box, Group, Select, Stack, Text } from '@mantine/core';
import { IconSortAscending } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { SearchOrder, SortConfig } from './types';


export interface SortSectionProps {
	sortConfigs: SortConfig[];
	sortState: SearchOrder[];
	onSortChange: (node: SearchOrder | null) => void;
}

export const SortSection: React.FC<SortSectionProps> = ({
	sortConfigs,
	sortState,
	onSortChange,
}) => {
	const { t: translate } = useTranslation();

	if (!sortConfigs || sortConfigs.length === 0) return null;

	return (
		<Box>
			<Group gap='xs' mb='xs'>
				<IconSortAscending size={16} style={{ color: '#339af0' }} />
				<Text size='sm' fw={500}>
					{translate('nikki.general.sort.title')}
				</Text>
			</Group>
			<Stack gap='xs'>
				{sortConfigs.map((sortConfig) => {
					const sortValue = sortState.find((s) => s.field === sortConfig.key);
					return (
						<Group key={sortConfig.key} gap='xs' align='flex-end'>
							<Box
								onMouseDown={(e) => e.stopPropagation()}
								style={{ flex: 1 }}
							>
								<Select
									placeholder={sortConfig.label}
									data={[
										{ value: 'asc', label: translate('nikki.general.sort.asc') },
										{ value: 'desc', label: translate('nikki.general.sort.desc') },
									]}
									value={sortValue?.direction || null}
									onChange={(value) => {
										if (value) {
											onSortChange({
												field: sortConfig.key,
												direction: value as SearchOrder['direction']},
											);
										}
										else {
											onSortChange(null);
										}
									}}
									size='sm'
									style={{ width: '100%' }}
									clearable
								/>
							</Box>
						</Group>
					);
				})}
			</Stack>
		</Box>
	);
};
