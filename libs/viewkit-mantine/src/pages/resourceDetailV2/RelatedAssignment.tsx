import { Group, Loader } from '@mantine/core';
import { showAsyncNotice } from '@nikkierp/common/service';
import { escapeHtml } from '@nikkierp/common/utils';
import { Button, SearchableSelect } from '@nikkierp/ui/components';
import { ExcelDataTable, useExcelDataTableContext } from '@nikkierp/ui/components/ExcelDataTable';
import { RelationPickerModal, toRecordOption, useRecordSearchOptions } from '@nikkierp/ui/components/form';
import { useSchemaLocalize, useTranslate } from '@nikkierp/ui/i18n';
import { useCommandBus } from '@nikkierp/ui/microApp';
import { IconPlus, IconX } from '@tabler/icons-react';
import React from 'react';
import { useParams } from 'react-router';

import { buildAssignPayload, buildRemovePayload, commandFailureMessage, searchFailureMessage } from './assignmentPayloads';
import classes from './RelatedAssignment.module.css';
import { useActionLock } from '../../permissions';

import type { ManageDelta } from './assignmentPayloads';
import type { RelatedAssignment, RelatedResource } from './props';
import type { ActionLock } from '../../permissions';
import type { SearchableSelectProps } from '@nikkierp/ui/components';
import type { SearchItem } from '@nikkierp/ui/components/ExcelDataTable';
import type { RecordOption } from '@nikkierp/ui/components/form';


/** Everything the assign bar and the toolbar Removes share for one tab. */
export type AssignmentManager = {
	assignment: RelatedAssignment,
	lock: ActionLock,
	isAssigning: boolean,
	isRemoving: boolean,
	/** Resolves true on success, after the table refresh has been asked for. */
	assign: (pickedId: string) => Promise<boolean>,
	remove: (rows: SearchItem[]) => Promise<boolean>,
};

/**
 * Sends a Shell error notice. The text is escaped here, once, because `showAsyncNotice` injects
 * HTML and server messages may carry anything (problem shell-001).
 */
export function notifyAssignmentError(message: string): void {
	showAsyncNotice('error', escapeHtml(message)).catch((error: unknown) => {
		console.error('Failed to show the async notice', error);
	});
}

/** Null when the tab declares no `assignment`; hooks still run so their order never changes. */
export function useAssignmentManager(resource: RelatedResource, refresh: () => void): AssignmentManager | null {
	const { assignment } = resource;
	const lock = useActionLock(
		assignment ? assignment.actionResource ?? resource.schemaName : null,
		assignment?.actionCode ?? null,
		assignment?.actionScope,
	);
	const actions = useAssignmentActions(assignment?.manageCommand, refresh);
	return React.useMemo(
		() => (assignment ? { assignment, lock, ...actions } : null),
		[assignment, lock, actions],
	);
}

type AssignmentActions = Omit<AssignmentManager, 'assignment' | 'lock'>;

function useAssignmentActions(command: string | undefined, refresh: () => void): AssignmentActions {
	const publish = usePublishDelta(command, refresh);
	const parentId = useParams().id ?? '';
	const [isAssigning, setIsAssigning] = React.useState(false);
	const [isRemoving, setIsRemoving] = React.useState(false);
	const assign = React.useCallback(async (pickedId: string) => {
		const done = toggleFlag(setIsAssigning);
		const ok = await publish(buildAssignPayload(parentId, pickedId));
		done();
		return ok;
	}, [parentId, publish]);
	const remove = React.useCallback(async (rows: SearchItem[]) => {
		const done = toggleFlag(setIsRemoving);
		const ok = await publish(buildRemovePayload(parentId, rows));
		done();
		return ok;
	}, [parentId, publish]);
	return React.useMemo(
		() => ({ isAssigning, isRemoving, assign, remove }),
		[isAssigning, isRemoving, assign, remove],
	);
}

function toggleFlag(setFlag: (value: boolean) => void): () => void {
	setFlag(true);
	return () => setFlag(false);
}

/** Publishes one delta; a failure sends the notice and resolves false, a success refreshes the table. */
function usePublishDelta(command: string | undefined, refresh: () => void) {
	const commandBus = useCommandBus();
	return React.useCallback(async (payload: ManageDelta): Promise<boolean> => {
		if (!command) {
			return false;
		}
		let failure: string | null;
		try {
			failure = commandFailureMessage(await commandBus.publish({ name: command, payload }));
		}
		catch (error) {
			failure = error instanceof Error ? error.message : String(error);
		}
		if (failure) {
			notifyAssignmentError(failure);
			return false;
		}
		refresh();
		return true;
	}, [command, commandBus, refresh]);
}

/**
 * The two toolbar `[X Remove]`. With nothing selected the bar shows a dimmed one that explains
 * itself on click; with a selection, the real one, which removes every selected row in one request.
 */
