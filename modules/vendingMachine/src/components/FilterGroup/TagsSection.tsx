import { Badge, Box, Button, Group, Text } from '@mantine/core';
import { IconBinaryTree, IconFilter, IconSearch, IconSortAscending, IconX } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { FilterTag } from './types';


export interface TagsSectionProps {
	tags: FilterTag[];
	onClearAll: () => void;
}

export const TagsSection: React.FC<TagsSectionProps> = ({ tags, onClearAll }) => {
	const { t: translate } = useTranslation();

	if (tags.length === 0) return null;

	const TagIconMapping: Record<FilterTag['type'], React.ReactNode> = {
		search: <IconSearch size={12} />,
		filter: <IconFilter size={12} />,
		sort: <IconSortAscending size={12} />,
		groupBy: <IconBinaryTree size={12} />,
	};

	return (
		<Box>
			<Group justify='space-between' mb='xs' align='center'>
				<Text size='sm' fw={500}>
					{translate('nikki.general.filter.active_filters') || 'Active Filters'}
				</Text>
				<Button
					variant='subtle'
					size='xs'
					color='red'
					onClick={(e) => {
						e.stopPropagation();
						onClearAll();
					}}
				>
					{translate('nikki.general.actions.clear_filters')}
				</Button>
			</Group>
			<Box
				style={{
					maxHeight: 120,
					overflowY: 'auto',
					overflowX: 'hidden',
				}}
			>
				<Group gap='xs' wrap='wrap'>
					{tags.map((tag, index) => (
						<Badge
							key={`${tag.type}-${tag.key}-${index}`}
							size='lg'
							variant='filled'
							color='blue'
							w='max-content'
							maw={200}
							leftSection={TagIconMapping[tag.type]}
							style={{textTransform: 'initial'}}
							fz={'sm'}
							fw={'normal'}
							rightSection={
								<IconX
									size={12}
									style={{ cursor: 'pointer', marginLeft: 4 }}
									onClick={(e) => {
										e.stopPropagation();
										tag?.onRemove();
									}}
								/>
							}
						>
							{tag.value}
						</Badge>
					))}
				</Group>
			</Box>
		</Box>
	);
};


