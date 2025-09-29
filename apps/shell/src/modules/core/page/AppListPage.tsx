import { AppShell, Container, useMantineColorScheme, useMantineTheme, Text, TextInput } from '@mantine/core'
import { IconFilter } from '@tabler/icons-react'


import { AppGrid } from '../components/apps/AppGrid/AppGrid'
import { AppGridHeader } from '../components/apps/AppGridHeader'


export const AppListPage: React.FC = () => {
    const { colorScheme } = useMantineColorScheme()
    const theme = useMantineTheme()

    const bg =
    colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0]

    return (
	<AppShell
		header={{ height: 60 }}
		padding='md'
		transitionDuration={500}
		transitionTimingFunction='ease'
        >

		<AppShell.Header>
			<AppGridHeader />
		</AppShell.Header>

		<AppShell.Main bg={bg} className='overflow-y-auto' h='100vh'>
			<Container mb={'xl'}>
				<TextInput
					placeholder='Filter'
					leftSection={<IconFilter size='1rem' />}
					mb='xl'
                />
				<AppGrid/>
			</Container>
			<Text
				component='footer'
				w='100%'
				size='sm'
				c='gray'
				bg='white'
				p='sm'
				style={{
                        borderRadius: 'var(--mantine-radius-md)',
                        borderTop: '1px solid var(--app-shell-border-color)',
                    }}
                >
				Copyright © 2025 Nikki ERP
			</Text>
		</AppShell.Main>
	</AppShell>
    )
}



