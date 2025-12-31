import { Loader, Modal, Stack, Text, Title } from '@mantine/core';
import React from 'react';


export interface DetailModalProps {
	opened: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
	isLoading?: boolean;
	size?: string | number;
}

export const DetailModal: React.FC<DetailModalProps> = ({
	opened,
	onClose,
	title,
	children,
	isLoading = false,
	size = 'lg',
}) => {
	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={<Title order={4}>{title}</Title>}
			size={size}
			centered
		>
			{isLoading ? (
				<Stack align='center' gap='md'>
					<Loader size='sm' />
					<Text c='dimmed'>Loading...</Text>
				</Stack>
			) : (
				children
			)}
		</Modal>
	);
};

