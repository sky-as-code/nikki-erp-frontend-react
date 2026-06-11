import {
	ActionIcon, Anchor, Badge, Button, Collapse, Group, Menu, Paper, Stack, Text, Title,
} from '@mantine/core';
import * as dyn from '@nikkierp/common/dynamicModel';
import {
	IconArchive, IconArchiveOff, IconChevronDown, IconChevronRight, IconDeviceFloppy, IconDots,
	IconPencil, IconPlus, IconTrash, IconX,
} from '@tabler/icons-react';
import clsx from 'clsx';
import React from 'react';
import { Link, useParams } from 'react-router';

import classes from './ResourceDetail.module.css';
import { DebugFormErrors, printDebugFormValues, useResourceDetailContext, useResourceDetailTranslationNs } from './ResourceDetailProvider';
import { AutoField, CrudFormProvider, FormStyleProvider } from '../../components/form';
import { useCommand } from '../../hookhoc';
import { useLocalize, useTranslate } from '../../i18n';
import { useCommandBus } from '../../microApp';
import { RenderNode } from '../metadata/compilePage';
import { evaluateCondition } from '../metadata/expression';
import { AdapterContext } from '../metadata/registry';
import { MetadataNode } from '../metadata/types';

import type {
	LinkSpec, OwnPropertySection, ResourceDetailContextualActions, ResourceDetailExtraAction,
	ResourceDetailStandardActionCommands, SchemaFieldSpec, StatusOption,
} from './ResourceDetail';


type ResourceUpdateContextValue = {
	commands: ResourceDetailStandardActionCommands,
	resource?: Record<string, unknown>,
	isReading: boolean,
	isWriting: boolean,
	refresh: () => void,
	onSubmit: (data: Record<string, any>) => void,
	allStatuses?: StatusOption[],
	currentStatus?: SchemaFieldSpec,
	contextualActions?: ResourceDetailContextualActions,
	titleLvl1?: SchemaFieldSpec,
	titleLvl2?: SchemaFieldSpec,
	titleLvl3?: LinkSpec,
	blocks: OwnPropertySection[],
	childrenNodes?: MetadataNode[],
};

const ResourceUpdateContext = React.createContext<ResourceUpdateContextValue | undefined>(undefined);

type ResourceUpdateProps = {
	standardActionCommands: ResourceDetailStandardActionCommands,
	allStatuses?: StatusOption[],
	currentStatus?: SchemaFieldSpec,
	contextualActions?: ResourceDetailContextualActions,
	titleLvl1?: SchemaFieldSpec,
	titleLvl2?: SchemaFieldSpec,
	titleLvl3?: LinkSpec,
	blocks: OwnPropertySection[],
	childrenNodes?: MetadataNode[],
};

export function ResourceUpdate(props: ResourceUpdateProps): React.ReactNode {
	const commands = props.standardActionCommands;
	const { id } = useParams();
	const getByIdCmd = useCommand<dyn.RestGetOneResponse<any>>(commands.getById ?? '');
	const updateCmd = useCommand<dyn.RestMutateResponse>(commands.update ?? '');
	const publishGet = getByIdCmd.publish;
	const publishUpdate = updateCmd.publish;

	const refresh = React.useCallback(() => {
		if (commands.getById && id && id !== 'new') {
			void publishGet({ id });
		}
	}, [publishGet, commands.getById, id]);

	React.useEffect(() => { refresh(); }, [refresh]);

	const onSubmit = React.useCallback((data: Record<string, any>) => {
		if (commands.update) {
			void publishUpdate(data).then(refresh);
		}
	}, [publishUpdate, commands.update, refresh]);

	const resource = getByIdCmd.data?.item as Record<string, unknown> | undefined;
	const value = React.useMemo(
		(): ResourceUpdateContextValue => ({
			commands,
			resource,
			isReading: getByIdCmd.isPending,
			isWriting: updateCmd.isPending,
			refresh,
			onSubmit,
			allStatuses: props.allStatuses,
			currentStatus: props.currentStatus,
			contextualActions: props.contextualActions,
			titleLvl1: props.titleLvl1,
			titleLvl2: props.titleLvl2,
			titleLvl3: props.titleLvl3,
			blocks: props.blocks,
			childrenNodes: props.childrenNodes,
		}),
		[
			commands, resource, getByIdCmd.isPending, updateCmd.isPending, refresh, onSubmit,
			props.allStatuses, props.currentStatus, props.contextualActions,
			props.titleLvl1, props.titleLvl2, props.titleLvl3, props.blocks, props.childrenNodes,
		],
	);

	return (
		<ResourceUpdateContext.Provider value={value}>
			<ResourceUpdateContent />
		</ResourceUpdateContext.Provider>
	);
}

