import {
	Group,
	Stack,
	Text,
	Title,
} from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { selectUnitList } from '../../appState/unit';
import { ControlPanel } from '../../components/ControlPanel';
import { PageContainer } from '../../components/PageContainer';
import { useUnitListHandlers } from '../../features/unit/hooks';
import { UnitTable } from '../../features/unit/components';
import unitSchema from '../../schemas/unit-schema.json';

import type { ModelSchema } from '@nikkierp/ui/model';

const COLUMNS = ['name', 'symbol', 'Base Unit / Multiplier', 'status', 'createdAt'];

export const UnitListPageBody: React.FC = () => {
	const { t } = useTranslation();
	const {
		handleCreate,
		handleRefresh,
		listUnit,
	} = useUnitListHandlers();

	const breadcrumbs = [
		{ title: t('nikki.inventory.breadcrumbs.home'), href: '../overview' },
		{ title: t('nikki.inventory.menu.units'), href: '#' },
	];

	return (
		<PageContainer
			breadcrumbs={breadcrumbs}
			sections={[
				<ControlPanel
					actions={[
						{ label: t('nikki.general.actions.create'), onClick: handleCreate },
						{ label: t('nikki.general.actions.refresh'), onClick: handleRefresh, variant: 'outline' },
					]}
				/>,
			]}
		>
			<UnitTable
				schema={unitSchema as ModelSchema}
				columns={COLUMNS}
				units={listUnit.data}
				isLoading={listUnit.status === 'pending'}
			/>
		</PageContainer>
	);
};

export const UnitListPage = withWindowTitle('Unit Management', UnitListPageBody);
