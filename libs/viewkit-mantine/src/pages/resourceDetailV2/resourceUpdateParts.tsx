import { Divider, Group } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import * as dyn from '@nikkierp/common/dynamicModel';
import { showClientErrorModal } from '@nikkierp/common/service';
// The wrapper rather than Mantine's Button: it carries the `locked` state, and the design system
// prefers it wherever one exists.
import { Button, Link } from '@nikkierp/ui/components';
import { useCommand } from '@nikkierp/ui/hookhoc';
import { useTranslate } from '@nikkierp/ui/i18n';
import { commandAttrs } from '@nikkierp/viewengine/core';
import { evaluateCondition } from '@nikkierp/viewengine/metadata';
import { IconDeviceFloppy, IconPencil, IconPlus, IconX } from '@tabler/icons-react';
import React from 'react';
import { useNavigate } from 'react-router';

import { AuditToggleButton } from './audit/AuditToggleButton';
import { RecordStatusFlow } from './form/resourceStatusStrip';
import { useResourceUpdateContext } from './resourceUpdateContext';
import { ToolbarCompactProvider, useToolbarButtonContent, useToolbarCompactMeasure } from './toolbarCompact';
import { useRoutePathHref } from '../../data/useResourceLinkHref';
import { resolveActionCode, StandardActionCode, useActionLock, useAnyFieldActionLock } from '../../permissions';
import { ActionPromptModal } from '../resourceDetail/ActionPromptModal';
import { ComponentContextualAction } from '../resourceDetail/ComponentContextualAction';
import {
	useResourceDetailContext, useResourceDetailSchemaName, useResourceDetailTestAttrs, useResourceDetailTranslationNs,
} from '../resourceDetail/ResourceDetailProvider';
import { ResourceDetailOverflowMenu } from '../resourceDetail/resourceOverflowMenu';


import type { ResourceDetailContextualActions, ResourceDetailExtraAction } from '../resourceDetail/props';


export function CreateActionButton({ disabled = false }: { disabled?: boolean }): React.ReactNode {
	const t = useTranslate(useResourceDetailTranslationNs());
	const tid = useResourceDetailTestAttrs();
	const lock = useActionLock(useResourceDetailSchemaName(), StandardActionCode.Create);
	const content = useToolbarButtonContent(<IconPlus size={16} />, t('action.create'));
	return (
		<Button
			component={Link}
			to='../new'
			relative='path'
			isHistoryRoot
			disabled={disabled}
			locked={lock.locked}
			lockedMissing={lock.missing}
			variant='outline'
			{...tid('action', 'create')}
			{...content}
		/>
	);
}

export type ResourceActionBarProps = {
	/** The Create button, or nothing when the resource cannot be created. Shown in read mode only. */
	createAction?: React.ReactNode,
	onSaveClick: () => void,
	/** Discards edits and leaves update mode. Defaults to `setUpdateMode(false)` alone. */
	onCancel?: () => void,
	isLoading: boolean,
	updateMode: boolean,
	setUpdateMode: React.Dispatch<React.SetStateAction<boolean>>,
};

/**
 * The page-level action bar, rendered once in the header rather than inside the (possibly
 * collapsed) form section.
 *
 * Read mode: Create, a separator, Update, contextual actions, overflow menu; on the right the status
 * flow and the Audit toggle.
 * Update mode: Save and Discard alone, so nothing else can be started over unsaved edits; on the
 * right only the Audit toggle, which changes no data.
 */
export function ResourceActionBar({
	createAction, onSaveClick, onCancel, isLoading, updateMode, setUpdateMode,
}: ResourceActionBarProps): React.ReactNode {
	const { commands } = useResourceUpdateContext();
	const primaryActions = (
		<PrimaryActionButtons
			updateMode={updateMode}
			setUpdateMode={setUpdateMode}
			onCancel={onCancel}
			updateCommand={commands.update}
			onSaveClick={onSaveClick}
			isLoading={isLoading}
		/>
	);

	return (
		<ActionRow>
			{updateMode ? (
				<>
					<LeftToolbar>{primaryActions}</LeftToolbar>
					<RightToolbar />
				</>
			) : (
				<ReadModeActionBar createAction={createAction} primaryActions={primaryActions} isLoading={isLoading} />
			)}
		</ActionRow>
	);
}

/**
 * The action row: the left toolbar takes whatever width the right one leaves, and the row's own
 * measured width decides whether the icon buttons go compact (`toolbarCompact.tsx`), in both modes.
 */
function ActionRow({ children }: { children: React.ReactNode }): React.ReactNode {
	const { ref, compact } = useToolbarCompactMeasure();
	return (
		<ToolbarCompactProvider compact={compact}>
			<Group
				ref={ref} gap='xs' justify='space-between' wrap='nowrap' align='center' className='min-w-0 flex-1'
				data-compact={compact ? 'true' : undefined}
			>
				{children}
			</Group>
		</ToolbarCompactProvider>
	);
}

function LeftToolbar({ children }: { children: React.ReactNode }): React.ReactNode {
	return <Group gap='xs' align='center' wrap='wrap' className='min-w-0 flex-1'>{children}</Group>;
}

