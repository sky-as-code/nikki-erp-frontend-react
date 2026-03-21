/* eslint-disable max-lines-per-function */
import {
	Stack,
} from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

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
	const listAttribute = useMicroAppSelector(selectAttributeList);
	const { handleCreate, handleRefresh } = useAttributeListHandlers();

	const attributes = (listAttribute.data ?? []) as Attribute[];
	const isLoadingList = listAttribute.status === 'pending';
	const breadcrumbs = [
		{ title: 'Inventory', href: '../overview' },
		{ title: 'Attributes', href: '#' },
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
						{ label: 'Create', onClick: handleCreate },
						{ label: 'Refresh', onClick: handleRefresh, variant: 'outline' },
					]}
					search={{
						value: searchValue,
						onChange: setSearchValue,
						placeholder: 'Search by code name, display name, data type',
					}}
				/>,
			]}
		>
			<Stack gap='md'>
				<AttributeTable
					attributes={pagedAttributes}
					emptyMessage={isLoadingList ? 'Loading attributes...' : emptyMessage}
				/>
			</Stack>
		</PageContainer>
	);
}

export const AttributeListPage: React.FC = withWindowTitle('Attribute List', AttributeListPageBody);