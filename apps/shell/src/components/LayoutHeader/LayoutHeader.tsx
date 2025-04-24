'use client';

import { Logo } from '@components/Logo/Logo';
import { Anchor, Box, Breadcrumbs, Group, Stack, Text } from '@mantine/core';
import { IconApps } from '@tabler/icons-react';
import cls from 'classnames';
import Link from 'next/link';

import classes from './LayoutHeader.module.css';

import { useTenant } from '@/common/context/TenantProvider';
import { MenuBar } from '@/components/MenuBar';
import { OrgSwitchDropdown } from '@/modules/core/organization/OrgSwitchDropdown';
import { NavItem } from '@/types/navItem';


export type LayoutHeaderProps = {
	burger: React.ReactNode,
	navItems: NavItem[],
};

export const LayoutHeader: React.FC<LayoutHeaderProps> = ({ burger, navItems }) => {
	const { getOrgPath } = useTenant();

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
					<Anchor component={Link} href={getOrgPath()} className='flex items-center'>
						<IconApps size={30} />
					</Anchor>
					<Text component='span' fw='bold' fz={'lg'} >
						Settings
					</Text>
					<Anchor component={Link} href='#'>Parent page</Anchor>
					<Anchor component={Link} href='#'>Current page</Anchor>
				</Breadcrumbs>
				{/* <MenuBar items={navItems} /> */}
			</Box>
			<Group
				gap='xs'
				justify='flex-start'
				className={cls(
					// 'flex flex-row items-center justify-start h-full',
					classes.header,
				)}
			>
				{burger}
				<Text component='span' fw='bold' fz='h3' >
					Current page
				</Text>
			</Group>
		</Stack>
	);
};
