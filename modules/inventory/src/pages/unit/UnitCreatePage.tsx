import {
	Stack,
	Title,
} from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import React from 'react';

import { PageContainer } from '../../components/PageContainer';
import {
	useUnitCreateHandlers,
} from '../../features/unit/hooks';
import { UnitCreateForm } from '../../features/unit/components';
import unitSchema from '../../schemas/unit-schema.json';

import type { ModelSchema } from '@nikkierp/ui/model';

export const UnitCreatePageBody: React.FC = () => {
	const {
		unitCategories,
		isSubmitting,
		onSubmit,
		handleGoBack,
	} = useUnitCreateHandlers();

	return (
		<PageContainer>
			<Stack gap='md'>
				<Title order={2}>Create Unit</Title>
				<UnitCreateForm
					schema={unitSchema as ModelSchema}
					unitCategories={unitCategories}
					isSubmitting={isSubmitting}
					onSubmit={onSubmit}
					onCancel={handleGoBack}
				/>
			</Stack>
		</PageContainer>
	);
};

export const UnitCreatePage = withWindowTitle('Create Unit', UnitCreatePageBody);
