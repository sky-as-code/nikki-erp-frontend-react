import { withWindowTitle } from '@nikkierp/ui/components';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ControlPanelAction } from '../../components/ControlPanel';
import { PageContainer } from '../../components/PageContainer';
import {
	useUnitCategoryCreateHandlers,
} from '../../features/unitCategory/hooks';
import { UnitCategoryCreateForm } from '../../features/unitCategory/components';
import categorySchema from '../../schemas/unit-category-schema.json';

import type { ModelSchema } from '@nikkierp/ui/model';

export const UnitCategoryCreatePageBody: React.FC = () => {
	const { t } = useTranslation();
	const {
		isSubmitting,
		onSubmit,
		handleGoBack,
	} = useUnitCategoryCreateHandlers();
	const breadcrumbs = [
		{ title: t('nikki.inventory.breadcrumbs.home'), href: '../overview' },
		{ title: t('nikki.inventory.menu.unitCategories'), href: '../unit-categories' },
		{ title: t('nikki.inventory.breadcrumbs.createUnitCategory'), href: '#' },
	];

	return (
		<PageContainer
			breadcrumbs={breadcrumbs}
			sections={[
				<ControlPanelAction
					actions={[
						{ label: t('nikki.general.actions.create'), type: 'submit', form: 'unit-category-create-form'},
						{ label: t('nikki.general.actions.cancel'), variant: 'outline', onClick: handleGoBack },
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
