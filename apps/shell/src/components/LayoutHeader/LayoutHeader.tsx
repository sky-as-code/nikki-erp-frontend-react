'use client';

import { useTenantUrl } from '@common/context/TenantUrlProvider';
import { Logo } from '@components/Logo/Logo';
import { Anchor, Box, Breadcrumbs, Button, Group, Stack, Text } from '@mantine/core';
import { ModuleSwitchDropdown } from '@modules/core/organization/ModuleSwitchDropdown';
import { IconApps } from '@tabler/icons-react';
import cls from 'classnames';
import Link from 'next/link';

import classes from './LayoutHeader.module.css';

import { MenuBar } from '@/components/MenuBar';
import { OrgSwitchDropdown } from '@/modules/core/organization/OrgSwitchDropdown';
import { NavItem } from '@/types/navItem';


export type LayoutHeaderProps = {
	burger: React.ReactNode,
	navItems: NavItem[],
};

export const LayoutHeader: React.FC<LayoutHeaderProps> = ({ burger, navItems }) => {
	const { getOrgPath } = useTenantUrl();

	return (
		<Stack gap='xs'>
			<Box
				className={cls(
					'flex flex-row items-center justify-start h-full',
					classes.header,
				)}
			>
				<Breadcrumbs separatorMargin='xs'>
					<OrgSwitchDropdown dropdownWidth={300} />
					<ModuleSwitchDropdown dropdownWidth={300} />
					{/* <Anchor component={Link} href={getOrgPath()} className='flex items-center'>
						<IconApps size={30} />
					</Anchor>
					<Text component='span' fw='bold' fz={'lg'} >
						Settings
					</Text> */}
				</Breadcrumbs>
				{/* <MenuBar items={navItems} /> */}
			</Box>
			<Group
				gap='xs'
				justify='space-between'
				className={cls(
					// 'flex flex-row items-center justify-start h-full',
					classes.header,
				)}
			>
				<Group
					gap='xs'
					justify='flex-start'
				>
					{burger}
					<Text component='span' fw='bold' fz='h3' >
						Current page
					</Text>
				</Group>
				<Group
					gap='xs'
					justify='flex-end'
				>
					<Button variant='filled'>Add</Button>
					<Button variant='outline'>Delete</Button>
				</Group>
			</Group>
		</Stack>
	);
};
