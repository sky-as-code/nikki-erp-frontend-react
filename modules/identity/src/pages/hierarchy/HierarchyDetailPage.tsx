import { Breadcrumbs, Stack, Typography } from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppSelector } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';

import { selectHierarchyDetail } from '../../appState/hierarchy';
import { selectUserList } from '../../appState/user';
import { ListUser } from '../../components/User';
import { HierarchyDetailForm } from '../../features/hierarchy/components';
import { useHierarchyDetailHandlers, useHierarchyUserManagement } from '../../features/hierarchy/hooks';
import hierarchySchema from '../../schemas/hierarchy-schema.json';


export const HierarchyDetailPageBody: React.FC = () => {
	const { hierarchyId } = useParams();
	const hierarchyDetail = useMicroAppSelector(selectHierarchyDetail);
	const users = useMicroAppSelector(selectUserList);
	const schema = hierarchySchema as ModelSchema;
	const { t } = useTranslation();

	const { isLoadingDetail,
		handleUpdate,
		handleDelete } = useHierarchyDetailHandlers();
	const { isLoadingManageUsers,
		handleAddUsers,
		handleRemoveUsers } = useHierarchyUserManagement();

	const usersByHierarchy = React.useMemo(() => {
		if (!hierarchyId || !users.data.length) return [];
		return users.data.filter((user: any) =>
			user.hierarchy?.id === hierarchyId,
		);
	}, [users, hierarchyId]);

	return (
		<Stack gap='md'>
			<Breadcrumbs>
				<Typography>
					<Link to='..'>
						<h4>{t('nikki.identity.hierarchy.title')}</h4>
					</Link>
				</Typography>
			</Breadcrumbs>
			<HierarchyDetailForm
				schema={schema}
				hierarchyDetail={hierarchyDetail?.data}
				isLoading={isLoadingDetail}
				onSubmit={handleUpdate}
				onDelete={handleDelete}
			/>
			<ListUser
				users={usersByHierarchy}
				availableUsers={users?.data}
				isLoading={isLoadingManageUsers}
				onAddUsers={handleAddUsers}
				onRemoveUsers={handleRemoveUsers}
				title={t('nikki.identity.hierarchy.title')}
				emptyMessage={t('nikki.identity.hierarchy.messages.noHierarchies')}
			/>
		</Stack>
	);
};

export const HierarchyDetailPage: React.FC = withWindowTitle('Hierarchy Detail', HierarchyDetailPageBody);
