import { Container, Flex, Stack } from '@mantine/core';
import { Outlet } from 'react-router';

import { DriveSearchBar } from './DriveSearchBar';

import { DriveSidebar } from '@/features/files';

import { DriveSearchBar } from './DriveSearchBar';


export const DriveLayout: React.FC = () => {
	return (
		<Container
			fluid
			p={{ base: 'xs', xs: 'sm', sm: 'md' }}
			style={{ boxSizing: 'border-box' }}
			h='100%'
		>
			<Flex gap='md' h='100%'>
				<DriveSidebar />
				<Stack w='100%'>
					<DriveSearchBar />
					<Outlet />
				</Stack>
			</Flex></Container>);
};
