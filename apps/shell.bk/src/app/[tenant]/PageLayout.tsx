'use client'

import { Box } from '@mantine/core'
import clsx from 'clsx'

import classes from './ModuleLayout.module.css'

import { useUIState } from '@/common/context/UIProviders'

type PageLayoutProps = React.PropsWithChildren<{
	isSplitSmall?: boolean;
	isSplitBig?: boolean;
	isCollapsed?: boolean;
	toolbar?: React.ReactNode;
}>

export const PageLayout: React.FC<PageLayoutProps> = ({
	children,
	isCollapsed,
	isSplitSmall,
	isSplitBig,
	toolbar,
}) => {
	const { isMobile, isScrollingUp } = useUIState()

	return (
		<Box
			component='section'
			className={clsx(
				'page-layout flex flex-col items-start min-w-0 relative overflow-hidden',
				{
					'split-small flex-[1]': isSplitSmall,
					'split-big flex-[3] shadow-md shadow-black/30 z-100': isSplitBig,
					'split-collapsed w-8': isCollapsed,
					'no-split flex-1': !isSplitSmall && !isSplitBig && !isCollapsed,
				}
			)}
			style={{
				height: 'calc(100vh - 50px)',
			}}
		>
			{toolbar && (
				<Box
					component='header'
					className={clsx(
						'page-toolbar w-full shrink-0 z-90 px-4 shadow-md',
						'transition-transform duration-300 translate-y-0',
						classes.headerRow,
						{
							'translate-y-0': !isMobile || isScrollingUp,
							'-translate-y-full': isMobile && !isScrollingUp,
						}
					)}
				>
					{toolbar}
				</Box>
			)}
			{children}
		</Box>
	)
}
