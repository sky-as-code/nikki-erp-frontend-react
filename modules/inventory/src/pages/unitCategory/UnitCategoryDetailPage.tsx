/* eslint-disable max-lines-per-function */
import { withWindowTitle } from '@nikkierp/ui/components';
import React from 'react';
import { useParams } from 'react-router';

import { DetailControlPanel } from '../../components/ControlPanel';
import { useUnitCategoryDetail } from '../../features/unitCategory/hooks';
import { UnitCategoryDetailForm } from '../../features/unitCategory/components';
import categorySchema from '../../schemas/unit-category-schema.json';

import type { ModelSchema } from '@nikkierp/ui/model';
import { PageContainer } from '../../components/PageContainer';
import { JsonToString } from '../../utils/serializer';

export const UnitCategoryDetailPageBody: React.FC = () => {
	const { categoryId } = useParams<{ categoryId?: string }>();
	const {
		isLoading,
		category,
		handleGoBack,
		onSave,
		onDelete,
	} = useUnitCategoryDetail({ categoryId });

	const breadcrumbs = [
		{ title: 'Inventory', href: '../overview' },
		{ title: 'Unit Categories', href: '../unit-categories' },
		{ title: category?.name ? JsonToString(category.name) : 'Unit Category Details', href: '#' },
	];

	return (
		<PageContainer
			breadcrumbs={breadcrumbs}
			sections={[
				<DetailControlPanel
					onSave={() => onSave}
					onGoBack={handleGoBack}
					onDelete={() => void onDelete()}
				/>,
			]}
		>
			<UnitCategoryDetailForm
				schema={categorySchema as ModelSchema}
				category={category}
				isLoading={isLoading}
				onSave={onSave}
			/>
		</PageContainer>
	);
};

export const UnitCategoryDetailPage = withWindowTitle('Unit Category Details',UnitCategoryDetailPageBody);
