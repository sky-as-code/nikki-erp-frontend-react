import { Alert, Badge, Group } from '@mantine/core';
import * as dyn from '@nikkierp/common/dynamicModel';
import { translateClientError } from '@nikkierp/common/types';
// The wrapper rather than Mantine's Button: it carries the `locked` state, and the design system
// prefers it wherever one exists.
import { Button } from '@nikkierp/ui/components';
import { useCommand } from '@nikkierp/ui/hookhoc';
import { useTranslate } from '@nikkierp/ui/i18n';
import { commandAttrs } from '@nikkierp/viewengine/core';
import { evaluateCondition } from '@nikkierp/viewengine/metadata';
import {
	IconAlertCircle, IconChevronRight, IconDeviceFloppy, IconPencil, IconPlus, IconX,
} from '@tabler/icons-react';
import React from 'react';
import { Link } from 'react-router';

import { useResourceUpdateContext } from './resourceUpdateContext';
import { useRoutePathHref } from '../../data/useResourceLinkHref';
import { resolveActionCode, StandardActionCode, useActionLock } from '../../permissions';
import { ActionPromptModal } from '../resourceDetail/ActionPromptModal';
import {
	useResourceDetailSchemaName, useResourceDetailTestAttrs, useResourceDetailTranslationNs,
} from '../resourceDetail/ResourceDetailProvider';
import { ResourceDetailOverflowMenu } from '../resourceDetail/resourceOverflowMenu';


import type {
	ResourceDetailContextualActions, ResourceDetailExtraAction, StatusOption,
} from '../resourceDetail/props';
import type { ClientErrorItem } from '@nikkierp/common/types';


export function CreateActionButton({ disabled = false }: { disabled?: boolean }): React.ReactNode {
	const t = useTranslate(useResourceDetailTranslationNs());
	const tid = useResourceDetailTestAttrs();
	const lock = useActionLock(useResourceDetailSchemaName(), StandardActionCode.Create);
	return (
		<Button
			component={Link}
			to='../new'
			relative='path'
			disabled={disabled}
			locked={lock.locked}
			lockedMissing={lock.missing}
			leftSection={<IconPlus size={16} />}
			variant='outline'
			size='compact-md'
			{...tid('action', 'create')}
		>
			{t('action.create')}
		</Button>
	);
}

export type ResourceActionBarProps = {
	onSaveClick: () => void,
	/** Discards edits and leaves update mode. Defaults to `setUpdateMode(false)` alone. */
	onCancel?: () => void,
	isLoading: boolean,
	updateMode: boolean,
	setUpdateMode: React.Dispatch<React.SetStateAction<boolean>>,
};

/**
 * The page-level bar of Update/Save/Cancel, contextual actions, overflow menu, and status flow —
 * rendered once in the header next to Create, not inside the (possibly collapsed) form section.
 */
export function ResourceActionBar({
	onSaveClick, onCancel, isLoading, updateMode, setUpdateMode,
}: ResourceActionBarProps): React.ReactNode {
	const { allStatuses, currentStatus, contextualActions, commands, resource } = useResourceUpdateContext();
	const curStatusField = currentStatus?.schemaField;
	const status = curStatusField ? resource?.[curStatusField] : null;
	const hasVisibleContextualActions = resource != null && hasMatchingExtraAction(contextualActions, resource);
	const hasOverflowMenu = Boolean(commands.delete || commands.archive);

	return (
		<Group justify='space-between' wrap='wrap' className='flex-1'>
			<Group gap='xs' align='center'>
				<PrimaryActionButtons
					updateMode={updateMode}
					setUpdateMode={setUpdateMode}
					onCancel={onCancel}
					updateCommand={commands.update}
					onSaveClick={onSaveClick}
					isLoading={isLoading}
				/>
				{hasVisibleContextualActions ? (
					<ResourceDetailExtraActionButtons
						contextualActions={contextualActions}
						resource={resource}
						disabled={isLoading}
					/>
				) : null}
				{hasOverflowMenu && resource != null ? (
					<ResourceDetailOverflowMenu
						resource={resource}
						disabled={isLoading}
					/>
				) : null}
			</Group>
			<StatusFlow statuses={allStatuses ?? []} current={status as string | null} />
		</Group>
	);
}

type PrimaryActionButtonsProps = {
	updateMode: boolean,
	setUpdateMode: React.Dispatch<React.SetStateAction<boolean>>,
	onCancel?: () => void,
	/**
	 * The command Save publishes, or undefined when the resource is read-only. Carried as the
	 * string rather than a boolean so Save can name it in `data-command`.
	 */
	updateCommand?: string,
	onSaveClick: () => void,
	isLoading: boolean,
};

