'use client';

import {
	AppShell,
	Burger,
	Text,
	useMantineColorScheme,
	useMantineTheme,
	Box,
	Container,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import clsx from 'classnames';
import { useEffect, useState } from 'react';

import { LayoutHeader } from '@/components/LayoutHeader/LayoutHeader';
import { Navbar } from '@/components/Navbar/Navbar';
import { NavItem } from '@/types/navItem';

type ModuleLayoutProps = React.PropsWithChildren<{
	navItems: NavItem[]
}>;

export const ModuleLayout: React.FC<ModuleLayoutProps> = ({
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
		<div className='flex flex-col min-h-screen'>
			<Header
				isMobile={isMobile}
				isScrollingUp={isScrollingUp}
				navItems={navItems}
			/>
			<MainContent>
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
			</MainContent>
			<Footer />
		</div>
	);
};

type HeaderProps = {
	isMobile: boolean;
	isScrollingUp: boolean;
	navItems: NavItem[];
};

const Header: React.FC<HeaderProps> = ({ isMobile, isScrollingUp, navItems }) => {
	const [opened, { toggle }] = useDisclosure();

	return (
		<>
			<header
				className={clsx(
					'fixed top-0 left-0 w-full z-50 bg-white shadow transition-transform duration-300 h-[5rem]',
					{
						'translate-y-0': !isMobile || isScrollingUp,
						'-translate-y-full': isMobile && !isScrollingUp,
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
			{/* Spacer for fixed header */}
			<div className='h-[2.5rem]' />
		</>
	);
};

type MainContentProps = {
	children: React.ReactNode;
};

const MainContent: React.FC<MainContentProps> = ({ children }) => {
	return (
		<main className='flex-grow'>
			<Container className='py-4'>
				{children}
			</Container>
		</main>
	);
};

const Footer: React.FC = () => (
	<footer className='bg-gray-100 border-t border-gray-300 py-4'>
		<Container>
			<p className='text-sm text-center text-gray-500'>
				&copy; {new Date().getFullYear()} My App. All rights reserved.
			</p>
		</Container>
	</footer>
);

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
