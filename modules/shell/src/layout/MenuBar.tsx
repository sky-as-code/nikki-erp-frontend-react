import { Button, Group, Menu } from '@mantine/core';
import { MenuBarItem, useMenuBarItems } from '@nikkierp/ui/appState';
import clsx from 'clsx';
import React from 'react';
import { Link, useLocation } from 'react-router';

import styles from './MenuBar.module.css';


export function MenuBar(): React.ReactNode {
	const menuBarItems = useMenuBarItems();
	const location = useLocation();

	return (
		<Group gap='xs'>
			{menuBarItems.map((item: MenuBarItem) => (
				item.items ? (
					<NavMenu key={item.label} item={item} currentPath={location.pathname} />
				) : (
					item.link ? (
						<Button
							key={item.label}
							// variant={isPathActive(item.link, location.pathname) ? 'filled' : 'subtle'}
							variant='subtle'
							c='dark'
							className={clsx({
								[styles.active]: isPathActive(item.link, location.pathname),
							})}
							component={Link}
							to={item.link}
						>
							{item.label}
						</Button>
					) : (
						<Button
							key={item.label}
							variant='subtle'
						>
							{item.label}
						</Button>
					)
				)
			))}
		</Group>
	);
}

type NavMenuProps = {
	item: MenuBarItem;
	currentPath: string;
};

const NavMenu: React.FC<NavMenuProps> = ({ item, currentPath }) => {
	const hasActiveChild = item.items?.some(subItem =>
		isPathActive(subItem.link || '', currentPath) ||
		hasActiveNestedItem(subItem, currentPath),
	) || false;

	return (
		<Menu width={200} position='bottom-start' trigger='click-hover'>
			<Menu.Target>
				<Button
					variant='subtle'
					className={clsx({
						[styles.active]: hasActiveChild,
					})}
					c='dark'
				>
					{item.label}
				</Button>
			</Menu.Target>

			<Menu.Dropdown>
				{item.items?.map((subItem, index) => (
					<MenuItemRenderer key={index} item={subItem} currentPath={currentPath} />
				))}
			</Menu.Dropdown>
		</Menu>
	);
};

type MenuItemRendererProps = {
	item: MenuBarItem;
	currentPath: string;
};

const MenuItemRenderer: React.FC<MenuItemRendererProps> = ({ item, currentPath }) => {
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
							to={item.link}
							className={clsx({
								[styles.active]: isActive || hasActiveChild,
							})}
						>
							{item.label}
						</Menu.Sub.Item>
					) : (
						<Menu.Sub.Item
							className={clsx({
								[styles.active]: hasActiveChild,
							})}
						>
							{item.label}
						</Menu.Sub.Item>
					)}
				</Menu.Sub.Target>

				<Menu.Sub.Dropdown>
					{item.items.map((nestedItem, nestedIndex) => (
						<MenuItemRenderer key={nestedIndex} item={nestedItem} currentPath={currentPath} />
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
				to={item.link}
				className={clsx({
					[styles.active]: isActive,
				})}
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
};

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