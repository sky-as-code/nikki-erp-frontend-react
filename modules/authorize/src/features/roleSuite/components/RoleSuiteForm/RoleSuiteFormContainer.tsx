import { Paper, Title } from '@mantine/core';
import React from 'react';


interface RoleSuiteFormContainerProps {
	title: string;
	children: React.ReactNode;
}

export const RoleSuiteFormContainer: React.FC<RoleSuiteFormContainerProps> = ({ title, children }) => (
	<Paper p='lg'>
		<Title order={3} mb='lg'>{title}</Title>
		{children}
	</Paper>
);

