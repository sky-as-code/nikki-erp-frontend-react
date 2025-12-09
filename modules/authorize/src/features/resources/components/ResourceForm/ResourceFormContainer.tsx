import { Paper, Title } from '@mantine/core';
import React from 'react';


interface ResourceFormContainerProps {
	title?: string;
	children: React.ReactNode;
}

export const ResourceFormContainer: React.FC<ResourceFormContainerProps> = ({ title, children }) => {
	return (
		<Paper p='lg'>
			{title && <Title order={4} mb='lg'>{title}</Title>}
			{children}
		</Paper>
	);
};
