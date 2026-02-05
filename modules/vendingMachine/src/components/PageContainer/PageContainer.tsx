import { Box, Paper, Space, Stack } from '@mantine/core';
import React from 'react';

import { BreadCrumbs } from '@/components/BreadCrumbs';


interface PageContainerProps {
	breadcrumbs?: { title: string; href: string }[];
	actionBar?: React.ReactNode;
	children: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({ breadcrumbs, actionBar, children }) => {
	return (
		<Stack gap='md' mt='sm'>
			{breadcrumbs && breadcrumbs.length > 0 && <BreadCrumbs items={breadcrumbs} />}
			{actionBar && <Box>{actionBar}</Box>}
			<Paper p={'md'} bg='light-dark(rgb(255 255 255 / 70%), var(--mantine-color-dark-6))'>
				{children}
			</Paper>
			<Space h={{ base: 'lg', md: 'xl' }}  />
		</Stack>
	);
};

