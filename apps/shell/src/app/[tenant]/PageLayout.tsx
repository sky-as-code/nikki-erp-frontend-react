
'use client';

import { Box, Button, Group, Paper } from '@mantine/core';
import { IconChevronsRight } from '@tabler/icons-react';
import clsx from 'clsx';

import { useModuleLayout } from './ModuleLayout';
import classes from './ModuleLayout.module.css';

import { useUIState } from '@/common/context/UIProviders';


type PageLayoutProps = React.PropsWithChildren<{
	isSplitSmall?: boolean,
	isSplitBig?: boolean,
	isCollapsed?: boolean,
	toolbar?: React.ReactNode,
}>;

export const PageLayout: React.FC<PageLayoutProps> = ({
	children, isCollapsed, isSplitSmall, isSplitBig, toolbar,
}) => {
	const { isMobile, isScrollingUp, backgroundColor } = useUIState();

	return (
		<Box
			component='section'
			bg={backgroundColor}
			className={clsx(
				'page-layout flex flex-col items-start min-w-0 relative', {
					'split-small flex-[1] overflow-x-hidden': isSplitSmall,
					'split-big flex-[3] shadow-lg shadow-black/30 z-100': isSplitBig,
					'split-collapsed w-8': isCollapsed,
					'no-split flex-1': !isSplitSmall && !isSplitBig && !isCollapsed,
				})}
			style={{
				height: 'calc(100vh - 50px)',
			}}
		>
			{toolbar && (
				<Paper
					component='header'
					bg={backgroundColor}
					shadow='sm'
					radius={0}
					className={clsx(
						'page-toolbar w-full shrink-0 z-90 px-4',
						'transition-transform duration-300 translate-y-0',
						classes.headerRow,
						{
							'translate-y-0': !isMobile || isScrollingUp,
							'-translate-y-full': isMobile && !isScrollingUp,
						},
					)}
				>
					{toolbar}
				</Paper>
			)}
			{children}
		</Box>
	);
};
