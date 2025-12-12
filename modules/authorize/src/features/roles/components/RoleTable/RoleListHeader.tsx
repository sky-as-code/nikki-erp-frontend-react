import { Breadcrumbs, Group, TagsInput, Title } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';


export const RoleListHeader: React.FC = () => {
	const { t: translate } = useTranslation();
	return (
		<Group>
			<Breadcrumbs style={{
				minWidth: '30%',
			}}>
				<Title order={4}>
					{translate('nikki.authorize.role.title')}
				</Title>
			</Breadcrumbs>
			<TagsInput
				placeholder={translate('nikki.general.actions.search')}
				w='500px'
			/>
		</Group>
	);
};

