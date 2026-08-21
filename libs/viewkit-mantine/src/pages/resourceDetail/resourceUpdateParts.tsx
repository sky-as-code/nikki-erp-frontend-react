import {
	ActionIcon, Badge, Button, Group, Stack, Text, Title,
} from '@mantine/core';
import * as dyn from '@nikkierp/common/dynamicModel';
import { AutoField } from '@nikkierp/ui/components/form';
import { useCommand } from '@nikkierp/ui/hookhoc';
import { useLocalize, useTranslate } from '@nikkierp/ui/i18n';
import { commandAttrs } from '@nikkierp/viewengine/core';
import { evaluateCondition } from '@nikkierp/viewengine/metadata';
import {
	IconChevronDown, IconChevronRight, IconDeviceFloppy, IconPencil, IconPlus, IconX,
} from '@tabler/icons-react';
import clsx from 'clsx';
import React from 'react';
import { Link } from 'react-router';

import { ActionPromptModal } from './ActionPromptModal';
import { hasVisibleField, isFieldVisible } from './fieldVisibility';
import classes from './ResourceDetail.module.css';
import {
	useResourceDetailContext, useResourceDetailTestAttrs, useResourceDetailTranslationNs,
} from './ResourceDetailProvider';
import { ResourceDetailOverflowMenu } from './resourceOverflowMenu';
import { useResourceUpdateContext } from './resourceUpdateContext';
import { renderDisplayFieldValue } from '../../components/fieldValue';
import { useRoutePathHref } from '../../data/useResourceLinkHref';


import type {
	OwnPropertySection, ResourceDetailContextualActions, ResourceDetailExtraAction, StatusOption,
} from './props';


export function CreateActionButton({ disabled = false }: { disabled?: boolean }): React.ReactNode {
	const t = useTranslate(useResourceDetailTranslationNs());
	const tid = useResourceDetailTestAttrs();
	return (
		<Button
			component={Link}
			to='../new'
			relative='path'
			disabled={disabled}
			leftSection={<IconPlus size={16} />}
			variant='outline'
			size='compact-md'
			{...tid('action', 'create')}
		>
			{t('action.create')}
		</Button>
	);
}

export type SectionActionBarProps = {
	expanded: boolean,
	onToggleCollapse: () => void,
	onSaveClick: () => void,
	isLoading: boolean,
	updateMode: boolean,
	setUpdateMode: React.Dispatch<React.SetStateAction<boolean>>,
};

export function SectionActionBar({
	expanded, onToggleCollapse, onSaveClick, isLoading, updateMode, setUpdateMode,
}: SectionActionBarProps): React.ReactNode {
	const { allStatuses, currentStatus, contextualActions, commands, resource } = useResourceUpdateContext();
	const tid = useResourceDetailTestAttrs();
	const curStatusField = currentStatus?.schemaField;
	const status = curStatusField ? resource?.[curStatusField] : null;
	const hasVisibleContextualActions = resource != null && hasMatchingExtraAction(contextualActions, resource);
	const hasOverflowMenu = Boolean(commands.delete || commands.archive);

	return (
		<Group justify='space-between' wrap='wrap' className={clsx('sticky top-0 py-4', classes.bgBodyColor)}>
			<Group gap='xs' align='center'>
				<ActionIcon
					variant='subtle'
					size='sm'
					onClick={onToggleCollapse}
					aria-label='Toggle own properties'
					{...tid('toggleOwnProperties')}
				>
					{expanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
				</ActionIcon>
				<PrimaryActionButtons
					updateMode={updateMode}
					setUpdateMode={setUpdateMode}
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
	/**
	 * The command Save publishes, or undefined when the resource is read-only. Carried as the
	 * string rather than a boolean so Save can name it in `data-command`.
	 */
	updateCommand?: string,
	onSaveClick: () => void,
	isLoading: boolean,
};

function PrimaryActionButtons({
	updateMode, setUpdateMode, updateCommand, onSaveClick, isLoading,
}: PrimaryActionButtonsProps): React.ReactNode {
	const t = useTranslate(useResourceDetailTranslationNs());
	const tid = useResourceDetailTestAttrs();
	if (!updateCommand) {
		return null;
	}

	if (updateMode) {
		return (
			<>
				<Button
					variant='outline'
					size='compact-md'
					onClick={() => setUpdateMode(false)}
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

export function OwnPropertiesBlock({
	block, isLoading, fieldValues, updateMode,
}: {
	block: OwnPropertySection,
	isLoading: boolean,
	fieldValues: Record<string, unknown>,
	updateMode: boolean,
}): React.ReactNode {
	const { schemaPack } = useResourceDetailContext();
	const modelSchema = schemaPack?.modelSchema;
	const t = useTranslate(useResourceDetailTranslationNs());
	const mode = updateMode ? 'update' : 'read';

	// A header over nothing reads as a broken section, so a block whose fields all filter out is
	// dropped along with its title.
	if (!modelSchema || !hasVisibleField(modelSchema, block.fields ?? [], mode, fieldValues)) {
		return null;
	}

	return (
		<Stack gap='sm' className={classes.formBlock}>
			<Title order={4}>{t(block.header)}</Title>
			<FieldGroupVertical
				fields={block.fields ?? []}
				isLoading={isLoading}
				modelSchema={modelSchema}
				fieldValues={fieldValues}
				updateMode={updateMode}
			/>
		</Stack>
	);
}

function FieldGroupVertical({
	fields, isLoading, modelSchema, fieldValues, updateMode,
}: {
	fields: string[],
	isLoading: boolean,
	modelSchema: dyn.ModelSchema,
	fieldValues: Record<string, unknown>,
	updateMode: boolean,
}): React.ReactNode {
	const localize = useLocalize(useResourceDetailTranslationNs());

	if (updateMode) {
		return (
			<div className={classes.formFieldWrapper}>
				{fields.map(field => {
					if (!isFieldVisible(modelSchema, field, 'update')) {
						return null;
					}
					return (
						<Stack key={field} gap={4}>
							<AutoField name={field} inputProps={{ disabled: isLoading }} />
						</Stack>
					);
				})}
			</div>
		);
	}

	return (
		<div className={classes.formFieldWrapper}>
			{fields.map(field => {
				if (!isFieldVisible(modelSchema, field, 'read', fieldValues)) {
					return null;
				}
				return (
					<Stack key={field} gap={4}>
						<Text size='md' fw='bold'>{localize(modelSchema.fields[field].label)}</Text>
						<Text size='md'>
							{renderDisplayFieldValue(fieldValues[field], modelSchema.fields[field])}
						</Text>
					</Stack>
				);
			})}
		</div>
	);
}

