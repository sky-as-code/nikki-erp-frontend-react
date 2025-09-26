'use client'

import { useTenantUrl } from '@common/context/TenantUrlProvider'
import { Logo } from '@components/Logo/Logo'
import {
	ActionIcon,
	Anchor,
	Box,
	Breadcrumbs,
	Button,
	Group,
	Stack,
	Text,
} from '@mantine/core'
import { ModuleSwitchDropdown } from '@modules/core/organization/ModuleSwitchDropdown'
import {
	IconApps,
	IconFilter,
	IconLayoutDashboard,
	IconList,
	IconPlus,
	IconRefresh,
	IconSettings,
} from '@tabler/icons-react'
import cls from 'clsx'
import Link from 'next/link'

import classes from './LayoutHeader.module.css'

import { MenuBar } from '@/components/MenuBar'
import { OrgSwitchDropdown } from '@/modules/core/organization/OrgSwitchDropdown'
import { NavItem } from '@/types/navItem'

export type LayoutHeaderProps = {
	burger: React.ReactNode;
	navItems: NavItem[];
}

export const LayoutHeader: React.FC<LayoutHeaderProps> = ({
	burger,
	navItems,
}) => {
	const { getOrgPath } = useTenantUrl()

	return (
		<Box
			className={cls(
				'flex flex-row items-center justify-start h-full',
				classes.headerRow,
				classes.menuBar
			)}
		>
			<Breadcrumbs separatorMargin='xs'>
				<OrgSwitchDropdown dropdownWidth={300} />
				<ModuleSwitchDropdown dropdownWidth={300} />
			</Breadcrumbs>
			<MenuBar items={navItems} />
		</Box>
	)
}
