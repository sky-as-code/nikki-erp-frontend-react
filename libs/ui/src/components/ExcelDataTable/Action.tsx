import { Loader, Menu, Tooltip } from '@mantine/core';
import { notifyClientErrors, showShellNotice } from '@nikkierp/common/service';
import { escapeHtml } from '@nikkierp/common/utils';
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
import type { ButtonProps, LockedProps } from '../Button';
import type { ICommandBus } from '@nikkierp/common/commandBus';
import type { ClientErrorTranslator } from '@nikkierp/common/types';


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
	/**
	 * Passed to `Button`, which defaults it to `outline`. `subtle` for a borderless control — the
	 * split view's close button, which has to match the detail pane's own `ActionIcon`.
	 */
	variant?: ButtonProps['variant'],
	/**
	 * A request is pending: a spinner replaces the icon, the label stays and the control is
	 * disabled. Not Mantine's `loading`, which hides the label.
	 */
	loading?: boolean,
	/**
	 * Greyed but still clickable, for an action that can explain why it does nothing yet — e.g. a
	 * row action outside selection mode that answers a click with "No selected target".
	 */
	dimmed?: boolean,
};

/** The props `loading` and `dimmed` add to a bar button or a menu item. */
export function getActionStateProps(
	{ loading = false, dimmed = false, icon }: Pick<ActionProps, 'loading' | 'dimmed' | 'icon'>,
) {
	return {
		leftSection: loading ? <Loader size='xs' /> : icon,
		disabled: loading,
		'aria-busy': loading || undefined,
		...(dimmed ? { color: 'gray', c: 'dimmed', 'data-dimmed': 'true' } : {}),
	};
}

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

/**
 * Publishes a row command and surfaces its failures in the Shell Notice stack: each client error
 * translated, or one generic notice for a technical failure, whose text is meaningless to a user.
 * The table refreshes either way, because a bulk command may have applied to some rows only.
 */
export async function publishActionCommand(
	commandBus: Pick<ICommandBus, 'publish'>,
	command: string,
	ids: string[],
	t: ClientErrorTranslator,
	refresh: () => void,
): Promise<void> {
	try {
		const response = await commandBus.publish({ name: command, payload: { ids } });
		if (response.error) {
			notifyActionFailed(t, response.error);
		}
		else {
			notifyClientErrors(t, response.result?.clientErrors ?? []);
		}
	}
	catch (error: unknown) {
		notifyActionFailed(t, error);
	}
	refresh();
}

function notifyActionFailed(t: ClientErrorTranslator, error: unknown): void {
	console.error('Table action failed', error);
	showShellNotice('error', escapeHtml(t('common:datatable.actionFailed', {}))).catch((noticeError: unknown) => {
		console.error('Failed to show the Shell Notice', noticeError);
	});
}

function useActionTrigger(props: Pick<ActionProps, 'command' | 'onClick'>) {
	const { refresh, translationNs } = useExcelDataTableContext();
	const t = useTranslate(translationNs ?? 'common');
	const commandBus = useCommandBus();
	const { selectedItems } = useActionsContext();
	return React.useCallback(() => {
		props.onClick?.(selectedItems);
		if (props.command) {
			const ids = selectedItems.map(item => item.id).filter(Boolean) as string[];
			void publishActionCommand(commandBus, props.command, ids, t, refresh);
		}
	}, [commandBus, props, refresh, selectedItems, t]);
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
	const { label, icon, iconOnly = false, href, command, locked, lockedMissing, variant, onTrigger } = props;
	const state = getActionStateProps(props);
	const shared = {
		locked,
		lockedMissing,
		variant,
		'aria-label': iconOnly ? label : undefined,
		...state,
		leftSection: iconOnly ? undefined : state.leftSection,
		...commandAttrs(command),
		...tid.action(props),
	};
	// An icon-only button carries its label in the tooltip and `aria-label`; every other button
	// shows the text, with the icon beside it via `leftSection`.
	const content = iconOnly ? (props.loading ? <Loader size='xs' /> : icon) : label;
	const button = href
		? <LinkButton to={href} {...shared}>{content}</LinkButton>
		: <Button onClick={onTrigger} {...shared}>{content}</Button>;
	return iconOnly ? <Tooltip label={label}>{button}</Tooltip> : button;
}

function ActionMenuItem(props: TriggerProps) {
	const { tid } = useExcelDataTableContext();
	const lockedProps = useLockedItemProps(props.locked, props.lockedMissing);
	// No `variant`: a menu item is not a button and has no variant to carry.
	const shared = { ...getActionStateProps(props), ...commandAttrs(props.command), ...tid.action(props) };
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
