'use client';

import {
	Group,
	Menu,
	Button,
	rem,
	Box,
	Container,
} from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import Link from 'next/link';

import { useTenant } from '@/common/context/TenantProvider';
import { NavItem } from '@/types/navItem';


export type MenuBarProps = {
	items: NavItem[]
};

export const MenuBar: React.FC<MenuBarProps> = ({ items }) => {
	const { getFullPath } = useTenant();

	return (
		<Box visibleFrom='md'>
			<Container size='lg'>
				<Group justify='space-between'>
					<Group gap='md'>
						{items.map((item) => (
							item.links ? (
								<NavMenu key={item.label} item={item} />
							) : (
								<Button
									key={item.label}
									variant='subtle'
									leftSection={item.icon && <item.icon size={16} />}
									component={Link}
									href={getFullPath(item.link || '#')}
								>
									{item.label}
								</Button>
							)
						))}
					</Group>
				</Group>
			</Container>
		</Box>
	);
};

const NavMenu: React.FC<{ item: NavItem }> = ({ item }) => {
	const { getFullPath } = useTenant();

	return (
		<Menu shadow='md' width={200} position='bottom-start'>
			<Menu.Target>
				<Button
					variant='subtle'
					leftSection={item.icon && <item.icon size={16} />}
					rightSection={<IconChevronDown style={{ width: rem(16) }} />}
				>
					{item.label}
				</Button>
			</Menu.Target>
			<Menu.Dropdown>
				{item.links?.map((link) => {
					return (
						<Menu.Item
							key={link.link}
							component={Link}
							href={getFullPath(link.link)}
						>
							{link.label}
						</Menu.Item>
					);
				})}
			</Menu.Dropdown>
		</Menu>
	);
};
