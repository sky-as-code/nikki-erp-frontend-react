import { Button, ButtonProps, Menu } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { Link, useHasEntitlement, useLockedItemProps } from '@nikkierp/ui/components';
import {
	isRibbonDropdown, RibbonBlock, RibbonDropdownItem, RibbonItem, RibbonLinkItem,
} from '@nikkierp/ui/menu';
import { IconChevronDown } from '@tabler/icons-react';
import clsx from 'clsx';
import React from 'react';

import classes from './Ribbon.module.css';
import { useRibbonContext } from './ribbonContext';
import { isRibbonItemActive } from './ribbonLayout';
import { RIBBON_DROPDOWN_PROPS } from './useDismissFloatingPanel';
import { getPathWithPrefix, isPathActiveWithPrefix, MENU_BAR_TEST_ID } from '../helper';
import menuClasses from '../MenuBar.module.css';


export function RibbonItemView({ item }: { item: RibbonItem }): React.ReactNode {
	return isRibbonDropdown(item) ? <RibbonDropdownButton item={item} /> : <RibbonLinkButton item={item} />;
}

/** The item as it lays out, without links, menus, test ids or entitlement lookups: for measuring. */
export function RibbonMeasureItem({ item }: { item: RibbonItem }): React.ReactNode {
	const { t } = useRibbonContext();
	return (
		<Button {...ribbonButtonProps(false)} tabIndex={-1} rightSection={dropdownChevron(item)}>
			{t(item.labelKey)}
		</Button>
	);
}

/** A whole block as one dropdown button, for a ribbon too narrow to lay its blocks out. */
export function CollapsedBlockMenu({ block }: { block: RibbonBlock }): React.ReactNode {
	const { currentPath, pathPrefix, t } = useRibbonContext();
	const isActive = block.items.some(item => isRibbonItemActive(item, currentPath, pathPrefix));

	return (
		<Menu position='bottom-start' trigger='click'>
			<Menu.Target>
				<Button
					{...ribbonButtonProps(isActive, 'ribbonBlock', block.titleKey)}
					rightSection={<IconChevronDown size={12} />}
				>
					{t(block.titleKey)}
				</Button>
			</Menu.Target>
			<Menu.Dropdown className={menuClasses.menuDropdown} {...RIBBON_DROPDOWN_PROPS}>
				{block.items.map(item => (isRibbonDropdown(item)
					? <CollapsedDropdownSub key={item.labelKey} item={item} />
					: <RibbonMenuLink key={item.labelKey} link={item} />
				))}
			</Menu.Dropdown>
		</Menu>
	);
}

function CollapsedDropdownSub({ item }: { item: RibbonDropdownItem }): React.ReactNode {
	const { currentPath, pathPrefix, t } = useRibbonContext();
	return (
		<Menu.Sub>
			<Menu.Sub.Target>
				<Menu.Sub.Item {...menuItemProps(isRibbonItemActive(item, currentPath, pathPrefix), item.labelKey)}>
					{t(item.labelKey)}
				</Menu.Sub.Item>
			</Menu.Sub.Target>
			<Menu.Sub.Dropdown {...RIBBON_DROPDOWN_PROPS}>
				{item.items.map(link => <RibbonMenuLink key={link.labelKey} link={link} />)}
			</Menu.Sub.Dropdown>
		</Menu.Sub>
	);
}

function RibbonLinkButton({ item }: { item: RibbonLinkItem }): React.ReactNode {
	const { currentPath, pathPrefix, t, onNavigate } = useRibbonContext();
	const lockedProps = useLockedEntryProps(item.requiredEntitlements);
	const isActive = isPathActiveWithPrefix(item.link, currentPath, pathPrefix);

	return (
		<Button
			{...ribbonButtonProps(isActive, 'ribbonItem', item.labelKey)}
			component={Link}
			isHistoryRoot
			to={getPathWithPrefix(item.link, pathPrefix)}
			onClick={onNavigate}
			{...lockedProps}
		>
			{t(item.labelKey)}
		</Button>
	);
}

function RibbonDropdownButton({ item }: { item: RibbonDropdownItem }): React.ReactNode {
	const { currentPath, pathPrefix, t } = useRibbonContext();
	const isActive = isRibbonItemActive(item, currentPath, pathPrefix);

	return (
		<Menu position='bottom-start' trigger='click'>
			<Menu.Target>
				<Button {...ribbonButtonProps(isActive, 'ribbonItem', item.labelKey)} rightSection={dropdownChevron(item)}>
					{t(item.labelKey)}
				</Button>
			</Menu.Target>
			<Menu.Dropdown className={menuClasses.menuDropdown} {...RIBBON_DROPDOWN_PROPS}>
				{item.items.map(link => <RibbonMenuLink key={link.labelKey} link={link} />)}
			</Menu.Dropdown>
		</Menu>
	);
}

function RibbonMenuLink({ link }: { link: RibbonLinkItem }): React.ReactNode {
	const { currentPath, pathPrefix, t, onNavigate } = useRibbonContext();
	const lockedProps = useLockedEntryProps(link.requiredEntitlements);

	return (
		<Menu.Item
			component={Link}
			isHistoryRoot
			to={getPathWithPrefix(link.link, pathPrefix)}
			onClick={onNavigate}
			{...menuItemProps(isPathActiveWithPrefix(link.link, currentPath, pathPrefix), link.labelKey)}
			{...lockedProps}
		>
			{t(link.labelKey)}
		</Menu.Item>
	);
}

/** Locked, never hidden: the same rule as the traditional menu bar. */
function useLockedEntryProps(required: RibbonLinkItem['requiredEntitlements']) {
	const decision = useHasEntitlement(required ?? []);
	const isLocked = !decision.isPending && !decision.allowed && (required?.length ?? 0) > 0;
	return useLockedItemProps(isLocked, decision.missing);
}

function dropdownChevron(item: RibbonItem): React.ReactNode {
	return isRibbonDropdown(item) ? <IconChevronDown size={12} /> : undefined;
}

function ribbonButtonProps(isActive: boolean, kind?: string, key?: string): ButtonProps {
	return {
		variant: 'subtle',
		c: 'var(--text-color)',
		size: 'xs',
		px: 'xs',
		fz: 'sm',
		fw: 'normal',
		justify: 'flex-start',
		className: clsx(classes.item, { [menuClasses.activeMenuItem]: isActive }),
		...(kind ? testAttrs(MENU_BAR_TEST_ID, kind, key) : {}),
	};
}

function menuItemProps(isActive: boolean, labelKey: string): React.ComponentProps<typeof Menu.Item> {
	return {
		className: clsx({ [menuClasses.activeMenuItem]: isActive }),
		styles: { itemLabel: { fontSize: 'var(--mantine-font-size-sm)' } },
		...testAttrs(MENU_BAR_TEST_ID, 'ribbonItem', labelKey),
	};
}
