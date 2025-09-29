import { ThemeSwitcher } from '@common/components/ThemeSwitcher/ThemeSwitcher'
import { UserAvatar } from '@common/components/UserAvatar/UserAvatar'
import {  Box, Breadcrumbs, Group } from '@mantine/core'

import classes from './AppGridHeader.module.css'

import { Logo } from '@/common/components/Logo/Logo'
import { OrgSwitchDropdown } from '@/modules/core/components/organization/OrgSwitchDropdown'


interface Props {
	burger?: React.ReactNode;
}

export function AppGridHeader({ burger }: Props) {
	return (
		<header className={classes.header}>
			{burger && burger}
			<Breadcrumbs separatorMargin='xs'>
				<Logo />
				<OrgSwitchDropdown dropdownWidth={300} />
			</Breadcrumbs>

			<Box style={{ flex: 1 }}></Box>

			<Group
				component='section'
				align='center'
				justify='flex-end'
				gap='sm'
			>
				<ThemeSwitcher />
				<UserAvatar/>
			</Group>
		</header>
	)
}