function PrimaryActionButtons({
	updateMode, setUpdateMode, onCancel, updateCommand, onSaveClick, isLoading,
}: PrimaryActionButtonsProps): React.ReactNode {
	const t = useTranslate(useResourceDetailTranslationNs());
	const tid = useResourceDetailTestAttrs();
	// Gating the entry point rather than Save: a caller who may not update should not be able to
	// enter update mode at all, and Save inside it would then always be reachable.
	const updateLock = useActionLock(useResourceDetailSchemaName(), StandardActionCode.Update);
	if (!updateCommand) {
		return null;
	}

	if (updateMode) {
		return (
			<>
				<Button
					variant='outline'
					size='compact-md'
					onClick={() => (onCancel ? onCancel() : setUpdateMode(false))}
					leftSection={<IconX size={16} />}
					{...tid('action', 'cancel')}
				>
					{t('action.cancel')}
				</Button>
				<Button
					variant='filled'
					size='compact-md'
					leftSection={<IconDeviceFloppy size={16} />}
					onClick={onSaveClick}
					disabled={isLoading}
					loading={isLoading}
					type='submit'
					{...commandAttrs(updateCommand)}
					{...tid('action', 'save')}
				>
					{t('action.save')}
				</Button>
			</>
		);
	}

	return (
		<Button
			onClick={() => setUpdateMode(true)}
			disabled={isLoading}
			locked={updateLock.locked}
			lockedMissing={updateLock.missing}
			leftSection={<IconPencil size={16} />}
			variant='filled'
			size='compact-md'
			{...tid('action', 'update')}
		>
			{t('action.update')}
		</Button>
	);
}

function ResourceDetailExtraActionButtons({
	contextualActions, resource, disabled = false,
}: {
	contextualActions?: ResourceDetailContextualActions,
	resource: Record<string, unknown>,
	disabled?: boolean,
}): React.ReactNode {
	if (!contextualActions) {
		return null;
	}

	return Object.entries(contextualActions).map(([actionKey, action]) => (
		<ResourceDetailExtraActionButton
			key={actionKey}
			actionKey={actionKey}
			action={action}
			resource={resource}
			disabled={disabled}
		/>
	));
}

/**
 * One contextual action, in whichever of its two shapes the page authored.
 *
 * The split is a hooks requirement, not a style choice: the command variant calls `useCommand`
 * and the link variant `useRoutePathHref`, and neither may be called conditionally.
 */
function ResourceDetailExtraActionButton({
	actionKey, action, resource, disabled = false,
}: {
	/** The page-authored name of this action in `contextualActions`; stable, so it names the button. */
	actionKey: string,
	action: ResourceDetailExtraAction,
	resource: Record<string, unknown>,
	disabled?: boolean,
}): React.ReactNode {
	if (action.routePath) {
		return <ResourceDetailLinkActionButton actionKey={actionKey} action={action} disabled={disabled} />;
	}
	return (
		<ResourceDetailCommandActionButton
			actionKey={actionKey}
			action={action}
			resource={resource}
			disabled={disabled}
		/>
	);
}

/**
 * The `routePath` variant: a plain link, no command, no request.
 *
 * The href is resolved absolutely from the target page's own `routePath` rather than relatively
 * from the current URL, because `ViewEngineRouter` registers pages as flat routes where `'..'`
 * pops to the module root. An unresolved href means a route param is still missing, so the
 * button renders disabled rather than pointing somewhere wrong.
 */
function ResourceDetailLinkActionButton({
	actionKey, action, disabled = false,
}: {
	actionKey: string,
	action: ResourceDetailExtraAction,
	disabled?: boolean,
}): React.ReactNode {
	const t = useTranslate(useResourceDetailTranslationNs());
	const tid = useResourceDetailTestAttrs();
	const href = useRoutePathHref(action.routePath);
	// A link is gated only when the page names the action its target performs: navigation alone
	// mutates nothing, but a page that leads straight into an edit should say so up front.
	const lock = useActionLock(useResourceDetailSchemaName(), action.actionCode ?? null);

	if (!href) {
		return null;
	}

	return (
		<Button
			component={Link}
			to={href}
			variant='outline'
			size='compact-md'
			disabled={disabled}
			locked={lock.locked}
			lockedMissing={lock.missing}
			{...tid('action', actionKey)}
		>
			{t(action.label)}
		</Button>
	);
}

