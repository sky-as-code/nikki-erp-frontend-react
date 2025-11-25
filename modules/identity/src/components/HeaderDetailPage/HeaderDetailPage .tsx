import { Breadcrumbs, Typography } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';


interface HeaderDetailPageProps {
	title: string;
	name: string;
}

export function HeaderDetailPage({ title, name }: HeaderDetailPageProps): React.ReactElement {
	const { t } = useTranslation();

	return (
		<Breadcrumbs>
			<Typography>
				<Link to='..'>
					<h4>{t(title)}</h4>
				</Link>
			</Typography>
			{name && (
				<Typography>
					<h5>{name}</h5>
				</Typography>
			)}
		</Breadcrumbs>
	);
}
