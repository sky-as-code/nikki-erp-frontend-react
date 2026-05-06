import { withWindowTitle } from '@nikkierp/ui/components';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ControlPanelAction } from '../../components/ControlPanel';
import { PageContainer } from '../../components/PageContainer';
import {
	useUnitCreateHandlers,
} from '../../features/unit/hooks';
import { UnitCreateForm } from '../../features/unit/components';
import unitSchema from '../../schemas/unit-schema.json';

import type { ModelSchema } from '@nikkierp/ui/model';

export const UnitCreatePageBody: React.FC = () => {
	const { t } = useTranslation();
	const {
		unitCategories,
		units,
		isSubmitting,
		onSubmit,
		handleGoBack,
	} = useUnitCreateHandlers();
	const breadcrumbs = [
		{ title: t('nikki.inventory.breadcrumbs.home'), href: '../overview' },
		{ title: t('nikki.inventory.menu.units'), href: '../units' },
		{ title: t('nikki.inventory.breadcrumbs.createUnit'), href: '#' },
	];

	return (
		<PageContainer
			breadcrumbs={breadcrumbs}
			sections={[
				<ControlPanelAction
					actions={[
						{ label: t('nikki.general.actions.create'), type: 'submit' as const, form: 'unit-create-form'},
						{ label: t('nikki.general.actions.cancel'), variant: 'outline', onClick: handleGoBack },						
					]}
				/>,
			]}
		>
			<UnitCreateForm
				schema={unitSchema as ModelSchema}
				unitCategories={unitCategories}
				units={units}
				isSubmitting={isSubmitting}
				onSubmit={onSubmit}
			/>
		</PageContainer>
	);
};

export const UnitCreatePage = withWindowTitle('Create Unit', UnitCreatePageBody);
