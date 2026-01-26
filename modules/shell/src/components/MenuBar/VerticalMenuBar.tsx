import { Button, Stack } from '@mantine/core';
import { MenuBarItem } from '@nikkierp/ui/appState';
import { IconChevronRight } from '@tabler/icons-react';
import clsx from 'clsx';
import React, { useState } from 'react';
import { Link } from 'react-router';

import {
	getPathWithPrefix,
	hasActiveNestedItemWithPrefix,
	isPathActiveWithPrefix,
} from './helper';
import classes from './MenuBar.module.css';



export type VerticalMenuBarProps = {
	items: MenuBarItem[];
	pathPrefix: string;
	currentPath: string;
	onItemClick?: (link?: string) => void;
};

export const VerticalMenuBar: React.FC<VerticalMenuBarProps> = ({
	items,
	pathPrefix,
	currentPath,
	onItemClick,
}) => {
	return (
		<Stack gap={0}>
			{items.map((item) => (
				<VerticalMenuItem
					key={item.label}
					item={item}
					level={0}
					pathPrefix={pathPrefix}
					currentPath={currentPath}
					onItemClick={onItemClick}
				/>
			))}
		</Stack>
	);
};

type VerticalMenuItemProps = {
	item: MenuBarItem;
	level: number;
	pathPrefix: string;
	currentPath: string;
	onItemClick?: (link?: string) => void;
};

const VerticalMenuItem: React.FC<VerticalMenuItemProps> = ({
	item,
	level,
	pathPrefix,
	currentPath,
	onItemClick,
}) => {
	const hasSubItems = item.items && item.items.length > 0;
	const isActive = item.link
		? isPathActiveWithPrefix(item.link, currentPath, pathPrefix)
		: false;
	const paddingLeft = level * 16;

	if (hasSubItems) {
		return (
			<VerticalMenuSection
				key={item.label}
				item={item}
				level={level}
				pathPrefix={pathPrefix}
				currentPath={currentPath}
				onItemClick={onItemClick}
			/>
		);
	}

	const buttonProps = {
		key: item.label,
		variant: 'subtle' as const,
		justify: 'flex-start' as const,
		fullWidth: true,
		pl: paddingLeft + 12,
		pr: 12,
		py: 8,
		c: 'var(--mantine-color-gray-7)',
		fw: 500,
		fz: 15,
		styles: { inner: { justifyContent: 'flex-start' } },
		className: clsx({ [classes.activeMenuItem]: isActive }),
		onClick: () => onItemClick?.(item.link),
	};

	if (item.link) {
		return (
			<Button
				{...buttonProps}
				component={Link}
				to={getPathWithPrefix(item.link, pathPrefix)}
			>
				{item.label}
			</Button>
		);
	}

	return (
		<Button {...buttonProps}>
			{item.label}
		</Button>
	);
};

type VerticalMenuSectionProps = {
	item: MenuBarItem;
	level: number;
	pathPrefix: string;
	currentPath: string;
	onItemClick?: (link?: string) => void;
};

const VerticalMenuSection: React.FC<VerticalMenuSectionProps> = ({
	item,
	level,
	pathPrefix,
	currentPath,
	onItemClick,
}) => {
	const [expanded, setExpanded] = useState(false);
	const hasActiveChild = item.items
		? item.items.some(subItem =>
			hasActiveNestedItemWithPrefix(subItem, currentPath, pathPrefix),
		)
		: false;
	const isActive = item.link
		? isPathActiveWithPrefix(item.link, currentPath, pathPrefix)
		: false;
	const paddingLeft = level * 16;

	const handleClick = () => {
		if (item.link) {
			onItemClick?.(item.link);
		}
		else {
			setExpanded(!expanded);
		}
	};

	const chevronStyle = {
		transform: expanded ? 'rotate(90deg)' : 'none',
		transition: 'transform 0.2s',
	};

	const buttonProps = {
		variant: 'subtle' as const,
		justify: 'space-between' as const,
		fullWidth: true,
		pl: paddingLeft + 12,
		pr: 12,
		py: 8,
		c: 'var(--mantine-color-gray-7)',
		fw: 500,
		fz: 15,
		rightSection: <IconChevronRight size={16} style={chevronStyle} />,
		styles: { inner: { justifyContent: 'space-between' } },
		onClick: handleClick,
	};

	return (
		<Stack gap={0}>
			{item.link ? (
				<Button
					{...buttonProps}
					className={clsx({ [classes.activeMenuItem]: isActive || hasActiveChild })}
					component={Link}
					to={getPathWithPrefix(item.link, pathPrefix)}
				>
					{item.label}
				</Button>
			) : (
				<Button
					{...buttonProps}
					className={clsx({ [classes.activeMenuItem]: hasActiveChild })}
				>
					{item.label}
				</Button>
			)}
			{expanded && item.items && (
				<Stack gap={0} pl={paddingLeft}>
					{item.items.map((subItem) => (
						<VerticalMenuItem
							key={subItem.label}
							item={subItem}
							level={level + 1}
							pathPrefix={pathPrefix}
							currentPath={currentPath}
							onItemClick={onItemClick}
						/>
					))}
				</Stack>
			)}
		</Stack>
	);
};

