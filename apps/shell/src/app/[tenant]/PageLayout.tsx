'use client';

import { Box, Paper } from '@mantine/core';
import clsx from 'classnames';

import classes from './ModuleLayout.module.css';

import { useUIState } from '@/common/context/UIProviders';


type PageLayoutProps = React.PropsWithChildren<{
	isSplitSmall?: boolean,
	isSplitBig?: boolean,
	toolbar?: React.ReactNode,
}>;

export const PageLayout: React.FC<PageLayoutProps> = ({
	children, isSplitSmall, isSplitBig, toolbar,
}) => {
	const { isMobile, isScrollingUp, backgroundColor } = useUIState();

	return (
		<>
			<Box
				component='section'
				bg={backgroundColor}
				className={clsx(
					'flex flex-col overflow-hidden', {
						'flex-[1]': isSplitSmall,
						'flex-[3]': isSplitBig,
						'flex-1': !isSplitSmall && !isSplitBig,
					},
				)}
			>
				{toolbar && (
					<Paper
						component='header'
						bg={backgroundColor}
						shadow='sm'
						radius={0}
						className={clsx(
						// 'fixed top-0 left-0 w-full z-50 bg-white shadow transition-transform duration-300',
							'w-full shrink-0 z-10',
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
				<Box
					component='main'
					bg={backgroundColor}
					// pt='md'
					// pb='xl'
					className='flex-1 relative overflow-y-hidden'
				>
					{children}
				</Box>
			</Box>
		</>
	);
};
