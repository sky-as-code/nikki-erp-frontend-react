'use client';

import { ActionIcon, Box, Drawer, Stack, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { OrgSwitchDropdown } from '@modules/core/organization/OrgSwitchDropdown';
import { IconSearch, IconSettings } from '@tabler/icons-react';


import { DirectionSwitcher } from '../directionSwitcher/DirectionSwitcher';
import { Logo } from '../Logo/Logo';
import { ThemeSwitcher } from '../ThemeSwitcher/ThemeSwitcher';

import classes from './AppGridHeader.module.css';


interface Props {
	burger?: React.ReactNode;
}

export function AppGridHeader({ burger }: Props) {
	const [opened, { close, open }] = useDisclosure(false);

	return (
		<header className={classes.header}>
			{burger && burger}
			<Logo />
			<Box style={{ flex: 1 }}></Box>
			<OrgSwitchDropdown dropdownWidth={300} />
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
	);
}
