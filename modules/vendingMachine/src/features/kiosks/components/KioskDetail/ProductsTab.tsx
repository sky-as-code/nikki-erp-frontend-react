import { Center, Group, SegmentedControl, Stack } from '@mantine/core';
import { IconLayoutGrid, IconList } from '@tabler/icons-react';
import React, { useState } from 'react';

import { ProductGridView } from './ProductGridView';
import { ProductListView } from './ProductListView';


interface ProductsTabProps {
	kioskId: string;
}

export const ProductsTab: React.FC<ProductsTabProps> = ({ kioskId }) => {
	const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

	return (
		<Stack gap='sm'>
			<Group justify='space-between'>
				<div></div>
				<SegmentedControl
					value={viewMode}
					onChange={(value) => setViewMode(value as 'list' | 'grid')}
					data={[
						{ label: <Center h={20}><IconLayoutGrid size={16} /></Center>, value: 'grid' },
						{ label: <Center h={20}><IconList size={16} /></Center>, value: 'list' },
					]}
				/>
			</Group>

			{viewMode === 'list' ? (
				<ProductListView kioskId={kioskId} />
			) : (
				<ProductGridView kioskId={kioskId} />
			)}
		</Stack>
	);
};
