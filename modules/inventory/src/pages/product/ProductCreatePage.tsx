import { Stack, Title } from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import React from 'react';

import { ProductCreateForm } from '../../features/product/components';
import { useProductCreateHandlers } from '../../features/product/hooks/useProductCreate';


export const ProductCreatePageBody: React.FC = () => {
	const { isLoading, units, onSubmit } = useProductCreateHandlers();

	return (
		<Stack gap='md'>
			<Title order={2}>Create Product</Title>
			<ProductCreateForm
				isLoading={isLoading}
				units={units}
				onSubmit={onSubmit}
			/>
		</Stack>
	);
};

export const ProductCreatePage = withWindowTitle('Create Product', ProductCreatePageBody);
