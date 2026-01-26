import { NavLink, Stack } from '@mantine/core';
import { MenuBarItem } from '@nikkierp/ui/appState';
import React from 'react';
import { Link } from 'react-router';

import {
	getPathWithPrefix,
	hasActiveNestedItemWithPrefix,
	isPathActiveWithPrefix,
} from './helper';


export type VerticalMenuBarProps = {
	items: MenuBarItem[];
	pathPrefix: string;
	currentPath: string;
};

export const VerticalMenuBar: React.FC<VerticalMenuBarProps> = ({
	items,
	pathPrefix,
	currentPath,
}) => {
	return (
		<Stack gap={0}>
			{items.map((item) => (
				<VerticalMenuItem
					key={item.label}
					item={item}
					pathPrefix={pathPrefix}
					currentPath={currentPath}
				/>
			))}
		</Stack>
	);
};

type VerticalMenuItemProps = {
	item: MenuBarItem;
	pathPrefix: string;
	currentPath: string;
};

const VerticalMenuItem: React.FC<VerticalMenuItemProps> = ({
	item,
	pathPrefix,
	currentPath,
}) => {
	const hasSubItems = item.items && item.items.length > 0;
	const isActive = item.link
		? isPathActiveWithPrefix(item.link, currentPath, pathPrefix)
		: false;
	const hasActiveChild = hasSubItems
		? item.items!.some(subItem =>
			hasActiveNestedItemWithPrefix(subItem, currentPath, pathPrefix),
		)
		: false;

	// Generate children NavLinks from config
	const children = hasSubItems
		? item.items!.map((subItem) => (
			<VerticalMenuItem
				key={subItem.label}
				item={subItem}
				pathPrefix={pathPrefix}
				currentPath={currentPath}
			/>
		))
		: undefined;

	const navLinkProps = {
		label: item.label,
		active: hasActiveChild || isActive,
		defaultOpened: hasActiveChild,
		childrenOffset: 24,
		variant: hasSubItems ? 'subtle' : 'light',
		styles: {
			root: {
				borderRadius: '10px',
			},
		},
	};

	// If item has link, use Link component for navigation
	if (item.link) {
		return (
			<NavLink
				{...navLinkProps}
				component={Link}
				to={getPathWithPrefix(item.link, pathPrefix)}
			>
				{children}
			</NavLink>
		);
	}

	// Simple NavLink without children or link
	return (
		<NavLink {...navLinkProps}>
			{children}
		</NavLink>
	);
};
