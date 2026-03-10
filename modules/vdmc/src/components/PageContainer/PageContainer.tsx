import { Box, Paper, Space, Stack } from '@mantine/core';
import React from 'react';

import { BreadCrumbs } from '@/components/BreadCrumbs';


export type PageContainerProps = {
	breadcrumbs?: { title: string; href: string }[];
	actionBar?: React.ReactNode;
	sections?: React.ReactNode[];
	children?: React.ReactNode;
};

export const PageContainer: React.FC<PageContainerProps> = ({ breadcrumbs, actionBar, sections, children }) => {
	return (
		<Stack gap={'sm'} mt={'xs'} p={'sm'} bg='light-dark(rgb(255 255 255 / 80%), var(--mantine-color-dark-6))' bdrs={'xs'}>
			{breadcrumbs?.length && <BreadCrumbs items={breadcrumbs} />}

			{actionBar && <Box>{actionBar}</Box>}

			{sections?.map((section, index) => <Box key={index}>{section}</Box>)}

			{children && <Paper p={'md'}> {children} </Paper>}

			<Space h={{ base: 'lg', md: 'xl' }}  />
		</Stack>
	);
};

