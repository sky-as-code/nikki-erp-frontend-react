import { Box, Paper, Stack } from '@mantine/core';
import React from 'react';

import { BreadCrumbs } from '@/components/BreadCrumbs';


interface PageContainerProps {
	breadcrumbs: { title: string; href: string }[];
	actionBar: React.ReactNode;
	children: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({ breadcrumbs, actionBar, children }) => {
	return (
		<Stack gap='md' mt='sm'>
			<BreadCrumbs items={breadcrumbs} />
			<Box>{actionBar}</Box>
			<Paper p={'md'} bg='light-dark(rgb(255 255 255 / 70%), var(--mantine-color-dark-6))'>
				{children}
			</Paper>
		</Stack>
	);
};

