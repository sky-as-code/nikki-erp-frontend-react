import { navLinks } from '@common/envVars'
import {
	AppShell,
	Burger,
	Text,
	useMantineColorScheme,
	useMantineTheme,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import React from 'react'

import { Navbar } from '@/common/components/Navbar/Navbar'
import { AdminHeader } from '@/modules/core/components/dashboard/AdminHeader'



export const DashboardLayout: React.FC<React.PropsWithChildren> = ({ children }) =>{
	const [opened, { toggle }] = useDisclosure()
	const { colorScheme } = useMantineColorScheme()
	const theme = useMantineTheme()

	const bg =
        colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0]

	return (
		<AppShell
			header={{ height: 60 }}
			navbar={{
				width: 300,
				collapsed: { mobile: !opened, desktop: true },
				breakpoint: 'md',
			}}
			padding='md'
			transitionDuration={500}
			transitionTimingFunction='ease'
		>
			<AppShell.Navbar>
				<Navbar data={navLinks} />
			</AppShell.Navbar>
			<AppShell.Header>
				<AdminHeader
					burger={
						<Burger
							opened={opened}
							onClick={toggle}
							hiddenFrom='md'
							size='sm'
							mr='xl'
						/>
					}
				/>
			</AppShell.Header>
			<AppShell.Main bg={bg}>{children}</AppShell.Main>
			<AppShell.Footer>
				<Text w='full' size='sm' c='gray'>
					CopyRight © 2023 Jotyy
				</Text>
			</AppShell.Footer>
		</AppShell>
	)
}
