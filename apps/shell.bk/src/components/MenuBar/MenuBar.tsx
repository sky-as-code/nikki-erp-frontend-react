'use client'

import {
	Group,
	Button,
	rem,
	Box,
	Container,
	Text,
} from '@mantine/core'
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react'
import Link from 'next/link'
import React from 'react'

import { useTenantUrl } from '@/common/context/TenantUrlProvider'
import { Menu } from '@/components/mantine/Menu'
import { NavItem } from '@/types/navItem'


export type MenuBarProps = {
	items: NavItem[]
}

export const MenuBar: React.FC<MenuBarProps> = ({ items }) => {
	const { getFullPath } = useTenantUrl()

	return (
		<Group visibleFrom='md' justify='space-between' gap='xs'>
			<Button.Group className='my-btn-group'>
				{items.map((item) => (
					item.items ? (
						<NavMenu key={item.label} item={item} />
					) : (
						<Button
							key={item.label}
							variant='subtle'
							size='compact-md'
							className='font-normal box-content'
							radius={0}
							pt='xs' pb='xs'
							component={Link}
							href={getFullPath(item.link || '#')}
						>
							{item.label}
						</Button>
					)
				))}
			</Button.Group>
		</Group>
	)
}

const NavMenu: React.FC<{ item: NavItem }> = ({ item }) => {
	const { getFullPath } = useTenantUrl()

	return (
		<Menu
			trigger='click' openDelay={200} closeDelay={200}
			position='bottom-start' withArrow arrowPosition='center'
			transitionProps={{ transition: 'fade-down', duration: 300 }}
			loop={false} withinPortal={false} trapFocus={false}
			menuItemTabIndex={0} offset={0}

			shadow='md' width={200}
		>
			<Menu.Target>
				<Button
					variant='subtle'
					size='compact-md'
					rightSection={<IconChevronDown style={{ width: rem(16) }} />}
					className='font-normal box-content'
					radius={0}
					pt='xs' pb='xs'
				>
					{item.label}
				</Button>
			</Menu.Target>
			<Menu.Dropdown closeOnMouseLeave={false}>
				{item.items?.map((link, i) => {
					if (link.items) {
						return (
							<NestedMenu
								key={i}
								items={link.items}
								parent={
									<Menu.Item
										key={link.label}
										rightSection={<IconChevronRight style={{ width: rem(16) }} />}
									>
										{link.label}
									</Menu.Item>
								} />
						)
					}
					return (
						<Menu.Item
							key={link.link}
							component={Link}
							href={getFullPath(link.link!)}
						>
							{link.label}
						</Menu.Item>
					)
				})}
			</Menu.Dropdown>
		</Menu>
	)
}


const NestedMenu: React.FC<{ items: NavItem[], parent: React.ReactNode }> = ({ items, parent }) => {
	const { getFullPath } = useTenantUrl()

	return (
		<Menu
			trigger='click-hover'
			openDelay={200} closeDelay={200}
			position='right-start' withArrow arrowPosition='center'
			loop={false} withinPortal={false} trapFocus={false}
			menuItemTabIndex={0} offset={-30}
		>
			<Menu.Target>
				{parent}
			</Menu.Target>

			<Menu.Dropdown closeOnMouseLeave={false}>
				{items.map((subItem) => {
					if (subItem.specialFeture === '$$recent$$') {
						return (
							<React.Fragment
								key={subItem.specialFeture}
							>
								<Menu.Divider />
								<Menu.Label>Recent viewed</Menu.Label>
								<Menu.Item
									key='1'
									component={Link}
									href='#'
								>
									Recent #1
								</Menu.Item>
								<Menu.Item
									key='2'
									component={Link}
									href='#'
								>
									Recent #2
								</Menu.Item>
							</React.Fragment>
						)
					}
					return (<Menu.Item
						key={subItem.link}
						component={Link}
						href={getFullPath(subItem.link!)}
					>
						{subItem.label}
					</Menu.Item>)
				})}
			</Menu.Dropdown>
		</Menu>
	)
}
