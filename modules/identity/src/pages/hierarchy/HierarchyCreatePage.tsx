import { Stack, Title } from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { OrgUnitForm } from '../../features/hierarchy/components';
import { useIdentityPermissions } from '../../hooks';


export const HierarchyCreatePageBody: React.FC = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const permissions = useIdentityPermissions();

	return (
		<Stack gap='md'>
			<Title order={2}>{t('nikki.identity.hierarchy.actions.createNew')}</Title>
			<OrgUnitForm
				variant='create'
				canCreate={permissions.orgUnit.canCreate}
				onCreateSuccess={(id) => navigate(`../${id}`, { relative: 'path', replace: true })}
			/>
		</Stack>
	);
};

export const HierarchyCreatePage: React.FC = withWindowTitle('Create Hierarchy', HierarchyCreatePageBody);
