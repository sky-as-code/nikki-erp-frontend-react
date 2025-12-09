import { Paper, Title } from '@mantine/core';


interface ActionFormContainerProps {
	title?: string;
	children: React.ReactNode;
}

export const ActionFormContainer: React.FC<ActionFormContainerProps> = ({ title, children }) => {
	return (
		<Paper p='lg'>
			{title && <Title order={4} mb='lg'>{title}</Title>}
			{children}
		</Paper>
	);
};
