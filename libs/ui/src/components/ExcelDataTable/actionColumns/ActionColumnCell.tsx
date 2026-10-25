import { Anchor, Group, Table as MantineTable, Text, Tooltip } from '@mantine/core';
import { commandAttrs } from '@nikkierp/viewengine/core';
import clsx from 'clsx';
import React from 'react';
import { Link } from 'react-router-dom';

import { LockedAnchor } from './LockedAnchor';
import { actionLockKey } from './useActionColumnLocks';
import { useTranslate } from '../../../i18n';
import { useCommandBus } from '../../../microApp/MicroAppProvider';
import { Button, LinkButton } from '../../Button';
import { publishTableCommand } from '../Action';
import { useExcelDataTableContext } from '../context';
import classes from '../ExcelDataTable.module.css';
import { useSelectOnlyPress } from '../rowPress';

import type { CapabilityLock } from '../capabilities';
import type { ActionColumn, ActionColumnAction, RowId, SearchItem } from '../types';


type ActionColumnCellProps = { column: ActionColumn, item: SearchItem, rowId: RowId, isSelected: boolean };

/**
 * A custom action column's cell: its controls in list order. Like the built-in action column, a
 * press on the cell selects the row and a press on a control does not; its keys and double-clicks
 * stay here, so Enter on a control never opens the row editor.
 */
export function ActionColumnCell({ column, item, rowId, isSelected }: ActionColumnCellProps): React.ReactNode {
	const { actionColumnLocks } = useExcelDataTableContext();
	const onMouseDown = useSelectOnlyPress(rowId);
	return (
		<MantineTable.Td
			className={clsx(classes.actionColumnCell, { [classes.selectedCell]: isSelected })}
			onMouseDown={onMouseDown}
			onKeyDown={event => event.stopPropagation()}
			onDoubleClick={event => event.stopPropagation()}
		>
			<Group gap='xs' wrap='nowrap' onMouseDown={event => event.stopPropagation()}>
				{column.actions.map(action => (
					<RowActionControl
						key={action.key}
						columnKey={column.key}
						action={action}
						item={item}
						rowId={rowId}
						lock={actionColumnLocks[actionLockKey(column.key, action.key)]}
					/>
				))}
			</Group>
		</MantineTable.Td>
	);
}

/** An action column's cell in a row with no record yet (the insert row) or with its editor open. */
export function EmptyActionColumnCell(): React.ReactNode {
	return <MantineTable.Td className={classes.actionColumnCell} />;
}

type RowActionControlProps = {
	columnKey: string,
	action: ActionColumnAction,
	item: SearchItem,
	rowId: RowId,
	lock: CapabilityLock | undefined,
};

/** A disabled control keeps its reason reachable: Mantine's disabled button takes no pointer events. */
function RowActionControl(props: RowActionControlProps): React.ReactNode {
	const reason = props.action.disabled?.(props.item) || null;
	const control = reason ? <DisabledControl {...props} /> : <EnabledControl {...props} />;
	if (!reason) {
		return control;
	}
	return (
		<Tooltip label={reason}>
			<span className='inline-flex'>{control}</span>
		</Tooltip>
	);
}

function DisabledControl({ columnKey, action, rowId }: RowActionControlProps): React.ReactNode {
	const { tid } = useExcelDataTableContext();
	const testId = tid.rowAction(rowId, columnKey, action.key);
	if (action.type === 'link') {
		return <Text size='xs' c='dimmed' aria-disabled {...testId}>{action.label}</Text>;
	}
	return <Button variant='default' size='xs' disabled {...testId}>{action.label}</Button>;
}

function EnabledControl({ columnKey, action, item, rowId, lock }: RowActionControlProps): React.ReactNode {
	const { tid } = useExcelDataTableContext();
	const publish = useRowCommand(item);
	const testId = tid.rowAction(rowId, columnKey, action.key);
	const locked = { locked: lock?.locked, lockedMissing: lock?.missing };
	if (action.type === 'action') {
		return (
			<Button
				variant='default'
				size='xs'
				onClick={() => action.command && publish(action.command)}
				{...locked}
				{...commandAttrs(action.command)}
				{...testId}
			>
				{action.label}
			</Button>
		);
	}
	const href = action.href?.(item) ?? '';
	if (action.type === 'action_link') {
		return <LinkButton variant='default' size='xs' to={href} {...locked} {...testId}>{action.label}</LinkButton>;
	}
	return lock?.locked
		? <LockedAnchor label={action.label} missing={lock.missing} testId={testId} />
		: <Anchor component={Link} to={href} size='xs' {...testId}>{action.label}</Anchor>;
}

/** Publishes `command` with the row as payload; failures go to the Shell Notices, then the table refreshes. */
function useRowCommand(item: SearchItem): (command: string) => void {
	const { refresh, translationNs } = useExcelDataTableContext();
	const t = useTranslate(translationNs ?? 'common');
	const commandBus = useCommandBus();
	return React.useCallback((command: string) => {
		void publishTableCommand(commandBus, command, item, t, refresh);
	}, [commandBus, item, refresh, t]);
}
