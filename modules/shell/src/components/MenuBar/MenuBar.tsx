import { Button, ButtonProps, Group, Menu } from '@mantine/core';
import { useShellMenu } from '@nikkierp/shell/microApp';
import { useActiveOrgModule } from '@nikkierp/shell/routing';
import { TranslateFn, useTranslate } from '@nikkierp/ui/i18n';
import { MenuItem } from '@nikkierp/ui/menu';
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


const MAX_VISIBLE_HORIZONTAL_ITEMS = 5;

export type MenuBarMode = 'horizontal' | 'vertical';

export type MenuBarProps = {
	mode?: MenuBarMode,
};


/**
 * Renders the menu the *active* micro-app registered with the host menu registry.
 *
 * Items carry i18n keys rather than labels (registration happens in `init`, outside
 * React), so every leaf is translated here at render time. Do not pre-map the tree:
 * that allocates a new array per render for no benefit.
 */
export function MenuBar({ mode = 'horizontal' }: MenuBarProps): React.ReactNode {
	const location = useLocation();
	const { orgSlug, moduleSlug } = useActiveOrgModule();
	const menu = useShellMenu(moduleSlug);
	const t = useTranslate(menu?.translationNs ?? 'common');
	const pathPrefix = `/${orgSlug}/${moduleSlug}`;

	const getPath = (link: string): string => getPathWithPrefix(link, pathPrefix);

	// The active module has not registered a menu (not loaded yet, or contributes none).
	if (!menu || menu.items.length === 0) {
		return null;
	}

	if (mode === 'vertical') {
		return (
			<VerticalMenuBar
				items={menu.items}
				pathPrefix={pathPrefix}
				currentPath={location.pathname}
				t={t}
			/>
		);
	}

	return (
		<Group gap='xs'>
			{menu.items.slice(0, MAX_VISIBLE_HORIZONTAL_ITEMS).map((item: MenuItem) => (
				item.items ? (
					<NavMenu
						key={item.labelKey}
						item={item}
						currentPath={location.pathname}
						pathPrefix={pathPrefix}
						getPath={getPath}
						t={t}
					/>
				) : (
					<Button
						key={item.labelKey}
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
						{t(item.labelKey)}
					</Button>
				)
			))}
			{menu.items.length > MAX_VISIBLE_HORIZONTAL_ITEMS && (
				<OverflowMenu
					items={menu.items.slice(MAX_VISIBLE_HORIZONTAL_ITEMS)}
					currentPath={location.pathname}
					pathPrefix={pathPrefix}
					getPath={getPath}
					t={t}
				/>
			)}
		</Group>
	);
}

// Horizontal Menu Components
type OverflowMenuProps = {
	items: MenuItem[],
	currentPath: string,
	pathPrefix: string,
	getPath: (link: string) => string,
	t: TranslateFn,
};

function OverflowMenu({
	items,
	currentPath,
	pathPrefix,
	getPath,
	t,
}: OverflowMenuProps): React.ReactNode {
	const hasActiveChild = items.some(subItem =>
		hasActiveNestedItemWithPrefix(subItem, currentPath, pathPrefix),
	);

	return (
		<Menu position='bottom-start' trigger='click-hover'>
			<Menu.Target>
				<Button {...buttonProps(hasActiveChild)} rightSection={<IconChevronDown size={14} />}>
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
						t={t}
					/>
				))}
			</Menu.Dropdown>
		</Menu>
	);
}

type NavMenuProps = {
	item: MenuItem,
	currentPath: string,
	pathPrefix: string,
	getPath: (link: string) => string,
	t: TranslateFn,
};

function NavMenu({
	item,
	currentPath,
	pathPrefix,
	getPath,
	t,
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
					{t(item.labelKey)}
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
						t={t}
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
	t,
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
							{t(item.labelKey)}
						</Menu.Sub.Item>
					) : (
						<Menu.Sub.Item
							{...itemProps(hasActiveChild)}
						>
							{t(item.labelKey)}
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
							t={t}
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
				{t(item.labelKey)}
			</Menu.Item>
		);
	}

	return (
		<Menu.Item {...itemProps(isActive)}>
			{t(item.labelKey)}
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
