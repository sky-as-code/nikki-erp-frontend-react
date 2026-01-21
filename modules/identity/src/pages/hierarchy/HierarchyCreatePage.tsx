import { Stack, Title } from '@mantine/core';
import { useActiveOrgWithDetails } from '@nikkierp/shell/userContext';
import { withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { IdentityDispatch, hierarchyActions } from '../../appState';
import { selectHierarchyList } from '../../appState/hierarchy';
import { HierarchyCreateForm } from '../../features/hierarchy/components';
import { useHierarchyCreateHandlers } from '../../features/hierarchy/hooks';
import hierarchySchema from '../../schemas/hierarchy-schema.json';


export const HierarchyCreatePageBody: React.FC = () => {
	const dispatch: IdentityDispatch = useMicroAppDispatch();
	const list  = useMicroAppSelector(selectHierarchyList);
	const activeOrg = useActiveOrgWithDetails();
	const { t } = useTranslation();

	React.useEffect(() => {
		if (activeOrg?.id) {
			dispatch(hierarchyActions.listHierarchies(activeOrg.id));
		}
	}, [dispatch, activeOrg?.id]);

	const schema = hierarchySchema as ModelSchema;
	const {isLoading, onSubmit } = useHierarchyCreateHandlers();

	return (
		<Stack gap='md'>
			<Title order={2}>{t('nikki.identity.hierarchy.actions.createNew')}</Title>
			<HierarchyCreateForm
				schema={schema}
				hierarchies={list.data}
				isCreating={isLoading}
				onSubmit={onSubmit}
			/>
		</Stack>
	);
};

export const HierarchyCreatePage: React.FC = withWindowTitle('Create Hierarchy', HierarchyCreatePageBody);