function ReadModeActionBar({ createAction, primaryActions, isLoading }: {
	createAction?: React.ReactNode,
	primaryActions: React.ReactNode,
	isLoading: boolean,
}): React.ReactNode {
	const { contextualActions, commands, resource } = useResourceUpdateContext();
	const hasVisibleContextualActions = resource != null && hasMatchingExtraAction(contextualActions, resource);
	const hasOverflowMenu = Boolean(commands.delete || commands.archive) && resource != null;
	// The status flow sits apart on the right, so it does not count as something the separator divides.
	const hasActionsAfterCreate = Boolean(commands.update) || hasVisibleContextualActions || hasOverflowMenu;

	return (
		<>
			<LeftToolbar>
				{createAction}
				{createAction && hasActionsAfterCreate ? <Divider orientation='vertical' my={4} /> : null}
				{primaryActions}
				{hasVisibleContextualActions ? (
					<ResourceDetailExtraActionButtons
						contextualActions={contextualActions}
						resource={resource}
						disabled={isLoading}
					/>
				) : null}
				{hasOverflowMenu ? <ResourceDetailOverflowMenu resource={resource} disabled={isLoading} /> : null}
			</LeftToolbar>
			<RightToolbar withStatusFlow />
		</>
	);
}

/**
 * The right half of the action row, its buttons flush right: the status flow (read mode, unless the
 * page moved it into its first section) and the Audit toggle (both modes).
 */
function RightToolbar({ withStatusFlow = false }: { withStatusFlow?: boolean }): React.ReactNode {
	const { statusPlacement = 'toolbar' } = useResourceUpdateContext();
	const tid = useResourceDetailTestAttrs();
	return (
		<Group gap='xs' align='center' justify='flex-end' wrap='wrap' className='min-w-0 shrink' {...tid('rightToolbar')}>
			{withStatusFlow && statusPlacement === 'toolbar' ? <RecordStatusFlow /> : null}
			<AuditToggleButton />
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
	// enter update mode at all, and Save inside it would then always be reachable. A grant on any
	// one field opens it; the fields the caller may not update then render locked.
	const { schemaPack } = useResourceDetailContext();
	const schemaFields = React.useMemo(() => Object.keys(schemaPack?.modelSchema?.fields ?? {}), [schemaPack]);
	const updateLock = useAnyFieldActionLock(useResourceDetailSchemaName(), StandardActionCode.Update, schemaFields);
	// Save comes first, as the primary action leads the row on every page.
	const updateContent = useToolbarButtonContent(<IconPencil size={16} />, t('action.edit'));
	const saveContent = useToolbarButtonContent(<IconDeviceFloppy size={16} />, t('action.save'));
	const discardContent = useToolbarButtonContent(<IconX size={16} />, t('action.discard'));
	if (!updateCommand) {
		return null;
	}

	if (updateMode) {
		return (
			<>
				<Button
					variant='filled'
					onClick={onSaveClick}
					disabled={isLoading}
					loading={isLoading}
					type='submit'
					{...commandAttrs(updateCommand)}
					{...tid('action', 'save')}
					{...saveContent}
				/>
				<Button
					variant='outline'
					onClick={() => (onCancel ? onCancel() : setUpdateMode(false))}
					{...tid('action', 'cancel')}
					{...discardContent}
				/>
			</>
		);
	}

	return (
		<Button
			onClick={() => setUpdateMode(true)}
			disabled={isLoading}
			locked={updateLock.locked}
			lockedMissing={updateLock.missing}
			variant='filled'
			{...tid('action', 'update')}
			{...updateContent}
		/>
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
 * One contextual action, in whichever of its three shapes the page authored.
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
	if (action.component) {
		return isActionVisible(action, resource) ? <ComponentContextualAction action={action} /> : null;
	}
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
	const onSucceeded = useActionSuccess(action);
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
			// A refusal is a business answer the operator has to act on ("this quotation lapsed and must
			// be re-quoted"), so it is shown, not dropped; the dialog stays open behind it.
			showClientErrorModal(t, response.result?.clientErrors ?? []);
			if (!isPublishRejected(response)) {
				setPromptOpen(false);
				if (onSucceeded(response)) {
					return;
				}
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
		</>
	);
}

/**
 * What a successful action does besides refreshing: the notice it declares, and, for an action that
 * creates another record of this resource, opening that record. True when the page navigated away,
 * so there is nothing left to refresh.
 */
function useActionSuccess(action: ResourceDetailExtraAction): (response: unknown) => boolean {
	const t = useTranslate(useResourceDetailTranslationNs());
	const navigate = useNavigate();
	return (response) => {
		if (action.successNotice) {
			notifications.show({ color: 'green', message: t(action.successNotice) });
		}
		const createdId = (response as { result?: { data?: { id?: unknown } } } | null)?.result?.data?.id;
		if (action.openResult && typeof createdId === 'string' && createdId !== '') {
			navigate(`../${createdId}`, { relative: 'path' });
			return true;
		}
		return false;
	};
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

	return Object.values(contextualActions).some(action => isActionVisible(action, resource));
}

function isActionVisible(action: ResourceDetailExtraAction, resource: Record<string, unknown>): boolean {
	return !action.condition || evaluateCondition(action.condition, resource);
}

function buildDefaultMutateRequest(resource: Record<string, unknown>): dyn.RestMutateOneRequest | null {
	const id = resource.id;
	const etag = resource.etag;
	if (typeof id !== 'string' || typeof etag !== 'string') {
		return null;
	}
	return { id, etag };
}
