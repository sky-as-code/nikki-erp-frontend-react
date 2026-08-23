import { Button as MantineButton, Group, Menu, Title } from '@mantine/core';
import { commandAttrs } from '@nikkierp/viewengine/core';
import { IconDots, IconX } from '@tabler/icons-react';
import React from 'react';

import { Button, LinkButton } from '../Button';
import { useDataTableContext } from './DataTableContext';

import type { DataTableAction, RenderTableNameFn } from './DataTable';


type ToolbarProps = {
	tableName: string,
	total: number,
	actions: DataTableAction[],
	selectedCount: number,
	onClearSelection: () => void,
	renderTableName?: RenderTableNameFn,
};

export function Toolbar(props: ToolbarProps): React.ReactNode {
	const { tableName, total, actions, selectedCount, onClearSelection, renderTableName } = props;
	const context = useDataTableContext();
	const isRowMode = selectedCount > 0;
	const selectedItems = React.useMemo(
		() => context.rs.indexes.map(index => context.tableSearchData.items[index]).filter(Boolean),
		[context.rs.indexes, context.tableSearchData.items],
	);
	const visibleSelectionActions = getVisibleRowSelectionActions(actions, selectedCount);
	const visibleDefaultActions = getVisibleDefaultActions(actions);
	const buttons = visibleDefaultActions.slice(0, 2).filter(a => !a.isSeparator);
	const menuItems = normalizeMenuItems(visibleDefaultActions.slice(2));
	const titleNode = renderTableName
		? renderTableName({ name: tableName, total: total ?? 0 })
		: <Title order={3} className='capitalize'>{tableName} ({total ?? 0})</Title>;
	return (
		<Group gap='xs' className='flex-grow-0'>
			{titleNode}
			{isRowMode ? (
				<MantineButton
					variant='light'
					onClick={onClearSelection}
					rightSection={<IconX size={14} />}
					{...context.tid.selectedCount()}
				>
					{selectedCount} selected
				</MantineButton>
			) : null}
			{isRowMode ? (
				visibleSelectionActions.length > 0
					? <ActionMenu items={visibleSelectionActions} selectedItems={selectedItems} />
					: null
			) : (
				<>
					{buttons.map((action, i) => <ActionButton key={i} action={action} selectedItems={selectedItems} />)}
					{menuItems.length > 0 ? <ActionMenu items={menuItems} selectedItems={selectedItems} /> : null}
				</>
			)}
		</Group>
	);
}

type ActionTriggerProps = {
	action: DataTableAction,
	selectedItems: Record<string, unknown>[],
};

function ActionButton({ action, selectedItems }: ActionTriggerProps): React.ReactNode {
	const { tid } = useDataTableContext();
	if (action.href) {
		return (
			<LinkButton
				to={action.href}
				leftSection={action.icon}
				{...commandAttrs(action.command)}
				{...tid.action(action)}
			>
				{action.label}
			</LinkButton>
		);
	}
	return (
		<Button
			leftSection={action.icon}
			onClick={() => action.onTrigger?.(selectedItems)}
			{...commandAttrs(action.command)}
			{...tid.action(action)}
		>
			{action.label}
		</Button>
	);
}

function ActionMenu(
	{ items, selectedItems }: { items: DataTableAction[], selectedItems: Record<string, unknown>[] },
): React.ReactNode {
	const { tid } = useDataTableContext();
	return (
		<Menu shadow='md' position='bottom-end'>
			<Menu.Target>
				<Button aria-label='More actions' {...tid.actionMenu()}>
					<IconDots size={16} />
				</Button>
			</Menu.Target>
			<Menu.Dropdown>
				{items.map((item, i) => (item.isSeparator
					? <Menu.Divider key={i} />
					: (
						<Menu.Item
							key={i}
							leftSection={item.icon}
							onClick={() => item.onTrigger?.(selectedItems)}
							{...commandAttrs(item.command)}
							{...tid.action(item)}
						>
							{item.label}
						</Menu.Item>
					)
				))}
			</Menu.Dropdown>
		</Menu>
	);
}

function shouldShowSelectionAction(action: DataTableAction, selectedCount: number): boolean {
	if (action.isSeparator) return true;
	if (!action.requireSelection || selectedCount === 0) {
		return false;
	}
	if (!action.supportMultiple) {
		return selectedCount === 1;
	}
	return true;
}

function getVisibleRowSelectionActions(actions: DataTableAction[], selectedCount: number): DataTableAction[] {
	return normalizeMenuItems(actions.filter(action => shouldShowSelectionAction(action, selectedCount)));
}

function getVisibleDefaultActions(actions: DataTableAction[]): DataTableAction[] {
	return normalizeMenuItems(actions.filter(action => !action.requireSelection));
}

function normalizeMenuItems(items: DataTableAction[]): DataTableAction[] {
	const normalized: DataTableAction[] = [];
	for (const item of items) {
		if (item.isSeparator) {
			if (normalized.length === 0 || normalized[normalized.length - 1].isSeparator) {
				continue;
			}
			normalized.push(item);
			continue;
		}
		normalized.push(item);
	}
	if (normalized.length > 0 && normalized[normalized.length - 1].isSeparator) {
		normalized.pop();
	}
	return normalized;
}
