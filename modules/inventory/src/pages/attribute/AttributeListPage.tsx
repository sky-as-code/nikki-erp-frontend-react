/* eslint-disable max-lines-per-function */
import {
	Stack,
} from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { selectAttributeList } from '../../appState/attribute';
import { ControlPanel } from '../../components/ControlPanel';
import { PageContainer } from '../../components/PageContainer';
import { AttributeTable } from '../../features/attribute/components';
import {
	useAttributeListHandlers,
	useAttributeListView,
} from '../../features/attribute/hooks';

import type { Attribute } from '../../features/attribute/types';


export function AttributeListPageBody(): React.ReactNode {
	const { t } = useTranslation();
	const listAttribute = useMicroAppSelector(selectAttributeList);
	const { handleCreate, handleRefresh } = useAttributeListHandlers();

	const attributes = (listAttribute.data ?? []) as Attribute[];
	const isLoadingList = listAttribute.status === 'pending';
	const breadcrumbs = [
		{ title: t('nikki.inventory.breadcrumbs.home'), href: '../overview' },
		{ title: t('nikki.inventory.menu.attributes'), href: '#' },
	];

	const {
		searchValue,
		setSearchValue,
		pagedAttributes,
		emptyMessage,
	} = useAttributeListView(attributes);

	return (
		<PageContainer
			breadcrumbs={breadcrumbs}
			sections={[
				<ControlPanel
					actions={[
						{ label: t('nikki.general.actions.create'), onClick: handleCreate },
						{ label: t('nikki.general.actions.refresh'), onClick: handleRefresh, variant: 'outline' },
					]}
					search={{
						value: searchValue,
						onChange: setSearchValue,
						placeholder: t('nikki.inventory.attribute.searchPlaceholder'),
					}}
				/>,
			]}
		>
			<Stack gap='md'>
				<AttributeTable
					attributes={pagedAttributes}
					emptyMessage={isLoadingList ? t('nikki.inventory.attribute.list.loading') : emptyMessage}
				/>
			</Stack>
		</PageContainer>
	);
}

export const AttributeListPage: React.FC = withWindowTitle('Attribute List', AttributeListPageBody);