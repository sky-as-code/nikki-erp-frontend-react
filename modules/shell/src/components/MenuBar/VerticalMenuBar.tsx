import { NavLink, Stack } from '@mantine/core';
import { TranslateFn } from '@nikkierp/ui/i18n';
import { MenuItem } from '@nikkierp/ui/menu';
import React from 'react';
import { Link } from 'react-router';

import {
	getPathWithPrefix,
	hasActiveNestedItemWithPrefix,
	isPathActiveWithPrefix,
} from './helper';


export type VerticalMenuBarProps = {
	items: MenuItem[],
	pathPrefix: string,
	currentPath: string,
	/** Bound to the contributing module's namespace; items carry keys, not labels. */
	t: TranslateFn,
};

export const VerticalMenuBar: React.FC<VerticalMenuBarProps> = ({
	items,
	pathPrefix,
	currentPath,
	t,
}) => {
	return (
		<Stack gap={0}>
			{items.map((item) => (
				<VerticalMenuItem
					key={item.labelKey}
					item={item}
					pathPrefix={pathPrefix}
					currentPath={currentPath}
					t={t}
				/>
			))}
		</Stack>
	);
};

type VerticalMenuItemProps = {
	item: MenuItem,
	pathPrefix: string,
	currentPath: string,
	t: TranslateFn,
};

const VerticalMenuItem: React.FC<VerticalMenuItemProps> = ({
	item,
	pathPrefix,
	currentPath,
	t,
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
				key={subItem.labelKey}
				item={subItem}
				pathPrefix={pathPrefix}
				currentPath={currentPath}
				t={t}
			/>
		))
		: undefined;

	const navLinkProps = {
		label: t(item.labelKey),
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
