import {
	ActionIcon, Badge, Button, Group, Menu, Stack, Text, Title,
} from '@mantine/core';
import * as dyn from '@nikkierp/common/dynamicModel';
import { AutoField } from '@nikkierp/ui/components/form';
import { useCommand } from '@nikkierp/ui/hookhoc';
import { useLocalize, useTranslate } from '@nikkierp/ui/i18n';
import { commandAttrs } from '@nikkierp/viewengine/core';
import { evaluateCondition } from '@nikkierp/viewengine/metadata';
import {
	IconArchive, IconArchiveOff, IconChevronDown, IconChevronRight, IconDeviceFloppy, IconDots,
	IconPencil, IconPlus, IconTrash, IconX,
} from '@tabler/icons-react';
import clsx from 'clsx';
import React from 'react';
import { Link } from 'react-router';

import classes from './ResourceDetail.module.css';
import { useResourceDetailContext, useResourceDetailTranslationNs } from './ResourceDetailProvider';
import { useResourceUpdateContext } from './resourceUpdateContext';
import { renderDisplayFieldValue } from '../../components/fieldValue';


import type {
	OwnPropertySection, ResourceDetailContextualActions, ResourceDetailExtraAction, StatusOption,
} from './props';


export function CreateActionButton({ disabled = false }: { disabled?: boolean }): React.ReactNode {
	const t = useTranslate(useResourceDetailTranslationNs());
	return (
		<Button
			component={Link}
			to='../new'
			relative='path'
			disabled={disabled}
			leftSection={<IconPlus size={16} />}
			variant='outline'
			size='compact-md'
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
			action={action}
			resource={resource}
			disabled={disabled}
		/>
	));
}

function ResourceDetailExtraActionButton({
	action, resource, disabled = false,
}: {
	action: ResourceDetailExtraAction,
	resource: Record<string, unknown>,
	disabled?: boolean,
}): React.ReactNode {
	const t = useTranslate(useResourceDetailTranslationNs());
	const command = useCommand(action.command);
	const isVisible = !action.condition || evaluateCondition(action.condition, resource);
	if (!isVisible) {
		return null;
	}

	const onClick = () => {
		const request = buildDefaultMutateRequest(resource);
		if (request != null) {
			void command.publish(request);
		}
	};

	return (
		<Button
			variant='outline'
			size='compact-md'
			disabled={disabled || command.isPending}
			loading={command.isPending}
			onClick={onClick}
			{...commandAttrs(action.command)}
		>
			{t(action.label)}
		</Button>
	);
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

function ResourceDetailOverflowMenu({
	resource, disabled = false,
}: {
	resource: Record<string, unknown>,
	disabled?: boolean,
}): React.ReactNode {
	const { commands, refresh } = useResourceUpdateContext();
	const t = useTranslate(useResourceDetailTranslationNs());
	const deleteCmd = useCommand(commands.delete ?? '');
	const archiveCmd = useCommand(commands.archive ?? '');
	const isBusy = disabled || deleteCmd.isPending || archiveCmd.isPending;

	const onDelete = () => {
		const id = resource.id;
		if (typeof id !== 'string' || !commands.delete) {
			return;
		}
		void deleteCmd.publish({ id }).then(refresh);
	};

	const showArchive = resource.is_archived === false;
	const showUnarchive = resource.is_archived === true;
	const onSetArchived = (archived: boolean) => {
		const request = buildArchiveRequest(resource, archived);
		if (request == null || !commands.archive) {
			return;
		}
		void archiveCmd.publish(request).then(refresh);
	};

	return (
		<Menu shadow='md' position='bottom-end'>
			<Menu.Target>
				<Button variant='outline' size='compact-md' aria-label='More actions' disabled={isBusy}>
					<IconDots size={16} />
				</Button>
			</Menu.Target>
			<Menu.Dropdown>
				{commands.delete ? (
					<Menu.Item
						leftSection={<IconTrash size={16} />}
						disabled={isBusy}
						onClick={onDelete}
						{...commandAttrs(commands.delete)}
					>
						{t('action.delete')}
					</Menu.Item>
				) : null}
				{commands.delete && commands.archive ? <Menu.Divider /> : null}
				{/* Archive and unarchive publish the same command and differ only by payload. */}
				{commands.archive && showArchive ? (
					<Menu.Item
						leftSection={<IconArchive size={16} />}
						disabled={isBusy}
						onClick={() => onSetArchived(true)}
						{...commandAttrs(commands.archive)}
					>
						{t('action.archive')}
					</Menu.Item>
				) : null}
				{commands.archive && showUnarchive ? (
					<Menu.Item
						leftSection={<IconArchiveOff size={16} />}
						disabled={isBusy}
						onClick={() => onSetArchived(false)}
						{...commandAttrs(commands.archive)}
					>
						{t('action.unarchive')}
					</Menu.Item>
				) : null}
			</Menu.Dropdown>
		</Menu>
	);
}

function buildArchiveRequest(
	resource: Record<string, unknown>,
	isArchived: boolean,
): dyn.RestSetIsArchivedRequest | null {
	const id = resource.id;
	const etag = resource.etag;
	if (typeof id !== 'string' || typeof etag !== 'string') {
		return null;
	}
	return { id, etag, is_archived: isArchived };
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

	if (!modelSchema) {
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
	if (fields.length === 0) {
		return <Text c='dimmed'>No fields configured</Text>;
	}

	if (updateMode) {
		return (
			<div className={classes.formFieldWrapper}>
				{fields.map(field => {
					if (!modelSchema.fields[field]) {
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
				if (!modelSchema.fields[field]) {
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

