import { withWindowTitle } from '@nikkierp/ui/components';
import React from 'react';
import { useParams } from 'react-router';

import { DetailControlPanel } from '../../components/ControlPanel';

import { PageContainer } from '../../components/PageContainer';
import { useUnitDetail } from '../../features/unit/hooks';
import { UnitDetailForm } from '../../features/unit/components';
import unitSchema from '../../schemas/unit-schema.json';

import type { ModelSchema } from '@nikkierp/ui/model';
import { JsonToString } from '../../utils/serializer';

export const UnitDetailPageBody: React.FC = () => {
	const { unitId } = useParams<{ unitId?: string }>();
	const {
		isLoading,
		isSubmitting,
		unit,
		units,
		categoryOptions,
		handleGoBack,
		onSave,
		onDelete,
	} = useUnitDetail({ unitId });

	const breadcrumbs = [
		{ title: 'Inventory', href: '../overview' },
		{ title: 'Units', href: '../units' },
		{ title: unit?.name ? JsonToString(unit.name) : 'Unit Details', href: '#' },
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
			<UnitDetailForm
				schema={unitSchema as ModelSchema}
				unit={unit}
				units={units}
				unitCategories={categoryOptions}
				isLoading={isLoading}
				isSubmitting={isSubmitting}
				onSave={onSave}
			/>
		</PageContainer>
	);
};

export const UnitDetailPage = withWindowTitle('Unit Details', UnitDetailPageBody);