function ResourceDetailCommandActionButton({
	actionKey, action, resource, disabled = false,
}: {
	actionKey: string,
	action: ResourceDetailExtraAction,
	resource: Record<string, unknown>,
	disabled?: boolean,
}): React.ReactNode {
	const t = useTranslate(useResourceDetailTranslationNs());
	const tid = useResourceDetailTestAttrs();
	// The schema's refine guarantees exactly one of `command` / `routePath`, and this component
	// renders only for the former, so the fallback is unreachable rather than a default.
	const command = useCommand(action.command ?? '');
	const { refresh } = useResourceUpdateContext();
	// Above the early return: hooks cannot be called conditionally.
	const [promptOpen, setPromptOpen] = React.useState(false);
	const lock = useActionLock(useResourceDetailSchemaName(), resolveActionCode(action));
	const isVisible = !action.condition || evaluateCondition(action.condition, resource);
	if (!isVisible) {
		return null;
	}

	// The request is spread first, so a prompt field can never overwrite `id` or `etag`.
	const publish = (values?: Record<string, unknown>) => {
		const request = buildDefaultMutateRequest(resource);
		if (request == null) {
			return;
		}
		void command.publish({ ...request, ...values }).then(response => {
			if (!isPublishRejected(response)) {
				setPromptOpen(false);
			}
			// Refresh either way: a rejected action may still have changed the record's etag, and
			// delete and archive already do this. Without it the pane keeps showing the old status
			// after a Confirm or Validate, which is most obvious on an applied count — the whole
			// point of which is seeing the new balance.
			refresh();
		});
	};

	const onClick = () => (action.prompt ? setPromptOpen(true) : publish());

	return (
		<>
			<Button
				variant='outline'
				size='compact-md'
				disabled={disabled || command.isPending}
				loading={command.isPending}
				locked={lock.locked}
				lockedMissing={lock.missing}
				onClick={onClick}
				{...commandAttrs(action.command)}
				{...tid('action', actionKey)}
			>
				{t(action.label)}
			</Button>
			{action.prompt && promptOpen ? (
				<ActionPromptModal
					opened={promptOpen}
					onClose={() => setPromptOpen(false)}
					prompt={action.prompt}
					actionKey={actionKey}
					resource={resource}
					isSubmitting={command.isPending}
					onSubmit={publish}
				/>
			) : null}
			<ActionRefusalAlert clientErrors={command.clientErrors} actionKey={actionKey} />
		</>
	);
}

/**
 * Shows why an action was refused.
 *
 * Without this the refusal is silent: the publish handler keeps the dialog open and refreshes, but
 * the server's explanation is dropped, so a user who presses Confirm on an order that cannot be
 * confirmed sees nothing happen at all. A refusal is a business answer the operator has to act on —
 * "this quotation lapsed and must be re-quoted" tells them what to do next — so it is shown rather
 * than logged.
 *
 * Translates the `key` with its `vars` and falls back to the server's `message`, the same order the
 * save path uses: an untranslated key would otherwise render as raw `sales:...` text on screen.
 */
function ActionRefusalAlert({ clientErrors, actionKey }: {
	clientErrors: ClientErrorItem[],
	actionKey: string,
}): React.ReactNode {
	const t = useTranslate(useResourceDetailTranslationNs());
	const tid = useResourceDetailTestAttrs();
	if (clientErrors.length === 0) {
		return null;
	}
	return (
		<Alert
			variant='light'
			color='red'
			icon={<IconAlertCircle />}
			mt='xs'
			{...tid('action', actionKey, 'refusal')}
		>
			{clientErrors.map((item, index) => (
				<div key={index}>{translateClientError(t, item)}</div>
			))}
		</Alert>
	);
}

/**
 * Whether a published command came back refused.
 *
 * A rejected action keeps its dialog open so the user's input survives — the same reasoning as the
 * save path, where losing a form to a validation failure is worse than the failure itself.
 */
function isPublishRejected(response: unknown): boolean {
	if (response == null || typeof response !== 'object') {
		return false;
	}
	const typed = response as { error?: unknown, result?: { clientErrors?: unknown[] } };
	return Boolean(typed.error) || Boolean(typed.result?.clientErrors?.length);
}

function hasMatchingExtraAction(
	contextualActions: ResourceDetailContextualActions | undefined,
	resource: Record<string, unknown>,
): boolean {
	if (!contextualActions) {
		return false;
	}

	return Object.values(contextualActions).some(
		action => !action.condition || evaluateCondition(action.condition, resource),
	);
}

function buildDefaultMutateRequest(resource: Record<string, unknown>): dyn.RestMutateOneRequest | null {
	const id = resource.id;
	const etag = resource.etag;
	if (typeof id !== 'string' || typeof etag !== 'string') {
		return null;
	}
	return { id, etag };
}


function StatusFlow({
	statuses, current,
}: {
	statuses: StatusOption[],
	current?: string | null,
}): React.ReactNode {
	const t = useTranslate(useResourceDetailTranslationNs());
	if (statuses.length === 0) {
		return null;
	}
	return (
		<Group gap={4} wrap='wrap'>
			{statuses.map((status, idx) => (
				<React.Fragment key={status.value}>
					{idx > 0 ? <IconChevronRight size={14} /> : null}
					<Badge variant='filled' color={status.value === current ? status.color : 'gray'}>
						{t(status.label)}
					</Badge>
				</React.Fragment>
			))}
		</Group>
	);
}
