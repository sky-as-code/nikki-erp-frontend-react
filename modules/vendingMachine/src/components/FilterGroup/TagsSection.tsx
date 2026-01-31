import { Badge, Box, Button, Group, Text } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
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
							size='sm'
							variant='light'
							color='blue'
							rightSection={
								<IconX
									size={12}
									style={{ cursor: 'pointer', marginLeft: 4 }}
									onClick={(e) => {
										e.stopPropagation();
										tag.onRemove();
									}}
								/>
							}
							style={{
								cursor: 'default',
							}}
						>
							{tag.label}: {Array.isArray(tag.value) ? tag.value.join(' or ') : tag.value}
						</Badge>
					))}
				</Group>
			</Box>
		</Box>
	);
};
