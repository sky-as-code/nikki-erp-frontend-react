import { showShellNotice } from '@nikkierp/common/service';
import { escapeHtml } from '@nikkierp/common/utils';
import { useTranslate } from '@nikkierp/ui/i18n';
import { useCommandBus } from '@nikkierp/ui/microApp';
import React from 'react';
import { useParams } from 'react-router';

import {
	assignmentSearchField, buildAssignPayload, buildRemovePayload, commandFailureMessage, pickedRecordId,
} from './assignmentPayloads';
import { ResourceUpdateContext } from './resourceUpdateContext';
import { actionRequirement } from '../../permissions';

import type { ManageDelta } from './assignmentPayloads';
import type { RelatedAssignment, RelatedResource } from './props';
import type { ExcelDataTableRowWriteProps, SearchItem } from '@nikkierp/ui/components/ExcelDataTable';


/**
 * Sends a Shell error notice. The text is escaped here, once, because `showShellNotice` injects
 * HTML and server messages may carry anything (problem shell-001).
 */
export function notifyAssignmentError(message: string): void {
	showShellNotice('error', escapeHtml(message)).catch((error: unknown) => {
		console.error('Failed to show the Shell Notice', error);
	});
}

/**
 * The table props that turn a tab with an `assignment` into one that assigns through its insert row
 * and unassigns through row Delete; null for a tab without one. Hooks still run so their order
 * never changes.
 *
 * The sinks resolve false on a failure, which keeps the insert row open with what was picked; the
 * table refreshes itself on success.
 */
export function useAssignmentWriteProps(resource: RelatedResource): ExcelDataTableRowWriteProps | null {
	const { assignment } = resource;
	const t = useTranslate(resource.translationNs);
	const publish = usePublishDelta(assignment?.manageCommand);
	const parentId = useParams().id ?? '';
	const searchField = assignmentSearchField(assignment?.newRowSearchField, resource.fields);
	const onCreated = React.useCallback(async (values: Record<string, unknown>) => {
		const pickedId = pickedRecordId(values, searchField);
		return pickedId ? publish(buildAssignPayload(parentId, pickedId)) : false;
	}, [parentId, publish, searchField]);
	const onDeleted = React.useCallback(
		(items: SearchItem[]) => publish(buildRemovePayload(parentId, items)), [parentId, publish],
	);
	const prompt = assignment?.newRowPrompt ? t(assignment.newRowPrompt) : undefined;
	return React.useMemo(() => {
		if (!assignment) {
			return null;
		}
		return {
			capabilities: ['create', 'delete'], onCreated, onDeleted,
			...assignmentEntitlements(assignment, resource.schemaName),
			newRowSource: 'server-resource', newRowResourceSchema: assignment.pickerSchemaName,
			newRowSearchField: searchField, newRowPrompt: prompt,
			btnDeleteLabel: assignment.btnDeleteLabel ?? 'common:action.unassign',
		};
	}, [assignment, resource.schemaName, onCreated, onDeleted, searchField, prompt]);
}

/** Both the insert row and row Delete publish `manageCommand`, so one assertion gates both. */
function assignmentEntitlements(assignment: RelatedAssignment, schemaName: string) {
	const requirement = actionRequirement(
		assignment.actionResource ?? schemaName, assignment.actionCode, assignment.actionScope,
	);
	return { createEntitlement: requirement, deleteEntitlement: requirement };
}

/** Publishes one delta; a failure sends the notice and resolves false, a success reloads the History tab. */
function usePublishDelta(command: string | undefined) {
	const commandBus = useCommandBus();
	const bumpHistory = React.useContext(ResourceUpdateContext)?.bumpHistory;
	return React.useCallback(async (payload: ManageDelta): Promise<boolean> => {
		if (!command || (payload.add?.length ?? 0) + (payload.remove?.length ?? 0) === 0) {
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
		bumpHistory?.();
		return true;
	}, [command, commandBus, bumpHistory]);
}
