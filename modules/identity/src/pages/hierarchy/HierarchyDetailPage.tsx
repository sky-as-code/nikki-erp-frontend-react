import { Breadcrumbs, Stack, Typography } from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppSelector } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';

import { selectUserState } from '../../appState';
import { selectHierarchyState } from '../../appState/hierarchy';
import { ListUser } from '../../components/User';
import { HierarchyDetailForm } from '../../features/hierarchy/components';
import { useHierarchyDetailHandlers, useHierarchyUserManagement } from '../../features/hierarchy/hooks';
import hierarchySchema from '../../schemas/hierarchy-schema.json';


export const HierarchyDetailPageBody: React.FC = () => {
	const { hierarchyId } = useParams();
	const {
		hierarchyDetail,
		isLoading,
	} = useMicroAppSelector(selectHierarchyState);
	const { users } = useMicroAppSelector(selectUserState);
	const schema = hierarchySchema as ModelSchema;
	const { t } = useTranslation();

	const { handleUpdate, handleDelete } = useHierarchyDetailHandlers(hierarchyId!, hierarchyDetail?.etag);
	const { handleAddUsers, handleRemoveUsers } = useHierarchyUserManagement(hierarchyId!);

	const usersByHierarchy = React.useMemo(() => {
		if (!hierarchyId || !users.length) return [];
		return users.filter((user: any) =>
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
				{hierarchyDetail?.name && (
					<Typography>
						<h5>{hierarchyDetail.name}</h5>
					</Typography>
				)}
			</Breadcrumbs>
			<HierarchyDetailForm
				schema={schema}
				hierarchyDetail={hierarchyDetail}
				isLoading={isLoading}
				onSubmit={handleUpdate}
				onDelete={handleDelete}
			/>
			<ListUser
				users={usersByHierarchy}
				availableUsers={users}
				isLoading={isLoading}
				onAddUsers={handleAddUsers}
				onRemoveUsers={handleRemoveUsers}
				title={t('nikki.identity.hierarchy.title')}
				emptyMessage={t('nikki.identity.hierarchy.messages.noHierarchies')}
			/>
		</Stack>
	);
};

export const HierarchyDetailPage: React.FC = withWindowTitle('Hierarchy Detail', HierarchyDetailPageBody);
