import { Table as MantineTable } from '@mantine/core';
import { showClientErrorModal } from '@nikkierp/common/service';
import { IconPlus } from '@tabler/icons-react';
import React from 'react';

import { cellSpanOf, groupOwnFields, groupWithSubRemoved } from './rowSpanModel';
import { useTranslate } from '../../../i18n';
import { Button } from '../../Button';
import { INLINE_CONTROLS_ATTRS } from '../../Input/inputDensity';
import { useExcelDataTableContext } from '../context';
import classes from '../ExcelDataTable.module.css';
import { InsertRow } from '../NewRow';
import { DeleteRowAction } from '../rowActions';
import { useRowUpdateWrite } from '../rowUpdateWrite';

import type { CellSpan, RowSpanPlace } from './rowSpanModel';
import type { InsertTarget } from '../NewRow';
import type { RowId } from '../types';


const ownCell: CellSpan = { skip: false };

export type RowSpanCells = {
	/** The row's place in its group; absent on a flat table. */
	place: RowSpanPlace | undefined,
	/** How the cell keyed `key` (a column key, `ROW_SPAN_INDEX_CELL` or `ROW_SPAN_FILLER_CELL`) renders. */
	spanOf: (key: string) => CellSpan,
};

/** The span of each cell of one flat row; every cell is its own on a flat table. */
export function useRowSpanCells(rowId: RowId): RowSpanCells {
	const { rowSpan } = useExcelDataTableContext();
	const place = rowSpan?.places.get(rowId);
	return React.useMemo(() => ({
		place,
		spanOf: (key: string) => (rowSpan ? cellSpanOf(place, key, rowSpan.config, rowSpan.withSubInsert) : ownCell),
	}), [place, rowSpan]);
}

/** The cell of a nested column on a group without sub-rows. */
export function BlankCell(): React.ReactNode {
	return <MantineTable.Td aria-hidden />;
}

type SubRowActionsCellProps = { rowId: RowId, children?: React.ReactNode };

/** The sub-row's own controls: its Delete (an update of the group), and a table-scope row's write errors. */
export function SubRowActionsCell({ rowId, children }: SubRowActionsCellProps): React.ReactNode {
	const { capabilities, rowSpan } = useExcelDataTableContext();
	const place = rowSpan?.places.get(rowId);
	const withDelete = place && place.subIndex >= 0 && capabilities.includes('update');
	return (
		<MantineTable.Td
			className={classes.actionColumnCell}
			onKeyDown={event => event.stopPropagation()}
			onDoubleClick={event => event.stopPropagation()}
			{...INLINE_CONTROLS_ATTRS}
		>
			{withDelete ? <SubRowDeleteButton place={place} rowId={rowId} /> : null}
			{children}
		</MantineTable.Td>
	);
}

/** Removes the sub-row: the group, without it, goes to `updateCommand` / `onUpdated`. */
function SubRowDeleteButton({ place, rowId }: { place: RowSpanPlace, rowId: RowId }): React.ReactNode {
	const { locks, editing, isLoading, tid, btnDeleteLabel, rowSpan, refresh } = useExcelDataTableContext();
	const t = useTranslate('common');
	const write = useRowUpdateWrite();
	const [isDeleting, setDeleting] = React.useState(false);
	const onDelete = async () => {
		if (!rowSpan) return;
		setDeleting(true);
		const clientErrors = await write(groupWithSubRemoved(place, rowSpan.config));
		setDeleting(false);
		if (!clientErrors) {
			refresh();
		}
		else if (clientErrors.length > 0) {
			showClientErrorModal(t, clientErrors);
		}
	};
	return (
		<DeleteRowAction
			onDelete={() => void onDelete()}
			disabled={editing.isActive || isLoading || isDeleting}
			locked={locks.update.locked}
			lockedMissing={locks.update.missing}
			label={btnDeleteLabel}
			testId={tid.subRowDelete(rowId)}
		/>
	);
}

/**
 * After a group's last row, while the table may update: its sub-row insert line — `[+ Add …]` until
 * clicked, then an input per nested column, the main insert row's machinery (§5.4) on the group.
 */
export function SubRowInsertAfter({ rowId }: { rowId: RowId }): React.ReactNode {
	const { rowSpan, editing, modelSchema } = useExcelDataTableContext();
	const [generation, setGeneration] = React.useState(0);
	const place = rowSpan?.places.get(rowId);
	const target = React.useMemo<InsertTarget | undefined>(() => (place && rowSpan ? {
		groupId: place.groupId, group: place.group, seed: groupOwnFields(place.group, rowSpan.config),
	} : undefined), [place, rowSpan]);
	if (!rowSpan?.withSubInsert || !place || !target || !modelSchema || !isLastOfGroup(place)) {
		return null;
	}
	if (editing.creating && editing.createTarget === place.groupId) {
		return (
			<InsertRow
				key={generation}
				modelSchema={modelSchema}
				target={target}
				onAdded={() => setGeneration(count => count + 1)}
			/>
		);
	}
	return <AddSubRowLine groupId={place.groupId} nestedCount={rowSpan.config.nestedFields.length} />;
}

function isLastOfGroup(place: RowSpanPlace): boolean {
	return place.subIndex === place.subCount - 1 || place.subIndex < 0;
}

/** The idle sub-row line: the button across the nested columns, an empty sub-row actions cell. */
function AddSubRowLine({ groupId, nestedCount }: { groupId: RowId, nestedCount: number }): React.ReactNode {
	const t = useTranslate('common');
	const { rowSpan, locks, editing, selection, tid } = useExcelDataTableContext();
	const onOpen = () => {
		selection.clear();
		editing.startCreate(groupId);
	};
	return (
		<MantineTable.Tr {...INLINE_CONTROLS_ATTRS}>
			<MantineTable.Td colSpan={nestedCount}>
				<Button
					variant='subtle'
					leftSection={<IconPlus size={14} />}
					locked={locks.update.locked}
					lockedMissing={locks.update.missing}
					disabled={editing.rowId !== null}
					onClick={onOpen}
					{...tid.subRowAddLine(groupId)}
				>
					{rowSpan?.subRowPrompt ?? t('datatable.addLine', { defaultValue: 'Add a line' })}
				</Button>
			</MantineTable.Td>
			<MantineTable.Td aria-hidden />
		</MantineTable.Tr>
	);
}
