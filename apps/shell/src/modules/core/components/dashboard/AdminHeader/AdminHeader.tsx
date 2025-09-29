import { ActionIcon, Box, Drawer, Stack, TextInput } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconSearch, IconSettings } from '@tabler/icons-react'



import classes from './AdminHeader.module.css'

import { DirectionSwitcher } from '@/common/components/directionSwitcher/DirectionSwitcher'
import { MenuBar } from '@/common/components/MenuBar'
import { ThemeSwitcher } from '@/common/components/ThemeSwitcher/ThemeSwitcher'



interface Props {
	burger: React.ReactNode;
}

export function AdminHeader({ burger }: Props) {
	const [opened, { close, open }] = useDisclosure(false)

	return (
		<header className={classes.header}>
			{burger && burger}
			<Box size='sm' className='flex-1'></Box>
			<MenuBar items={[]} />
			<TextInput
				placeholder='Search'
				variant='filled'
				leftSection={<IconSearch size='0.8rem' />}
				style={{}}
			/>
			<ActionIcon onClick={open} variant='subtle'>
				<IconSettings size='1.25rem' />
			</ActionIcon>

			<Drawer
				opened={opened}
				onClose={close}
				title='Settings'
				position='right'
				transitionProps={{ duration: 0 }}
			>
				<Stack gap='lg'>
					<ThemeSwitcher />
					<DirectionSwitcher />
				</Stack>
			</Drawer>
		</header>
	)
}
