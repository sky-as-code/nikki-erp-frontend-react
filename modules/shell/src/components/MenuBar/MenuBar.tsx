import { Button, ButtonProps, Group, Menu } from '@mantine/core';
import { MenuBarItem, useMenuBarItems } from '@nikkierp/ui/appState';
import { useActiveOrgModule } from '@nikkierp/ui/appState/routingSlice';
import { IconChevronDown, IconDots } from '@tabler/icons-react';
import clsx from 'clsx';
import React from 'react';
import { Link, useLocation } from 'react-router';

import {
	getPathWithPrefix,
	hasActiveNestedItemWithPrefix,
	isPathActiveWithPrefix,
} from './helper';
import classes from './MenuBar.module.css';
import { VerticalMenuBar } from './VerticalMenuBar';


const MAX_VISIBLE_HORIZONTAL_ITEMS = 3;

export type MenuBarMode = 'horizontal' | 'vertical';

export type MenuBarProps = {
	mode?: MenuBarMode;
	onItemClick?: (link?: string) => void;
};


export function MenuBar({ mode = 'horizontal', onItemClick }: MenuBarProps): React.ReactNode {
	const menuBarItems = useMenuBarItems();
	const location = useLocation();
	const { orgSlug, moduleSlug } = useActiveOrgModule();
	const pathPrefix = `/${orgSlug}/${moduleSlug}`;

	const getPath = (link: string): string => getPathWithPrefix(link, pathPrefix);

	if (mode === 'vertical') {
		return (
			<VerticalMenuBar
				items={menuBarItems}
				pathPrefix={pathPrefix}
				currentPath={location.pathname}
				onItemClick={onItemClick}
			/>
		);
	}

	// Horizontal mode (default)
	const visibleItems = menuBarItems.slice(0, MAX_VISIBLE_HORIZONTAL_ITEMS);
	const overflowItems = menuBarItems.slice(MAX_VISIBLE_HORIZONTAL_ITEMS);

	return (
		<Group gap='xs'>
			{visibleItems.map((item: MenuBarItem) => (
				item.items ? (
					<NavMenu
						key={item.label}
						item={item}
						currentPath={location.pathname}
						pathPrefix={pathPrefix}
						getPath={getPath}
					/>
				) : (
					<Button
						key={item.label}
						size='md'
						px={'xs'}
						{...buttonProps(
							isPathActiveWithPrefix(
								item.link ?? '/',
								location.pathname,
								pathPrefix,
							),
						)}
						component={Link}
						to={getPath(item.link ?? '/')}
					>
						{item.label}
					</Button>
				)
			))}
			{overflowItems.length > 0 && (
				<OverflowMenu
					items={overflowItems}
					currentPath={location.pathname}
					pathPrefix={pathPrefix}
					getPath={getPath}
				/>
			)}
		</Group>
	);
}

// Horizontal Menu Components
type OverflowMenuProps = {
	items: MenuBarItem[];
	currentPath: string;
	pathPrefix: string;
	getPath: (link: string) => string;
};

function OverflowMenu({
	items,
	currentPath,
	pathPrefix,
	getPath,
}: OverflowMenuProps): React.ReactNode {
	return (
		<Menu position='bottom-start' trigger='click-hover'>
			<Menu.Target>
				<Button {...buttonProps(false)} rightSection={<IconChevronDown size={14} />}>
					<IconDots size={16} />
				</Button>
			</Menu.Target>
			<Menu.Dropdown className={classes.menuDropdown}>
				{items.map((item, index) => (
					<MenuItemRenderer
						key={index}
						item={item}
						currentPath={currentPath}
						pathPrefix={pathPrefix}
						getPath={getPath}
					/>
				))}
			</Menu.Dropdown>
		</Menu>
	);
}

type NavMenuProps = {
	item: MenuBarItem;
	currentPath: string;
	pathPrefix: string;
	getPath: (link: string) => string;
};

function NavMenu({
	item,
	currentPath,
	pathPrefix,
	getPath,
}: NavMenuProps): React.ReactNode {
	const hasActiveChild = item.items
		? item.items.some(subItem =>
			hasActiveNestedItemWithPrefix(subItem, currentPath, pathPrefix),
		)
		: false;

	return (
		<Menu position='bottom-start' trigger='click-hover'>
			<Menu.Target>
				<Button {...buttonProps(hasActiveChild)} rightSection={<IconChevronDown size={14} />} >
					{item.label}
				</Button>
			</Menu.Target>

			<Menu.Dropdown className={classes.menuDropdown}>
				{item.items?.map((subItem, index) => (
					<MenuItemRenderer
						key={index}
						item={subItem}
						currentPath={currentPath}
						pathPrefix={pathPrefix}
						getPath={getPath}
					/>
				))}
			</Menu.Dropdown>
		</Menu>
	);
}

function MenuItemRenderer({
	item,
	currentPath,
	pathPrefix,
	getPath,
}: NavMenuProps): React.ReactNode {
	const isActive = item.link
		? isPathActiveWithPrefix(item.link, currentPath, pathPrefix)
		: false;
	const hasActiveChild = item.items
		? item.items.some(subItem =>
			hasActiveNestedItemWithPrefix(subItem, currentPath, pathPrefix),
		)
		: false;

	if (item.items) {
		// Item has nested items, render as a submenu
		return (
			<Menu.Sub>
				<Menu.Sub.Target>
					{item.link ? (
						<Menu.Sub.Item
							component={Link}
							to={getPath(item.link)}
							{...itemProps(isActive || hasActiveChild)}
						>
							{item.label}
						</Menu.Sub.Item>
					) : (
						<Menu.Sub.Item
							{...itemProps(hasActiveChild)}
						>
							{item.label}
						</Menu.Sub.Item>
					)}
				</Menu.Sub.Target>

				<Menu.Sub.Dropdown>
					{item.items.map((nestedItem, nestedIndex) => (
						<MenuItemRenderer
							key={nestedIndex}
							item={nestedItem}
							currentPath={currentPath}
							pathPrefix={pathPrefix}
							getPath={getPath}
						/>
					))}
				</Menu.Sub.Dropdown>
			</Menu.Sub>
		);
	}

	// Item is a leaf node
	if (item.link) {
		return (
			<Menu.Item
				component={Link}
				to={getPath(item.link)}
				{...itemProps(isActive)}
			>
				{item.label}
			</Menu.Item>
		);
	}

	return (
		<Menu.Item {...itemProps(isActive)}>
			{item.label}
		</Menu.Item>
	);
}

function buttonProps(isActive: boolean): ButtonProps {
	return {
		variant: 'subtle',
		c: 'var(--text-color)',
		size: 'xs',
		px: 'xs',
		fz: 'sm',
		fw: 'normal',
		className: clsx({
			[classes.activeMenuItem]: isActive,
		}),
	};
}

type MenuSubItemProps = React.ComponentProps<typeof Menu.Sub.Item>;

function itemProps(isActive: boolean): MenuSubItemProps {
	return {
		className: clsx({
			[classes.activeMenuItem]: isActive,
		}),
		styles: {
			itemLabel: {
				fontSize: 'var(--mantine-font-size-sm)',
			},
		},
	};
}
