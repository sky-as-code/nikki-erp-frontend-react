'use client';

import { Box } from '@mantine/core';
import { IconApps, IconCaretLeftFilled } from '@tabler/icons-react';
import cls from 'classnames';
import Link from 'next/link';

import classes from './LayoutHeader.module.css';

import { useTenant } from '@/common/context/TenantProvider';
import { MenuBar } from '@/components/MenuBar';
import { NavItem } from '@/types/navItem';


export type LayoutHeaderProps = {
	burger: React.ReactNode,
	navItems: NavItem[],
};

export const LayoutHeader: React.FC<LayoutHeaderProps> = ({ burger, navItems }) => {
	const { getOrgPath } = useTenant();

	return (
		<Box
			className={cls(
				'flex flex-row items-center justify-start',
				classes.header,
			)}
		>
			{burger}
			<Link href={getOrgPath()} className='flex items-center'>
				<IconCaretLeftFilled size={20} /> <IconApps size={30} />
			</Link>
			<MenuBar items={navItems} />
		</Box>
	);
};
