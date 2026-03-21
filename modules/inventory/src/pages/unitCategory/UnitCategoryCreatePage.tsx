import {
	Group,
	Stack,
	Text,
	Title,
} from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import React from 'react';

import { ControlPanelAction } from '../../components/ControlPanel';
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
	const breadcrumbs = [
		{ title: 'Inventory', href: '../overview' },
		{ title: 'Unit Categories', href: '../unit-categories' },
		{ title: 'Create Unit Category', href: '#' },
	];

	return (
		<PageContainer
			breadcrumbs={breadcrumbs}
			sections={[
				<ControlPanelAction
					actions={[
						{ label: 'Create', type: 'submit'},
						{ label: 'Cancel', variant: 'outline', onClick: handleGoBack },
					]}
				/>,
			]}
		>
			<UnitCategoryCreateForm
				schema={categorySchema as ModelSchema}
				isSubmitting={isSubmitting}
				onSubmit={onSubmit}
			/>
		</PageContainer>
	);
};

export const UnitCategoryCreatePage = withWindowTitle('Create Unit Category',UnitCategoryCreatePageBody);
