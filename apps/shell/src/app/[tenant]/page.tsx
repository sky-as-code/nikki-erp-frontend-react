'use client';

import { AppGridHeader } from '@components/AppGridHeader';
import { AppShell, Container, Text, useMantineColorScheme, useMantineTheme } from '@mantine/core';
import { TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconFilter } from '@tabler/icons-react';
import { FC } from 'react';

import { AppGrid } from '@/components/AppGrid/AppGrid';


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
			<AppShell.Footer>
				<Text w='full' size='sm' c='gray'>
					Copyright © 2023 Nikki ERP
				</Text>
			</AppShell.Footer>
		</AppShell>
	);
};

export default AppListPage;