function useResourceUpdateContext(): ResourceUpdateContextValue {
	const value = React.useContext(ResourceUpdateContext);
	if (value === undefined) {
		throw new Error('useResourceUpdateContext must be used within ResourceUpdate');
	}
	return value;
}

function ResourceUpdateContent(): React.ReactNode {
	const { schemaPack } = useResourceDetailContext();
	const { commands, resource, isWriting, onSubmit, blocks, childrenNodes } = useResourceUpdateContext();
	const [expanded, setExpanded] = React.useState(true);
	const [updateMode, setUpdateMode] = React.useState(false);
	const modelSchema = schemaPack?.modelSchema;
	const localize = useLocalize(useResourceDetailTranslationNs());
	const fieldValues = (resource ?? {}) as Record<string, unknown>;

	return modelSchema && commands.update && commands.getById ? (
		<>
			<ResourceUpdateHeader />
			<FormStyleProvider layout='onecol'>
				<CrudFormProvider
					formVariant='update'
					schemaName={modelSchema.name}
					localize={localize}
					modelValue={resource ?? null}
					isSubmitting={isWriting}
					onSubmit={onSubmit}
				>
					{({ handleSubmit, isLoading, errors: formErrors }) => (
						<Stack component={PaperWithBorder} gap='md'>
							<SectionActionBar
								expanded={expanded}
								onToggleCollapse={() => setExpanded(prev => !prev)}
								onSaveClick={handleSubmit(printDebugFormValues)}
								isLoading={isLoading}
								updateMode={updateMode}
								setUpdateMode={setUpdateMode}
							/>
							<Collapse
								expanded={expanded}
								transitionDuration={500}
								transitionTimingFunction='ease-in-out'
								className={classes.containerInlineSize}
							>
								<DebugFormErrors errors={formErrors} />
								<div className={classes.formBlockWrapper}>
									{blocks.map(block => (
										<OwnPropertiesBlock
											key={block.header}
											block={block}
											isLoading={isLoading}
											fieldValues={fieldValues}
											updateMode={updateMode}
										/>
									))}
									<AppendedChildren nodes={childrenNodes} />
								</div>
							</Collapse>
						</Stack>
					)}
				</CrudFormProvider>
			</FormStyleProvider>
		</>
	) : null;
}

function ResourceUpdateHeader(): React.ReactNode {
	const { schemaPack } = useResourceDetailContext();
	const { commands, resource, titleLvl1, titleLvl2, titleLvl3, isReading, isWriting } = useResourceUpdateContext();
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
					<Title order={3}>{formatFieldValue(data?.[titleLvl1.schemaField])}</Title>
				) : null}
				{titleLvl2 ? (
					<Text>{formatFieldValue(data?.[titleLvl2.schemaField])}</Text>
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

type SectionActionBarProps = {
	expanded: boolean,
	onToggleCollapse: () => void,
	onSaveClick: () => void,
	isLoading: boolean,
	updateMode: boolean,
	setUpdateMode: React.Dispatch<React.SetStateAction<boolean>>,
};

function SectionActionBar({
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

function AppendedChildren({ nodes }: { nodes?: MetadataNode[] }): React.ReactNode {
	const commandBus = useCommandBus();
	const translationNs = useResourceDetailTranslationNs();
	const ctx = React.useMemo<AdapterContext>(() => ({ commandBus, translationNs }), [commandBus, translationNs]);
	if (!nodes || nodes.length === 0) {
		return null;
	}
	return <>{nodes.map((node, index) => <RenderNode key={index} node={node} ctx={ctx} />)}</>;
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

function OwnPropertiesBlock({
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
			{block.fieldType === 'SchemaFields' ? (
				<FieldGroupVertical
					fields={block.fields ?? []}
					isLoading={isLoading}
					modelSchema={modelSchema}
					fieldValues={fieldValues}
					updateMode={updateMode}
				/>
			) : (
				<Text c='dimmed'>Custom fields placeholder</Text>
			)}
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
						<Text size='md'>{formatFieldValue(fieldValues[field])}</Text>
					</Stack>
				);
			})}
		</div>
	);
}

function PaperWithBorder({ children }: { children: React.ReactNode }): React.ReactNode {
	return (
		<Paper withBorder className='px-4 pb-4'>
			{children}
		</Paper>
	);
}

function formatFieldValue(fieldValue: unknown): string {
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
