import {
	ActionIcon, Anchor, Badge, Button, Group, Menu, Paper, Stack, Text, Title,
} from '@mantine/core';
import * as dyn from '@nikkierp/common/dynamicModel';
import {
	IconArchive, IconArchiveOff, IconChevronDown, IconChevronRight, IconDeviceFloppy, IconDots,
	IconPencil, IconPlus, IconTrash, IconX,
} from '@tabler/icons-react';
import clsx from 'clsx';
import React from 'react';
import { Link } from 'react-router';

import { toLangJson } from './fieldRenderers';
import classes from './ResourceDetail.module.css';
import { useResourceDetailContext, useResourceDetailTranslationNs } from './ResourceDetailProvider';
import { useResourceUpdateContext } from './resourceUpdateContext';
import { AutoField } from '../../components/form';
import { useCommand } from '../../hookhoc';
import { JsonLangText, useLocalize, useTranslate } from '../../i18n';
import { evaluateCondition } from '../metadata/expression';

import type {
	LinkSpec, OwnPropertySection, ResourceDetailContextualActions, ResourceDetailExtraAction,
	SchemaFieldSpec, StatusOption,
} from './ResourceDetail';


export type ResourceUpdateHeaderProps = {
	titleLvl1?: SchemaFieldSpec,
	titleLvl2?: SchemaFieldSpec,
	titleLvl3?: LinkSpec,
};

/** Title overrides fall back to the values held in the resource-update context. */
export function ResourceUpdateHeader(headerProps: ResourceUpdateHeaderProps = {}): React.ReactNode {
	const { schemaPack } = useResourceDetailContext();
	const context = useResourceUpdateContext();
	const { commands, resource, isReading, isWriting } = context;
	const titleLvl1 = headerProps.titleLvl1 ?? context.titleLvl1;
	const titleLvl2 = headerProps.titleLvl2 ?? context.titleLvl2;
	const titleLvl3 = headerProps.titleLvl3 ?? context.titleLvl3;
	const data = resource;
	const localize = useLocalize(useResourceDetailTranslationNs());
	const modelSchema = schemaPack?.modelSchema;
	const resourceName = localize(modelSchema?.label, { count: 99 });
	const showTitleLvl3 = Boolean(titleLvl3 && modelSchema);
	const showCreate = Boolean(commands.create);
	const isActionDisabled = isReading || isWriting;

	return (
		<Group gap={4}>
			<Stack gap={4}>
				{titleLvl1 ? (
					<Title order={3}>
						{renderDisplayFieldValue(
							data?.[titleLvl1.schemaField],
							modelSchema?.fields[titleLvl1.schemaField],
						)}
					</Title>
				) : null}
				{titleLvl2 ? (
					<Text>
						{renderDisplayFieldValue(
							data?.[titleLvl2.schemaField],
							modelSchema?.fields[titleLvl2.schemaField],
						)}
					</Text>
				) : null}
				{showTitleLvl3 || showCreate ? (
					<Group gap='xs' align='center'>
						{showTitleLvl3 ? (
							<Anchor
								component={Link}
								to={titleLvl3!.linkHref}
								relative='path'
								size='md'
								className='capitalize'
							>
								{resourceName}
							</Anchor>
						) : null}
						{showCreate ? <CreateActionButton disabled={isActionDisabled} /> : null}
					</Group>
				) : null}
			</Stack>
		</Group>
	);
}

function CreateActionButton({ disabled = false }: { disabled?: boolean }): React.ReactNode {
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
				<ActionIcon variant='subtle' size='sm' onClick={onToggleCollapse} aria-label='Toggle own properties'>
					{expanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
				</ActionIcon>
				<PrimaryActionButtons
					updateMode={updateMode}
					setUpdateMode={setUpdateMode}
					hasUpdate={Boolean(commands.update)}
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
	hasUpdate: boolean,
	onSaveClick: () => void,
	isLoading: boolean,
};

function PrimaryActionButtons({
	updateMode, setUpdateMode, hasUpdate, onSaveClick, isLoading,
}: PrimaryActionButtonsProps): React.ReactNode {
	const t = useTranslate(useResourceDetailTranslationNs());
	if (!hasUpdate) {
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
		const request = action.buildRequest ? action.buildRequest(resource) : buildDefaultMutateRequest(resource);
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
					<Menu.Item leftSection={<IconTrash size={16} />} disabled={isBusy} onClick={onDelete}>
						{t('action.delete')}
					</Menu.Item>
				) : null}
				{commands.delete && commands.archive ? <Menu.Divider /> : null}
				{commands.archive && showArchive ? (
					<Menu.Item
						leftSection={<IconArchive size={16} />}
						disabled={isBusy}
						onClick={() => onSetArchived(true)}
					>
						{t('action.archive')}
					</Menu.Item>
				) : null}
				{commands.archive && showUnarchive ? (
					<Menu.Item
						leftSection={<IconArchiveOff size={16} />}
						disabled={isBusy}
						onClick={() => onSetArchived(false)}
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

export function PaperWithBorder({ children }: { children: React.ReactNode }): React.ReactNode {
	return (
		<Paper withBorder className='px-4 pb-4'>
			{children}
		</Paper>
	);
}

export function formatFieldValue(fieldValue: unknown): string {
	if (fieldValue === null || fieldValue === undefined || fieldValue === '') {
		return '-';
	}
	if (typeof fieldValue === 'string' || typeof fieldValue === 'number' || typeof fieldValue === 'boolean') {
		return String(fieldValue);
	}
	try {
		return JSON.stringify(fieldValue);
	}
	catch {
		return String(fieldValue);
	}
}

function getFieldDataTypeName(
	fieldSchema?: dyn.ModelSchemaField,
): dyn.ModelSchemaFieldDataTypeName | null {
	if (!fieldSchema) {
		return null;
	}
	if (typeof fieldSchema.data_type === 'string') {
		return fieldSchema.data_type;
	}
	return fieldSchema.data_type.name;
}

function renderDisplayFieldValue(
	fieldValue: unknown,
	fieldSchema?: dyn.ModelSchemaField,
): React.ReactNode {
	if (getFieldDataTypeName(fieldSchema) === 'nikkiLangJson') {
		return <JsonLangText langJson={toLangJson(fieldValue)} />;
	}
	return formatFieldValue(fieldValue);
}
