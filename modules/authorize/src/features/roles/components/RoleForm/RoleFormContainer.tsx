import { Paper, Title } from '@mantine/core';
import React from 'react';


interface RoleFormContainerProps {
	title?: string;
	children: React.ReactNode;
}

export const RoleFormContainer: React.FC<RoleFormContainerProps> = ({ title, children }) => (
	<Paper p='lg'>
		{title && <Title order={4}>{title}</Title>}
		{children}
	</Paper>
);

