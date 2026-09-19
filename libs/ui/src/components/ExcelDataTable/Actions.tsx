import { Button as MantineButton, Menu } from '@mantine/core';
import { IconDots, IconX } from '@tabler/icons-react';
import React from 'react';

import { ActionRefresh } from './Action';
import { ActionsContext } from './actionsContext';
import { useExcelDataTableContext } from './context';
import { useTranslate } from '../../i18n';
import { Button } from '../Button';
import classes from './ExcelDataTable.module.css';

import type { SearchItem } from './types';


export type ActionsProps = {
	/** Used by the default refresh button when no children are given. */
	refreshCommand?: string,
	refreshIconOnly?: boolean,
	children?: React.ReactNode,
};

/**
 * The action bar. Without children it holds one refresh button; with children, whatever actions
 * the page declares. A deselect chip leads the bar whenever rows are selected. On a compact screen
 * every action folds into one `[...]` menu, the chip stays out as `[n ×]`.
 */
export function Actions({ refreshCommand, refreshIconOnly = false, children }: ActionsProps) {
	const { selection, isCompact } = useExcelDataTableContext();
	const selectedItems = React.useMemo(
		() => selection.ids.map(id => selection.itemsById.get(id)).filter((item): item is SearchItem => !!item),
		[selection.ids, selection.itemsById],
	);
	const content = children ?? <ActionRefresh command={refreshCommand} iconOnly={refreshIconOnly} />;
	return (
		<div className={classes.actions}>
			{selectedItems.length > 0 ? <DeselectButton count={selectedItems.length} compact={isCompact} /> : null}
			{isCompact
				? <FoldedActions selectedItems={selectedItems}>{content}</FoldedActions>
				: (
					<ActionsContext.Provider value={{ inMenu: false, selectedItems }}>
						{content}
					</ActionsContext.Provider>
				)}
		</div>
	);
}

function DeselectButton({ count, compact }: { count: number, compact: boolean }) {
	const t = useTranslate('common');
	const { selection, tid } = useExcelDataTableContext();
	return (
		<MantineButton
			variant='light'
			size='compact-md'
			onClick={selection.clear}
			rightSection={<IconX size={14} />}
			aria-label={t('datatable.deselect', { defaultValue: 'Deselect' })}
			{...tid.deselect()}
		>
			{/*
			  * `count` is interpolated by i18next rather than concatenated, because the number does
			  * not sit in the same place in every language: en-US reads "3 selected", vi-VN reads
			  * "Đã chọn 3".
			  */}
			{compact ? count : t('datatable.selected', { count, defaultValue: '{{count}} selected' })}
		</MantineButton>
	);
}

function FoldedActions({ selectedItems, children }: { selectedItems: SearchItem[], children: React.ReactNode }) {
	const { tid } = useExcelDataTableContext();
	return (
		<Menu shadow='md' position='bottom-start'>
			<Menu.Target>
				<Button aria-label='Actions' {...tid.actionMenu()}>
					<IconDots size={16} />
				</Button>
			</Menu.Target>
			<Menu.Dropdown>
				<ActionsContext.Provider value={{ inMenu: true, selectedItems }}>
					{children}
				</ActionsContext.Provider>
			</Menu.Dropdown>
		</Menu>
	);
}
