'use client';

import {
	AppShell,
	Burger,
	Text,
	useMantineColorScheme,
	useMantineTheme,
	Box,
	Container,
	Group,
	Button,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconFilter, IconLayoutDashboard, IconList, IconPlus, IconRefresh, IconSettings } from '@tabler/icons-react';
import clsx from 'classnames';
import { useEffect, useState } from 'react';

import classes from './ModuleLayout.module.css';

import { LayoutHeader } from '@/components/LayoutHeader/LayoutHeader';
import { Navbar } from '@/components/Navbar/Navbar';
import { NavItem } from '@/types/navItem';


type PageLayoutProps = React.PropsWithChildren<{
	navItems: NavItem[]
}>;

export const PageLayout: React.FC<PageLayoutProps> = ({
	children,
	navItems,
}) => {
	const [opened, { toggle }] = useDisclosure();
	const { colorScheme } = useMantineColorScheme();
	const theme = useMantineTheme();
	const isScrollingUp = useScrollDirection();
	const isMobile = useMobileScreen();

	const bg = colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0];

	return (
		<div
			// className='flex flex-col min-h-screen overflow-hidden'
			className='flex flex-col h-screen overflow-hidden'
		>
			<header
				className={clsx(
					// 'fixed top-0 left-0 w-full z-50 bg-white',
					'w-full z-50 bg-white h-[50px] shrink-0',
					{
						'hidden': isMobile,
					},
				)}
			>
				<LayoutHeader
					burger={
						<Burger
							opened={opened}
							onClick={toggle}
							size='md'
						/>
					}
					navItems={navItems}
				/>
			</header>
			<ContentHeader isMobile={isMobile} isScrollingUp={isScrollingUp} />
			<MainContent isMobile={isMobile} isScrollingUp={isScrollingUp}>
				{children}
			</MainContent>
		</div>
	);
};

type MainContentProps = {
	children: React.ReactNode;
	isMobile: boolean;
	isScrollingUp: boolean;
};

const MainContent: React.FC<MainContentProps> = ({ children, isMobile, isScrollingUp }) => {
	return (
		<main className='flex-1 relative overflow-y-auto'>
			<Container className='py-4'>
				{children}
				<p>Content</p>
				<p>Content</p>
				<p>Content</p>
				<p>Content</p>
				<p>Content</p>
				<p>Content</p>
				<p>Content</p>
				<p>Content</p>
				<p>Content</p>
				<p>Content</p>
				<p>Content</p>
				<p>Content</p>
				<p>Content</p>
				<p>Content</p>
				<p>Content</p>
				<p>Content</p>
				<p>Content</p>
				<p>Content</p>
				<p>Content</p>
				<p>Content</p>
				<p>Content</p>
				<p>Content</p>
				<p>Content</p>
				<p>Content</p>
				<p>Content</p>
				<p>Content</p>
				<p>Content</p>
				<p>Content</p>
				<p>Content</p>
				<p>Content</p>
				<p>Content</p>
				<p>Content</p>
				<p>Content</p>
				<p>Content</p>
				<p>Content</p>
				<p>Content</p>
				<p>Content</p>
				<p>Content</p>
				<p>Content</p>
				<p>Content</p>
				<p>Content</p>
				<p>Content</p>
				<p>Content</p>
				<p>Content</p>
				<p>Content</p>
				<p>Content</p>
				<p>Content</p>
				<p>Content</p>
				<p>Content</p>
				<p>Content</p>
				<p>Content</p>
				<p>Content</p>
			</Container>
		</main>
	);
};

function useMobileScreen(breakpoint = 768) {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const checkMobile = () => setIsMobile(window.innerWidth < breakpoint);

		// Initial check
		checkMobile();

		// Add event listener
		window.addEventListener('resize', checkMobile);

		// Cleanup
		return () => window.removeEventListener('resize', checkMobile);
	}, [breakpoint]);

	return isMobile;
}

function useScrollDirection(threshold = 10) {
	const [isScrollingUp, setIsScrollingUp] = useState(true);
	const [lastScrollY, setLastScrollY] = useState(0);

	useEffect(() => {
		const updateScroll = () => {
			const currentScrollY = window.scrollY;

			if (Math.abs(currentScrollY - lastScrollY) < threshold) return;

			setIsScrollingUp(currentScrollY < lastScrollY);
			setLastScrollY(currentScrollY);
		};

		window.addEventListener('scroll', updateScroll);
		return () => window.removeEventListener('scroll', updateScroll);
	}, [lastScrollY, threshold]);

	return isScrollingUp;
}

type ContentHeaderProps = {
	isMobile: boolean;
	isScrollingUp: boolean;
};

const ContentHeader: React.FC<ContentHeaderProps> = ({isMobile, isScrollingUp}) => {

	return (
		<header
			className={clsx(
				// 'fixed top-0 left-0 w-full z-50 bg-white shadow transition-transform duration-300',
				'w-full z-50 shrink-0 bg-white shadow transition-transform duration-300',
				{
					'translate-y-0': !isMobile || isScrollingUp,
					'-translate-y-full': isMobile && !isScrollingUp,
				},
			)}
		>
			<Group
				gap='xs'
				justify='flex-start'
				mt='xs'
				className={clsx(
					classes.headerRow,
				)}
			>
				{/* {burger} */}
				<Text component='span' fw='bold' fz='h3' >
					Current page
				</Text>
				<IconSettings />
			</Group>
			<Group
				gap='xs'
				justify='space-between'
				mt='xs' mb='xs'
				className={clsx(
					// 'flex flex-row items-center justify-start h-full',
					classes.headerRow,
				)}
			>
				<Group
					gap='xs'
					justify='flex-start'
				>
					{/* {burger} */}
					<Button
						size='compact-md' fw='bold' variant='subtle'
						leftSection={<IconPlus />}
					>Create</Button>
					<Button
						size='compact-md' fw='normal' variant='subtle'
						leftSection={<IconRefresh />}
					>Refresh</Button>
				</Group>
				<Group
					gap='xs'
					justify='flex-end'
				>
					<Button size='compact-md' variant='subtle' fw='normal'><IconFilter /> Filter</Button>
					<Button.Group>
						<Button size='compact-md' variant='filled' fw='normal'><IconList /></Button>
						<Button size='compact-md' variant='subtle' fw='normal'><IconLayoutDashboard /></Button>
					</Button.Group>
				</Group>
			</Group>
		</header>
	);
};
