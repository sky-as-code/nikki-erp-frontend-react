import { Paper, Title } from '@mantine/core';
import React from 'react';


interface GrantRequestFormContainerProps {
	title?: string;
	children: React.ReactNode;
}

export const GrantRequestFormContainer: React.FC<GrantRequestFormContainerProps> = ({ title, children }) => (
	<Paper p='lg'>
		{title && <Title order={4} mb='lg'>{title}</Title>}
		{children}
	</Paper>
);

