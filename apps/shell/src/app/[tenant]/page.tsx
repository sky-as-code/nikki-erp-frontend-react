'use client';

import { AppShell, Container, Text, useMantineColorScheme, useMantineTheme, Box } from '@mantine/core';
import { TextInput } from '@mantine/core';
import { IconFilter } from '@tabler/icons-react';
import { FC } from 'react';

import { AppGrid } from '@/components/AppGrid/AppGrid';
import { AppGridHeader } from '@/components/AppGridHeader';


const AppListPage: FC = () => {
	const { colorScheme } = useMantineColorScheme();
	const theme = useMantineTheme();

	const bg = colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0];

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
			<AppShell.Main bg={bg}>
				<Container size='lg'>
					<TextInput
						placeholder='Filter'
						leftSection={<IconFilter size='1rem' />}
						mb='xl'
					/>
					<AppGrid />
				</Container>
			</AppShell.Main>
			<Text component='footer'
				w='100%' size='sm' c='gray'
				bg='white' p='md'
				style={{
					borderRadius: 'var(--mantine-radius-md)',
					borderTop: '1px solid var(--app-shell-border-color)',
				}}
			>
				Copyright © 2023 Nikki ERP
			</Text>
		</AppShell>
	);
};

export default AppListPage;
