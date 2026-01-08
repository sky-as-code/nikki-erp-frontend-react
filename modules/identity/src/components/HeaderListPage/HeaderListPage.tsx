import { Breadcrumbs, Group, TagsInput, Typography } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';


interface UserListHeaderProps {
	title: string;
	searchPlaceholder: string;
}

export function HeaderListPage({ title, searchPlaceholder }: UserListHeaderProps): React.ReactElement {
	const { t } = useTranslation();

	return (
		<Group>
			<Breadcrumbs style={{ minWidth: '30%' }}>
				<Typography>
					<h4>{t(title)}</h4>
				</Typography>
			</Breadcrumbs>
			<TagsInput
				placeholder={t(searchPlaceholder)}
				w='500px'
			/>
		</Group>
	);
}
