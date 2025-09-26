'use client'

import {
	AppShell,
	Burger,
	Text,
	useMantineColorScheme,
	useMantineTheme,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'

import { LayoutHeader } from '@/common/components/LayoutHeader/LayoutHeader'
import { Navbar } from '@/common/components/Navbar/Navbar'
import { NavItem } from '@/types/navItem'

export type ModuleLayoutProps = React.PropsWithChildren<{
	navItems: NavItem[];
}>

export const ModuleLayout: React.FC<ModuleLayoutProps> = ({
	children,
	navItems,
}) => {
	const [opened, { toggle }] = useDisclosure()
	const { colorScheme } = useMantineColorScheme()
	const theme = useMantineTheme()
	const bg =
		colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0]

	return (
		<AppShell
			header={{ height: 50 }}
			navbar={{
				width: 300,
				collapsed: { mobile: !opened, desktop: true },
				breakpoint: 'md',
			}}
			padding='md'
			transitionDuration={500}
			transitionTimingFunction='ease'
		>
			<NavigationBar data={navItems} />
			<Header opened={opened} toggle={toggle} navItems={navItems} />
			<AppShell.Main bg={bg}>{children}</AppShell.Main>
			<Footer />
		</AppShell>
	)
}

const NavigationBar: React.FC<{ data: NavItem[] }> = ({ data }) => (
	<AppShell.Navbar>
		<Navbar data={data} />
	</AppShell.Navbar>
)

const Header: React.FC<{
	opened: boolean;
	toggle: () => void;
	navItems: NavItem[];
}> = ({ opened, toggle, navItems }) => (
	<AppShell.Header>
		<LayoutHeader
			burger={
				<Burger
					opened={opened}
					onClick={toggle}
					hiddenFrom='md'
					size='sm'
					mr='xl'
				/>
			}
			navItems={navItems}
		/>
	</AppShell.Header>
)

const Footer: React.FC = () => (
	<Text
		component='footer'
		w='100%'
		size='sm'
		c='gray'
		bg='white'
		p='md'
		style={{
			borderRadius: 'var(--mantine-radius-md)',
			borderTop: '1px solid var(--app-shell-border-color)',
		}}
	>
		Copyright © 2025 Nikki ERP
	</Text>
)
