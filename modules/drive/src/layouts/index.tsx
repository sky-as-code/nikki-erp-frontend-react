import { Box, Container, Flex, Input, Stack } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useEffect, useRef } from 'react';
import { Outlet } from 'react-router';

import { FileTree } from '@/features/files';


export const DriveLayout: React.FC = () => {
	const searchInputRef = useRef<HTMLInputElement>(null);
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
				event.preventDefault();
				searchInputRef.current?.focus();
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, []);
	return (
		<Container
			fluid
			p={{ base: 'xs', xs: 'sm', sm: 'md' }}
			style={{ boxSizing: 'border-box' }}
			h='100%'
		>
			<Flex gap='md' h='100%'>
				<FileTree />
				<Stack w={'100%'}>
					<Input ref={searchInputRef} bdrs='sm' size='md' w={'100%'}
						placeholder='Search files and folders... (Ctrl + K)'
						leftSection={<IconSearch size={16} />}
					/>
					<Box style={{ flex: 1, minWidth: 0, overflowY: 'hidden' }}>
						<Outlet />
					</Box>
				</Stack>
			</Flex></Container>);
};
