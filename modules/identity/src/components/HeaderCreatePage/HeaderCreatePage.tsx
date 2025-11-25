import { Title } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';


interface HeaderCreatePageProps {
	title: string;
}
export function HeaderCreatePage({ title }: HeaderCreatePageProps): React.ReactElement {
	const { t } = useTranslation();
	return (
		<Title order={2}>{t(title)}</Title>
	);
}
