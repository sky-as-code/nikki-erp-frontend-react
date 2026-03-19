import {
	Stack,
	Title,
} from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import React from 'react';

import { PageContainer } from '../../components/PageContainer';
import {
	useUnitCategoryCreateHandlers,
} from '../../features/unitCategory/hooks';
import { UnitCategoryCreateForm } from '../../features/unitCategory/components';
import categorySchema from '../../schemas/unit-category-schema.json';

import type { ModelSchema } from '@nikkierp/ui/model';

export const UnitCategoryCreatePageBody: React.FC = () => {
	const {
		isSubmitting,
		onSubmit,
		handleGoBack,
	} = useUnitCategoryCreateHandlers();

	return (
		<PageContainer>
			<Stack gap='md'>
				<Title order={2}>Create Unit Category</Title>
				<UnitCategoryCreateForm
					schema={categorySchema as ModelSchema}
					isSubmitting={isSubmitting}
					onSubmit={onSubmit}
					onCancel={handleGoBack}
				/>
			</Stack>
		</PageContainer>
	);
};

export const UnitCategoryCreatePage = withWindowTitle('Create Unit Category',UnitCategoryCreatePageBody);
