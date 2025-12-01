import { Paper, Title } from '@mantine/core';
import React from 'react';


interface EntitlementFormContainerProps {
	title: string;
	children: React.ReactNode;
}

export const EntitlementFormContainer: React.FC<EntitlementFormContainerProps> = ({ title, children }) => (
	<Paper p='lg'>
		<Title order={3} mb='lg'>{title}</Title>
		{children}
	</Paper>
);

