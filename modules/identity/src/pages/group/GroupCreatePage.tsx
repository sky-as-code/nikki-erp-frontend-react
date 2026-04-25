import { Stack, Title } from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { GroupForm } from '../../features/group/components';
import { useIdentityPermissions } from '../../hooks';


export const GroupCreatePageBody: React.FC = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const permissions = useIdentityPermissions();

	return (
		<Stack gap='md'>
			<Title order={2}>{t('nikki.identity.group.actions.createNew')}</Title>
			<GroupForm
				variant='create'
				canCreate={permissions.group.canCreate}
				onCreateSuccess={(id) => navigate(`../${id}`, { relative: 'path', replace: true })}
			/>
		</Stack>
	);
};

export const GroupCreatePage = withWindowTitle('Create Group', GroupCreatePageBody);
