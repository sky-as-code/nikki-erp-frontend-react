import { Box, Center, Loader, Paper, Space, Stack, Text } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { BreadCrumbs } from '../BreadCrumbs';


export type PageContainerProps = {
	breadcrumbs?: { title: string; href: string }[];
	actionBar?: React.ReactNode;
	sections?: React.ReactNode[];
	children?: React.ReactNode;
	isLoading?: boolean;
	isNotFound?: boolean;
	notFoundComponent?: React.ReactNode;
};


const PageLoading: React.FC = () => {
	const { t: translate } = useTranslation();
	return (
		<Center mih={300}>
			<Stack align='center' gap='md'>
				<Loader size='lg' />
				<Text c='dimmed'>{translate('nikki.general.messages.loading')}</Text>
			</Stack>
		</Center>
	);
};

export const PageContainer: React.FC<PageContainerProps> = ({
	breadcrumbs = [],
	actionBar,
	sections = [],
	children,
	isLoading = false,
	isNotFound = false,
	notFoundComponent,
}) => {
	return (
		<Stack gap={'sm'} mt={'xs'} p={'sm'} bg='light-dark(rgb(255 255 255 / 80%), var(--mantine-color-dark-6))' bdrs={'xs'}>
			{isLoading
				? <PageLoading />
				: (
					<>
						{breadcrumbs.length > 0 && <BreadCrumbs items={breadcrumbs} />}
						{actionBar && <Box>{actionBar}</Box>}
						{sections.map((section, index) => <Box key={index}>{section}</Box>)}
						<Paper p={'sm'}>
							{isNotFound && notFoundComponent
								? notFoundComponent
								: children
							}
						</Paper>
					</>
				)}
			<Space h={{ base: 'lg', md: 'xl' }}  />
		</Stack>
	);
};