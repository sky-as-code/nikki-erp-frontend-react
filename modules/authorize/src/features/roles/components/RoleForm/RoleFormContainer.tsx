import { Paper, Title } from '@mantine/core';
import React from 'react';


interface RoleFormContainerProps {
	title: string;
	children: React.ReactNode;
}

export const RoleFormContainer: React.FC<RoleFormContainerProps> = ({ title, children }) => (
	<Paper p='lg'>
		<Title order={3} mb='lg'>{title}</Title>
		{children}
	</Paper>
);

