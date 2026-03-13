import { Container, Flex, Stack, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useEffect, useRef } from 'react';
import { Outlet } from 'react-router';

import { DriveSidebar } from '@/features/files';


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
				<DriveSidebar />
				<Stack w={'100%'}>
					<TextInput
						ref={searchInputRef} size='md' w={'100%'}
						bg={'gray.0'}
						variant='unstyled'
						bdrs='lg'
						bd='1px solid var(--mantine-color-gray-3)'
						style={{ boxShadow: '0 8px 24px rgba(15, 23, 42, 0.18)', overflow: 'hidden' }}
						placeholder='Search files and folders... (Ctrl + K)'
						leftSection={<IconSearch size={16} />}
					/>
					<Outlet />
				</Stack>
			</Flex></Container>);
};
