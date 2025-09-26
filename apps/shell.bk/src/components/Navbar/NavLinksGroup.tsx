import {
	Box,
	Collapse,
	Group,
	ThemeIcon,
	UnstyledButton,
	useDirection,
} from '@mantine/core'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import classes from './NavLinksGroup.module.css'

import { useTenantUrl } from '@/common/context/TenantUrlProvider'

interface LinkItemProps {
	label: string;
	link: string;
	pathname: string;
}

interface IconBoxProps {
	icon: React.FC<any>;
	label: string;
}

interface ControlButtonProps extends IconBoxProps {
	opened: boolean;
	hasLinks: boolean;
	onClick: () => void;
}

interface NavLinksGroupProps {
	icon: React.FC<any>;
	label: string;
	link?: string;
	initiallyOpened?: boolean;
	links?: { label: string; link: string }[];
}

export function NavLinksGroup({
	icon,
	label,
	link,
	initiallyOpened,
	links,
}: NavLinksGroupProps) {
	const pathname = usePathname()
	const hasLinks = Array.isArray(links)
	const [opened, setOpened] = useState(initiallyOpened || false)
	const { getFullPath } = useTenantUrl()

	const items = (hasLinks ? links : []).map((link) => (
		<LinkItem
			key={link.label}
			label={link.label}
			link={getFullPath(link.link)}
			pathname={pathname}
		/>
	))

	return (
		<>
			{link ? (
				<NavLink
					icon={icon}
					label={label}
					link={getFullPath(link)}
					pathname={pathname}
				/>
			) : (
				<ControlButton
					icon={icon}
					label={label}
					opened={opened}
					hasLinks={hasLinks}
					onClick={() => hasLinks && setOpened((o) => !o)}
				/>
			)}
			{hasLinks ? <Collapse in={opened}>{items}</Collapse> : null}
		</>
	)
}

const LinkItem = ({ label, link, pathname }: LinkItemProps) => (
	<Link
		href={link}
		key={label}
		className={`${classes.link} ${link === pathname && classes.activeLink}`}
	>
		{label}
	</Link>
)

const IconBox = ({ icon: Icon, label }: IconBoxProps) => (
	<Box style={{ display: 'flex', alignItems: 'center' }}>
		<ThemeIcon variant='light' size={30}>
			<Icon size='1.1rem' />
		</ThemeIcon>
		<Box ml='md'>{label}</Box>
	</Box>
)

const ChevronButton = ({ opened, dir }: { opened: boolean; dir: string }) => {
	const ChevronIcon = dir === 'ltr' ? IconChevronRight : IconChevronLeft
	return (
		<ChevronIcon
			className={classes.chevron}
			size='1rem'
			stroke={1.5}
			style={{
				transform: opened ? `rotate(${dir === 'rtl' ? -90 : 90}deg)` : 'none',
			}}
		/>
	)
}

const ControlButton = ({
	icon,
	label,
	opened,
	hasLinks,
	onClick,
}: ControlButtonProps) => {
	const { dir } = useDirection()
	return (
		<UnstyledButton onClick={onClick} className={classes.control}>
			<Group gap={0} justify='space-between'>
				<IconBox icon={icon} label={label} />
				{hasLinks && <ChevronButton opened={opened} dir={dir} />}
			</Group>
		</UnstyledButton>
	)
}

const NavLink = ({
	link,
	pathname,
	icon,
	label,
}: NavLinksGroupProps & { pathname: string }) => (
	<Link
		href={link!}
		className={`${classes.control} ${
			link === pathname && classes.activeControl
		}`}
	>
		<Group gap={0} justify='space-between'>
			<IconBox icon={icon} label={label} />
		</Group>
	</Link>
)
