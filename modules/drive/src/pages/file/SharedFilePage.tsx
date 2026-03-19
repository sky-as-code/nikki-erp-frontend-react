import { Container } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';


function SharedWithMe() {
	return <Container>Shared files</Container>;
}

export const SharedWithMePage: React.FC = () => {
	const { t: translate } = useTranslation();
	React.useEffect(() => {
		document.title = translate('nikki.drive.pageTitle.sharedWithMe');
	}, [translate]);
	return <SharedWithMe />;
};
