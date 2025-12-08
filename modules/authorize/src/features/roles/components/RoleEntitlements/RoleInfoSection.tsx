import { Paper, Stack, Text } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Role } from '@/features/roles/types';


interface RoleInfoSectionProps {
	role: Role;
}

export const RoleInfoSection: React.FC<RoleInfoSectionProps> = ({ role }) => {
	const { t: translate } = useTranslation();

	return (
		<Paper p='md' withBorder>
			<Stack gap='xs'>
				<Text size='sm' fw={500}>
					{translate('nikki.authorize.role.fields.name')}: {role.name}
				</Text>
				{role.orgId && (
					<Text size='sm' fw={500}>
						{translate('nikki.authorize.role.fields.org_id')}: {role.orgId}
					</Text>
				)}
			</Stack>
		</Paper>
	);
};