export function AssignmentRemoveActions({ manager }: { manager: AssignmentManager }) {
	const t = useTranslate('common');
	const { selection } = useExcelDataTableContext();
	const label = t('action.unassign');
	const icon = <IconX size={16} />;
	const onBulkRemove = async (items: SearchItem[]) => {
		if (await manager.remove(items)) {
			selection.clear();
		}
	};
	return (
		<>
			<ExcelDataTable.Action
				label={label}
				icon={icon}
				dimmed
				onClick={() => notifyAssignmentError(t('messages.noSelectedTarget'))}
				locked={manager.lock.locked}
				lockedMissing={manager.lock.missing}
				testId='removeNone'
			/>
			<ExcelDataTable.Action
				label={label}
				icon={icon}
				selectionMode='multiple'
				loading={manager.isRemoving}
				onClick={items => void onBulkRemove(items)}
				locked={manager.lock.locked}
				lockedMissing={manager.lock.missing}
				testId='removeSelected'
			/>
		</>
	);
}

type AssignBarProps = { translationNs: string, manager: AssignmentManager };

/**
 * The dropdown sizes to its longest name rather than to the trigger, so a name is never cut off:
 * at least the trigger's width, at most what the viewport leaves, wrapping beyond that.
 */
const pickerComboboxProps: SearchableSelectProps['comboboxProps'] = {
	width: 'max-content',
	classNames: {
		dropdown: classes.pickerDropdown,
		option: classes.pickerOption,
	},
};

/**
 * `[ Select… v] [+ Assign]` above the table: a typeahead over the picker schema whose "Browse all…"
 * opens `RelationPickerModal` — `RelationSelectField`'s composition, without a form.
 */
export function AssignBar({ translationNs, manager }: AssignBarProps) {
	const t = useTranslate([translationNs, 'common']);
	const { tid } = useExcelDataTableContext();
	const { assignment, lock, isAssigning } = manager;
	const picker = usePickerOptions(assignment.pickerSchemaName);
	const [isPickerOpen, setIsPickerOpen] = React.useState(false);
	const onAssign = async () => {
		if (picker.picked && await manager.assign(picker.picked.value)) {
			picker.setPicked(null);
		}
	};
	const unselected = picker.isPending ? 'messages.loading' : assignment.placeholder ?? 'action.select';
	return (
		<Group gap='xs' wrap='nowrap'>
			<div className={classes.pickerTrigger}>
				<SearchableSelect
					items={picker.items}
					variant='input'
					value={picker.picked?.value ?? null}
					onChange={picker.pickValue}
					onSearchChange={picker.setTerm}
					searchBoxEnabledAt={0}
					actionOptionLabel={t('action.browseAll')}
					onActionTrigger={() => setIsPickerOpen(true)}
					searchPlaceholder={t('action.search')}
					unselectedPlaceholder={t(unselected)}
					disabled={isAssigning}
					comboboxProps={pickerComboboxProps}
					testId={`${tid.prefix}.assign.select`}
				/>
			</div>
			<AssignButton
				label={t('action.assign')}
				lock={lock}
				isPending={isAssigning}
				hasPick={!!picker.picked}
				onClick={() => void onAssign()}
			/>
			<RelationPickerModal
				opened={isPickerOpen}
				onClose={() => setIsPickerOpen(false)}
				destSchemaName={assignment.pickerSchemaName}
				selectionMode='single'
				selectedIds={picker.picked ? [picker.picked.value] : []}
				testId={`${tid.prefix}.assign.picker`}
				onSelect={items => picker.pickRecord(items[0])}
			/>
		</Group>
	);
}

type AssignButtonProps = { label: string, lock: ActionLock, isPending: boolean, hasPick: boolean, onClick: () => void };

/** `[+ Assign]`, `[{Loading} Assign]` while pending. A locked one stays clickable so its refusal can be read. */
function AssignButton({ label, lock, isPending, hasPick, onClick }: AssignButtonProps) {
	const { tid } = useExcelDataTableContext();
	return (
		<Button
			leftSection={isPending ? <Loader size='xs' /> : <IconPlus size={16} />}
			disabled={!lock.locked && (!hasPick || isPending)}
			locked={lock.locked}
			lockedMissing={lock.missing}
			onClick={onClick}
			{...tid.attrs('assign', 'submit')}
		>
			{label}
		</Button>
	);
}

/**
 * The dropdown's options plus the picked one, which the modal may have found off the current page:
 * `SearchableSelect` shows nothing for a value missing from its items.
 */
function usePickerOptions(pickerSchemaName: string) {
	const localize = useSchemaLocalize(pickerSchemaName);
	const [term, setTerm] = React.useState('');
	const [picked, setPicked] = React.useState<RecordOption | null>(null);
	const search = useRecordSearchOptions(pickerSchemaName, term, localize);
	useNotifyOnSearchFailure(searchFailureMessage(search.loadError, search.clientErrors));
	const items = picked && !search.options.some(option => option.value === picked.value)
		? [picked, ...search.options]
		: search.options;
	const pickValue = (value: string) => setPicked(items.find(option => option.value === value) ?? null);
	const pickRecord = (item: SearchItem | undefined) => {
		setPicked(item ? toRecordOption(item, search.labelField, search.subLabelField, localize) : null);
	};
	return { items, picked, setPicked, setTerm, pickValue, pickRecord, isPending: search.isPending };
}

/** One notice per distinct failure, not one per render while the failure persists. */
function useNotifyOnSearchFailure(failure: string | null): void {
	React.useEffect(() => {
		if (failure) {
			notifyAssignmentError(failure);
		}
	}, [failure]);
}
