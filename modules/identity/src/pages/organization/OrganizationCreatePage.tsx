import { Stack, Title } from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { OrganizationForm } from '../../features/organization/components';
import { useIdentityPermissions } from '../../hooks';


export const OrganizationCreatePageBody: React.FC = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const permissions = useIdentityPermissions();

	return (
		<Stack gap='md'>
			<Title order={2}>{t('nikki.identity.organization.actions.createNew')}</Title>
			<OrganizationForm
				variant='create'
				canCreate={permissions.organization.canCreate}
				onCreateSuccess={(slug) => navigate(`../${slug}`, { relative: 'path', replace: true })}
			/>
		</Stack>
	);
};

export const OrganizationCreatePage = withWindowTitle('Create Organization', OrganizationCreatePageBody);
