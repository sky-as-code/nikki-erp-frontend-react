import { Paper, Title } from '@mantine/core';
import React from 'react';


interface ResourceFormContainerProps {
	title: string;
	children: React.ReactNode;
}

export const ResourceFormContainer: React.FC<ResourceFormContainerProps> = ({ title, children }) => (
	<Paper p='lg'>
		<Title order={3} mb='lg'>{title}</Title>
		{children}
	</Paper>
);

