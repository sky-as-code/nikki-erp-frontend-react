import { Box, Center, Loader, Paper, Space, Stack, Text } from '@mantine/core';
import { useDocumentTitle } from '@nikkierp/ui/hooks';
import { IconAlertCircle } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { BreadCrumbs } from '@/components/BreadCrumbs';


export type PageContainerProps = {
	documentTitle?: string;
	breadcrumbs?: { title: string; href: string }[];
	actionBar?: React.ReactNode;
	sections?: React.ReactNode[];
	children?: React.ReactNode;
	isLoading?: boolean;
	isEmpty?: boolean;
	emptyContent?: React.ReactNode;
	isNotFound?: boolean;
	notFoundContent?: React.ReactNode;
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

const EmptyContent: React.FC<{ message?: string }> = ({ message }) => {
	const { t: translate } = useTranslation();

	return (
		<Center
			h='100%'
			w='100%'
			p='xl'
			bg='gray.0'
		>
			<Stack align='center' gap='md'>
				<IconAlertCircle size={52} color='red' />
				<Text c='dimmed'>{message || translate('nikki.general.messages.no_data')}</Text>
			</Stack>
		</Center>
	);
};

const NotFound: React.FC = () => {
	const { t: translate } = useTranslation();
	return (
		<EmptyContent message={translate('nikki.general.messages.not_found')} />
	);
};

const NoData: React.FC = () => {
	const { t: translate } = useTranslation();
	return (
		<EmptyContent message={translate('nikki.general.messages.no_data')} />
	);
};

export const PageContainer: React.FC<PageContainerProps> = ({
	documentTitle,
	breadcrumbs = [],
	actionBar,
	sections = [],
	children,
	isLoading = false,
	isNotFound = false,
	notFoundContent,
	isEmpty = false,
	emptyContent,
}) => {
	useDocumentTitle(documentTitle ?? '');
	return (
		<Stack gap={'sm'} mt={'xs'} p={'sm'} bg='light-dark(rgb(255 255 255 / 80%), var(--mantine-color-dark-6))' bdrs={'xs'}>
			{breadcrumbs.length > 0 && <BreadCrumbs items={breadcrumbs} />}
			{actionBar && <Box>{actionBar}</Box>}
			{sections.map((section, index) => <Box key={index}>{section}</Box>)}
			{isLoading
				? <PageLoading />
				: (
					<Paper px={'sm'} py={'md'}>
						{isNotFound
							? notFoundContent || <NotFound />
							: isEmpty
								? emptyContent || <NoData />
								: children
						}
					</Paper>
				)}
			<Space h={{ base: 'md', md: 'lg' }}  />
		</Stack>
	);
};

