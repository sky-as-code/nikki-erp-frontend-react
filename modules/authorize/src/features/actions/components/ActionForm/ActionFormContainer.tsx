import { Paper, Title } from '@mantine/core';


interface ActionFormContainerProps {
	title: string;
	children: React.ReactNode;
}

export const ActionFormContainer: React.FC<ActionFormContainerProps> = ({ title, children }) => (
	<Paper p='lg'>
		<Title order={3} mb='lg'>{title}</Title>
		{children}
	</Paper>
);
