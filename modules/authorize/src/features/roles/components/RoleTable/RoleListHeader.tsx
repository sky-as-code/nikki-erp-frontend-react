import { Breadcrumbs, Group, TagsInput, Typography } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';


export const RoleListHeader: React.FC = () => {
	const { t: translate } = useTranslation();
	return (
		<Group>
			<Breadcrumbs style={{
				minWidth: '30%',
			}}>
				<Typography>
					<h4>{translate('nikki.authorize.role.title')}</h4>
				</Typography>
			</Breadcrumbs>
			<TagsInput
				placeholder={translate('nikki.general.actions.search')}
				w='500px'
			/>
		</Group>
	);
};

