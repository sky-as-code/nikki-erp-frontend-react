import { Button, ButtonProps, Group, Menu } from '@mantine/core';
import { MenuBarItem, useMenuBarItems } from '@nikkierp/ui/appState';
import { useActiveOrgModule } from '@nikkierp/ui/appState/routingSlice';
import clsx from 'clsx';
import React from 'react';
import { Link, useLocation } from 'react-router';

import styles from './MenuBar.module.css';


export function MenuBar(): React.ReactNode {
	const menuBarItems = useMenuBarItems();
	const location = useLocation();
	const { orgSlug, moduleSlug } = useActiveOrgModule();
	const pathPrefix = `/${orgSlug}/${moduleSlug}`;

	const getPath = (link: string): string => {
		if (link.startsWith('/')) return `${pathPrefix}${link}`;
		return link;
	};

	return (
		<Group gap='xs'>
			{menuBarItems.map((item: MenuBarItem) => (
				item.items ? (
					<NavMenu
						key={item.label} item={item}
						currentPath={location.pathname}
						getPath={getPath}
					/>
				) : (
					<Button
						key={item.label}
						// variant={isPathActive(item.link, location.pathname) ? 'filled' : 'subtle'}
						{...buttonProps(isPathActive(item.link ?? '/', location.pathname))}
						component={Link}
						to={getPath(item.link ?? '/')}
					>
						{item.label}
					</Button>
				)
			))}
		</Group>
	);
}

type NavMenuProps = {
	item: MenuBarItem;
	currentPath: string;
	getPath: (link: string) => string;
};

function NavMenu({ item, currentPath, getPath }: NavMenuProps): React.ReactNode {
	const hasActiveChild = item.items?.some(subItem =>
		isPathActive(subItem.link || '', currentPath) ||
		hasActiveNestedItem(subItem, currentPath),
	) || false;

	return (
		<Menu width={200} position='bottom-start' trigger='click-hover'>
			<Menu.Target>
				<Button
					{...buttonProps(hasActiveChild)}
				>
					{item.label}
				</Button>
			</Menu.Target>

			<Menu.Dropdown>
				{item.items?.map((subItem, index) => (
					<MenuItemRenderer
						key={index} item={subItem}
						currentPath={currentPath} getPath={getPath}
					/>
				))}
			</Menu.Dropdown>
		</Menu>
	);
};

function MenuItemRenderer({ item, currentPath, getPath }: NavMenuProps): React.ReactNode {
	const isActive = item.link ? isPathActive(item.link, currentPath) : false;
	const hasActiveChild = item.items?.some(subItem =>
		isPathActive(subItem.link || '', currentPath) ||
		hasActiveNestedItem(subItem, currentPath),
	) || false;

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
							key={nestedIndex} item={nestedItem}
							currentPath={currentPath} getPath={getPath}
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
		<Menu.Item>
			{item.label}
		</Menu.Item>
	);
}

function buttonProps(isActive: boolean): ButtonProps {
	return {
		variant: 'subtle',
		c: 'dark',
		size: 'md',
		className: clsx({
			[styles.active]: isActive,
		}),
	};
}

type MenuSubItemProps = React.ComponentProps<typeof Menu.Sub.Item>;

function itemProps(isActive: boolean): MenuSubItemProps {
	return {
		className: clsx({
			[styles.active]: isActive,
		}),
		styles: {
			itemLabel: {
				fontSize: 'var(--mantine-font-size-md)',
			},
		},
	};
}

// Helper function to normalize a path (ensure it starts with /)
function normalizePath(path: string): string {
	if (!path) return '/';
	// If it already starts with /, return as is
	if (path.startsWith('/')) return path;
	// Otherwise, add leading /
	return `/${path}`;
}

// Helper function to check if a path is active
function isPathActive(link: string, currentPath: string): boolean {
	if (!link) return false;

	// Normalize both paths to ensure consistent comparison
	const normalizedLink = normalizePath(link);
	const normalizedCurrentPath = normalizePath(currentPath);

	// Exact match
	if (normalizedLink === normalizedCurrentPath) return true;

	// Check if current path starts with the link (for nested routes)
	if (normalizedCurrentPath.startsWith(normalizedLink) && normalizedLink !== '/') {
		// Ensure we're matching at a path segment boundary
		const nextChar = normalizedCurrentPath[normalizedLink.length];
		return nextChar === undefined || nextChar === '/' || nextChar === '?';
	}
	return false;
}

// Helper function to check if any nested item is active
function hasActiveNestedItem(item: MenuBarItem, currentPath: string): boolean {
	if (item.link && isPathActive(item.link, currentPath)) {
		return true;
	}
	if (item.items) {
		return item.items.some(subItem => hasActiveNestedItem(subItem, currentPath));
	}
	return false;
}