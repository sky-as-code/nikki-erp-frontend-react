import { Avatar, Box, Breadcrumbs, Combobox, Group, Input, InputBase, Stack, useCombobox, useMantineColorScheme, useMantineTheme } from '@mantine/core';
import { MicroAppMetadata } from '@nikkierp/ui/microApp';
import { IconUserFilled } from '@tabler/icons-react';
import clsx from 'clsx';
import React from 'react';
import { Outlet } from 'react-router';

import { MenuBar } from './MenuBar';
import classes from './RootLayout.module.css';


export type RootLayoutProps = {
	microApps: MicroAppMetadata[];
};

export const RootLayout: React.FC<RootLayoutProps> = () => {

	const { colorScheme } = useMantineColorScheme();
	const theme = useMantineTheme();

	const bg = colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0];

	return (
		<Stack
			component='div'
			// bg={backgroundColor}
			bg={bg}
			gap={0}
			className='module-layout h-screen'
		>
			<Header />
			<Box component='main'>
				<Outlet />
			</Box>
		</Stack>
	);
};


const Header: React.FC = () => {
	// const { isMobile } = useUIState();

	// if (isMobile) return null;

	return (
		<Group
			component='header'
			align='center'
			justify='space-between'
			gap={0}
			className={clsx(
				'w-full h-[50px] shrink-0 z-100 px-4',
				classes.headerRow,
				classes.menuBar,
			)}
		>
			<Group
				component='section'
				align='center'
				justify='flex-start'
				gap={0}
				className={'flex flex-row items-center justify-start'}
			>
				<Breadcrumbs separatorMargin='xs'>
					<OrgSwitchDropdown />
					{/* <OrgSwitchDropdown dropdownWidth={300} />
					<ModuleSwitchDropdown dropdownWidth={300} /> */}
				</Breadcrumbs>
				{/* <MenuBar items={navItems} /> */}
				<MenuBar />
			</Group>
			<Group component='section' align='center' justify='flex-end' gap='sm'>
				<Avatar size={35}>
					<IconUserFilled />
				</Avatar>
			</Group>
		</Group>
	);
};

const groceries = ['🍎 Apples', '🍌 Bananas', '🥦 Broccoli', '🥕 Carrots', '🍫 Chocolate'];

const OrgSwitchDropdown: React.FC = () => {
	const combobox = useCombobox({
		onDropdownClose: () => combobox.resetSelectedOption(),
	});

	const [value, setValue] = React.useState<string | null>(null);

	const options = groceries.map((item) => (
		<Combobox.Option value={item} key={item}>
			{item}
		</Combobox.Option>
	));

	return (
		<Combobox
			store={combobox}
			onOptionSubmit={(val) => {
				setValue(val);
				combobox.closeDropdown();
			}}
		>
			<Combobox.Target>
				<InputBase
					component='button'
					type='button'
					pointer
					rightSection={<Combobox.Chevron />}
					rightSectionPointerEvents='none'
					onClick={() => combobox.toggleDropdown()}
				>
					{value || <Input.Placeholder>Pick value</Input.Placeholder>}
				</InputBase>
			</Combobox.Target>

			<Combobox.Dropdown>
				<Combobox.Options>{options}</Combobox.Options>
			</Combobox.Dropdown>
		</Combobox>
	);
};