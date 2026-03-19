/* eslint-disable max-lines-per-function */
import { withWindowTitle } from '@nikkierp/ui/components';
import React from 'react';
import { useParams } from 'react-router';

import { useUnitCategoryDetail } from '../../features/unitCategory/hooks';
import { UnitCategoryDetailForm } from '../../features/unitCategory/components';
import categorySchema from '../../schemas/unit-category-schema.json';

import type { ModelSchema } from '@nikkierp/ui/model';
import { PageContainer } from '../../components/PageContainer';


const CATEGORY_SCHEMA = categorySchema as ModelSchema;

export const UnitCategoryDetailPageBody: React.FC = () => {
	const { categoryId } = useParams<{ categoryId?: string }>();
	const {
		isLoading,
		category,
		handleGoBack,
		onSave,
		onDelete,
	} = useUnitCategoryDetail({ categoryId });

	return (
		<PageContainer>
			<UnitCategoryDetailForm
				schema={CATEGORY_SCHEMA}
				category={category}
				isLoading={isLoading}
				onSave={onSave}
				onDelete={onDelete}
				onGoBack={handleGoBack}
			/>
		</PageContainer>
	);
};

export const UnitCategoryDetailPage = withWindowTitle('Unit Category Details',UnitCategoryDetailPageBody);
