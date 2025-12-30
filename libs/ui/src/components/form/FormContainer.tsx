import { Paper, Title } from '@mantine/core';
import React from 'react';


export interface FormContainerProps {
	title?: string;
	children: React.ReactNode;
}

export const FormContainer: React.FC<FormContainerProps> = ({ title, children }) => {
	return (
		<Paper p='lg'>
			{title && <Title order={4} mb='lg'>{title}</Title>}
			{children}
		</Paper>
	);
};

