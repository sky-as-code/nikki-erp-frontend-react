import { Paper, Title } from '@mantine/core';
import React from 'react';


interface RevokeRequestFormContainerProps {
	title?: string;
	children: React.ReactNode;
}

export const RevokeRequestFormContainer: React.FC<RevokeRequestFormContainerProps> = ({ title, children }) => (
	<Paper p='lg'>
		{title && <Title order={4} mb='lg'>{title}</Title>}
		{children}
	</Paper>
);

