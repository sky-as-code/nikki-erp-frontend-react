import { Breadcrumbs, Group, Paper, SegmentedControl, Stack, TagsInput, Typography } from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppSelector } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { selectHierarchyState, selectUserState } from '../../appState';
import { ListActionListPage } from '../../components/ListActionBar';
import { HierarchyTable, HierarchyOrgChart } from '../../features/hierarchy/components';
import { useHierarchyListHandlers } from '../../features/hierarchy/hooks';
import hierarchySchema from '../../schemas/hierarchy-schema.json';


export function HierarchyListPageBody(): React.ReactNode {
	const { hierarchies, isLoading } = useMicroAppSelector(selectHierarchyState);
	const { users } = useMicroAppSelector(selectUserState);
	const schema = hierarchySchema as ModelSchema;
	const columns = ['id', 'name', 'createdAt', 'updatedAt'];
	const [view, setView] = React.useState<'table' | 'orgChart'>('table');
	const { t } = useTranslation();

	const { handleCreate, handleRefresh } = useHierarchyListHandlers();

	return (
		<Stack gap='md'>
			<Group>
				<Breadcrumbs style={{ minWidth: '30%' }}>
					<Typography>
						<h4>{t('nikki.identity.hierarchy.title')}</h4>
					</Typography>
				</Breadcrumbs>
				<TagsInput
					placeholder={t('nikki.identity.hierarchy.searchPlaceholder')}
					w='500px'
				/>
			</Group>
			<Group justify='space-between'>
				<ListActionListPage
					onCreate={handleCreate}
					onRefresh={handleRefresh}
				/>
				<SegmentedControl
					value={view}
					onChange={(value) => setView(value as 'table' | 'orgChart')}
					data={[
						{ label: 'Table', value: 'table' },
						{ label: 'Org Chart', value: 'orgChart' },
					]}
				/>
			</Group>

			{view === 'table' ? (
				<HierarchyTable
					columns={columns}
					hierarchies={hierarchies}
					isLoading={isLoading}
					schema={schema}
				/>
			) : (
				<Paper withBorder>
					<HierarchyOrgChart
						hierarchies={hierarchies}
						usersByHierarchy={users}
					/>
				</Paper>
			)}
		</Stack>
	);
}

export const HierarchyListPage: React.FC = withWindowTitle('Hierarchy List', HierarchyListPageBody);
