import { withWindowTitle } from '@nikkierp/ui/components';
import React from 'react';
import { useParams } from 'react-router';
import { DetailActionBar } from '../../components/ActionBar/DetailActionBar';

import { PageContainer } from '../../components/PageContainer';
import { useUnitDetail } from '../../features/unit/hooks';
import { UnitDetailForm } from '../../features/unit/components';
import unitSchema from '../../schemas/unit-schema.json';

import type { ModelSchema } from '@nikkierp/ui/model';

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

	return (
		<PageContainer>
			<UnitDetailForm
				schema={ unitSchema as ModelSchema}
				unit={unit}
				units={units}
				unitCategories={categoryOptions}
				isLoading={isLoading}
				isSubmitting={isSubmitting}
				onSave={onSave}
				onDelete={onDelete}
				onGoBack={handleGoBack}
			/>
		</PageContainer>
	);
};

export const UnitDetailPage = withWindowTitle('Unit Details', UnitDetailPageBody);
