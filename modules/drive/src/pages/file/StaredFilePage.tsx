import { Container } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';


function StaredFilePageBody() {
	return <Container>Shared files</Container>;
}

export const StarredFilePage: React.FC = () => {
	const { t: translate } = useTranslation();
	React.useEffect(() => {
		document.title = translate('nikki.drive.pageTitle.starredFiles');
	}, [translate]);
	return <StaredFilePageBody />;
};
