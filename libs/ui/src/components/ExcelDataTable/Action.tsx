import { Menu, Tooltip } from '@mantine/core';
import { commandAttrs } from '@nikkierp/viewengine/core';
import { IconDots, IconRefresh } from '@tabler/icons-react';
import React from 'react';
import { Link } from 'react-router-dom';

import { ActionsContext, useActionsContext } from './actionsContext';
import { useExcelDataTableContext } from './context';
import { useTranslate } from '../../i18n';
import { useCommandBus } from '../../microApp/MicroAppProvider';
import { Button, LinkButton } from '../Button';
import { useLockedItemProps } from '../ErrorState';

import type { SearchItem } from './types';
import type { LockedProps } from '../Button';


export type ActionSelectionMode = 'single' | 'multiple';

export type ActionProps = LockedProps & {
	label: string,
	icon?: React.ReactNode,
	/** Icon only, with the label as tooltip and `aria-label`. Default false. */
	iconOnly?: boolean,
	/** Navigates instead of publishing; relative paths resolve against the current route. */
	href?: string,
	/** Published as `{name, payload: {ids}}`, then the table refreshes. */
	command?: string,
	onClick?: (selectedItems: SearchItem[]) => void,
	/**
	 * Shown only while rows are selected: `single` for exactly one, `multiple` for one or more.
	 * Absent, the action acts on the table rather than on rows, and shows only while nothing is
	 * selected.
	 */
	selectionMode?: ActionSelectionMode,
	testId?: string,
};

/**
 * Selecting rows swaps the bar rather than adding to it, as the v1 table did.
 *
 * An action with no selection mode acts on the table, not on rows — Refresh, Create — and has no
 * meaning while a selection is pending, so it steps aside instead of sitting next to the actions
 * that do act on the selected rows.
 */
export function isActionVisible(selectionMode: ActionSelectionMode | undefined, selectedCount: number): boolean {
	if (!selectionMode) {
		return selectedCount === 0;
	}
	return selectionMode === 'single' ? selectedCount === 1 : selectedCount >= 1;
}

function useActionTrigger(props: Pick<ActionProps, 'command' | 'onClick'>) {
	const { refresh } = useExcelDataTableContext();
	const commandBus = useCommandBus();
	const { selectedItems } = useActionsContext();
	return React.useCallback(() => {
		props.onClick?.(selectedItems);
		if (props.command) {
			const ids = selectedItems.map(item => item.id).filter(Boolean) as string[];
			void commandBus.publish({ name: props.command, payload: { ids } }).then(refresh);
		}
	}, [commandBus, props, refresh, selectedItems]);
}

/** One action of the bar: a button in the bar, a menu item inside a `CollapsedActions` or the compact fold. */
export function Action(props: ActionProps) {
	const { selectedItems, inMenu } = useActionsContext();
	const trigger = useActionTrigger(props);
	if (!isActionVisible(props.selectionMode, selectedItems.length)) {
		return null;
	}
	return inMenu ? <ActionMenuItem {...props} onTrigger={trigger} /> : <ActionButton {...props} onTrigger={trigger} />;
}

type TriggerProps = ActionProps & { onTrigger: () => void };

function ActionButton(props: TriggerProps) {
	const { tid } = useExcelDataTableContext();
	const { label, icon, iconOnly = false, href, command, locked, lockedMissing, onTrigger } = props;
	const shared = {
		locked,
		lockedMissing,
		'aria-label': iconOnly ? label : undefined,
		leftSection: iconOnly ? undefined : icon,
		...commandAttrs(command),
		...tid.action(props),
	};
	// An icon-only button carries its label in the tooltip and `aria-label`; every other button
	// shows the text, with the icon beside it via `leftSection`.
	const content = iconOnly ? icon : label;
	const button = href
		? <LinkButton to={href} {...shared}>{content}</LinkButton>
		: <Button onClick={onTrigger} {...shared}>{content}</Button>;
	return iconOnly ? <Tooltip label={label}>{button}</Tooltip> : button;
}

function ActionMenuItem(props: TriggerProps) {
	const { tid } = useExcelDataTableContext();
	const lockedProps = useLockedItemProps(props.locked, props.lockedMissing);
	const shared = { leftSection: props.icon, ...commandAttrs(props.command), ...tid.action(props) };
	// A navigating entry is a real link so it stays middle-clickable; the locked props spread last
	// because their onClick cancels the navigation.
	if (props.href) {
		return <Menu.Item component={Link} to={props.href} {...shared} {...lockedProps}>{props.label}</Menu.Item>;
	}
	return <Menu.Item onClick={props.onTrigger} {...shared} {...lockedProps}>{props.label}</Menu.Item>;
}

export type ActionRefreshProps = {
	/** Published with the current search request when the Provider has no `onRefresh`. */
	command?: string,
	iconOnly?: boolean,
};

/**
 * Re-runs the search. A Provider fed by a search hook passes `onRefresh`, which is preferred; a
 * page that routes data through a store command passes `command` instead, and the current request
 * is published on it.
 */
export function ActionRefresh({ command, iconOnly = false }: ActionRefreshProps) {
	const t = useTranslate('common');
	const { refresh, searchRequest } = useExcelDataTableContext();
	const commandBus = useCommandBus();
	const onClick = React.useCallback(() => {
		if (command) {
			void commandBus.publish({ name: command, payload: searchRequest }).then(refresh);
		}
		else {
			refresh();
		}
	}, [command, commandBus, refresh, searchRequest]);
	return (
		<Action
			label={t('action.refresh')}
			icon={<IconRefresh size={16} />}
			iconOnly={iconOnly}
			onClick={onClick}
			testId='refresh'
		/>
	);
}

export type CollapsedActionsProps = {
	children?: React.ReactNode,
	/**
	 * Whether the menu has anything to show. Defaults to true.
	 *
	 * The caller decides rather than this component, because children are usually wrapper
	 * components — `<ListAction action={…}>` — whose props carry the selection rule one level down
	 * where inspecting `child.props` cannot reach it. Rendering them to find out is not an option
	 * either: every `Action` subscribes to the command bus on mount.
	 */
	hasVisibleItems?: boolean,
};

/**
 * A `[...]` dropdown of actions. Inside a menu already (the compact fold), its children are
 * listed flat after a divider rather than nested a second level deep.
 */
export function CollapsedActions({ children, hasVisibleItems = true }: CollapsedActionsProps) {
	const parent = useActionsContext();
	const { tid } = useExcelDataTableContext();
	// Every child hides itself independently for the current selection, so the menu can end up
	// empty — leaving a `[...]` that opens onto nothing.
	if (!hasVisibleItems || React.Children.count(children) === 0) {
		return null;
	}
	if (parent.inMenu) {
		return (
			<>
				<Menu.Divider />
				{children}
			</>
		);
	}
	return (
		<Menu shadow='md' position='bottom-end'>
			<Menu.Target>
				<Button aria-label='More actions' {...tid.actionMenu()}>
					<IconDots size={16} />
				</Button>
			</Menu.Target>
			<Menu.Dropdown>
				<ActionsContext.Provider value={{ ...parent, inMenu: true }}>
					{children}
				</ActionsContext.Provider>
			</Menu.Dropdown>
		</Menu>
	);
}
