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
	const breadcrumbs = [
		{ title: 'Inventory', href: '../overview' },
		{ title: 'Units', href: '../units' },
		{ title: 'Create Unit', href: '#' },
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
			<UnitCreateForm
				schema={unitSchema as ModelSchema}
				unitCategories={unitCategories}
				isSubmitting={isSubmitting}
				onSubmit={onSubmit}
			/>
		</PageContainer>
	);
};

export const UnitCreatePage = withWindowTitle('Create Unit', UnitCreatePageBody);
