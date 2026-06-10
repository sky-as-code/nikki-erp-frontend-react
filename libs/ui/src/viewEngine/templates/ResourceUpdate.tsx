import {
	ActionIcon, Alert, Anchor, Badge, Button, ButtonGroup, Collapse, Group, Menu, Paper, Stack, Text, Title,
} from '@mantine/core';
import * as dyn from '@nikkierp/common/dynamic_model';
import {
	IconAlertCircle,
	IconArchive, IconArchiveOff, IconChevronDown, IconChevronRight, IconCopy, IconDeviceFloppy, IconDots,
	IconPencil, IconPlus, IconTrash, IconX,
} from '@tabler/icons-react';
import clsx from 'clsx';
import React from 'react';
import { Link, useParams } from 'react-router';

import classes from './ResourceDetail.module.css';
import { DebugFormErrors, printDebugFormValues, useResourceDetailContext, useResourceDetailTranslationNs } from './ResourceDetailProvider';
import { ThunkPackHookReturn } from '../../appState';
import { AutoField, CrudFormProvider, FormStyleProvider, useFormFieldContext } from '../../components/form';
import { useLocalize, useTranslate } from '../../i18n';
import { MicroAppDispatchFn } from '../../microApp';

import type {
	LinkSpec, ResourceDetailContextualActions, ResourceDetailExtraAction, SchemaFieldSpec,
} from './ResourceDetail';


type StatusOption = { value: string, label: string, color: string };

type OwnPropertySection = {
	header: string,
	fieldType: 'SchemaFields' | 'CustomFields',
	fields?: string[],
};

type ResourceGetDataHookReturn = ThunkPackHookReturn<dyn.RestGetOneResponse<any>, unknown>;
type ResourceSubmitHookReturn = ThunkPackHookReturn<dyn.RestCreateResponse | dyn.RestMutateResponse, unknown>;

type ResourceUpdateActionHooks = {
	useArchive?: () => ThunkPackHookReturn<dyn.RestMutateResponse, dyn.RestSetIsArchivedRequest>,
	useCreate?: () => ThunkPackHookReturn<dyn.RestCreateResponse, any>,
	useDelete?: () => ThunkPackHookReturn<dyn.RestDeleteResponse, dyn.RestDeleteRequest>,
	useGetById: () => ThunkPackHookReturn<dyn.RestGetOneResponse<any>, dyn.RestGetByIdRequest>,
	useUpdate?: () => ThunkPackHookReturn<dyn.RestMutateResponse, dyn.RestUpdateRequest>,
};

type ResourceUpdateContextValue = {
	dispatch: MicroAppDispatchFn,
	allStatuses?: StatusOption[],
	currentStatus?: SchemaFieldSpec,
	contextualActions?: ResourceDetailContextualActions,
	titleLvl1?: SchemaFieldSpec,
	titleLvl2?: SchemaFieldSpec,
	titleLvl3?: LinkSpec,
	actionHooks: ResourceUpdateActionHooks,
	blocks: OwnPropertySection[],
};

const ResourceUpdateContext = React.createContext<ResourceUpdateContextValue | undefined>(undefined);

type ResourceUpdateProps = {
	dispatch: MicroAppDispatchFn,
	allStatuses?: StatusOption[],
	currentStatus?: SchemaFieldSpec,
	contextualActions?: ResourceDetailContextualActions,
	titleLvl1?: SchemaFieldSpec,
	titleLvl2?: SchemaFieldSpec,
	titleLvl3?: LinkSpec,
	actionHooks: ResourceUpdateActionHooks,
	blocks: OwnPropertySection[],
};

export function ResourceUpdate(props: ResourceUpdateProps): React.ReactNode {
	const value = React.useMemo(
		(): ResourceUpdateContextValue => ({
			dispatch: props.dispatch,
			allStatuses: props.allStatuses,
			currentStatus: props.currentStatus,
			contextualActions: props.contextualActions,
			titleLvl1: props.titleLvl1,
			titleLvl2: props.titleLvl2,
			titleLvl3: props.titleLvl3,
			actionHooks: props.actionHooks,
			blocks: props.blocks,
		}),
		[
			props.dispatch, props.allStatuses, props.currentStatus, props.contextualActions,
			props.titleLvl1, props.titleLvl2, props.titleLvl3, props.actionHooks, props.blocks,
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
	const { actionHooks, blocks } = useResourceUpdateContext();
	const [expanded, setExpanded] = React.useState(true);
	const [updateMode, setUpdateMode] = React.useState(false);
	const getByIdAct = actionHooks.useGetById();
	const modelSchema = schemaPack?.modelSchema;
	const localize = useLocalize(useResourceDetailTranslationNs());
	const { id } = useParams();
	const dataRequest = React.useMemo(() => ({ id: id! }), [id]);
	const useSubmitAction = actionHooks.useUpdate ?? actionHooks.useCreate;
	const fieldValues = (getByIdAct.data?.item ?? {}) as Record<string, unknown>;

	return modelSchema && useSubmitAction ? (
		<>
			<ResourceUpdateHeader />
			<FormStyleProvider layout='onecol'>
				<CrudFormProvider
					formVariant='update'
					schemaName={modelSchema.name}
					localize={localize}
					getDataRequest={dataRequest}
					useGetData={actionHooks.useGetById as () => ResourceGetDataHookReturn}
					useSubmit={useSubmitAction as () => ResourceSubmitHookReturn}
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
	const { schemaPack, isReading, isWriting } = useResourceDetailContext();
	const { actionHooks, titleLvl1, titleLvl2, titleLvl3 } = useResourceUpdateContext();
	const getByIdAct = actionHooks.useGetById();
	const createAct = actionHooks.useCreate?.();
	const data = getByIdAct.data?.item as Record<string, unknown> | undefined;
	const localize = useLocalize(useResourceDetailTranslationNs());
	const modelSchema = schemaPack?.modelSchema;
	const resourceName = localize(modelSchema?.label, { count: 99 });
	const showTitleLvl3 = Boolean(titleLvl3 && modelSchema);
	const showCreate = Boolean(actionHooks.useCreate);
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
						{showCreate && createAct ? (
							<CreateActionMenu
								useCreatePack={createAct}
								isAllowClone={false}
								disabled={isActionDisabled}
							/>
						) : null}
					</Group>
				) : null}
			</Stack>
		</Group>
	);
}

function CreateActionMenu({
	useCreatePack, isAllowClone, disabled = false,
}: {
	useCreatePack: ThunkPackHookReturn<dyn.RestCreateResponse, unknown>,
	isAllowClone: boolean,
	disabled?: boolean,
}): React.ReactNode {
	const t = useTranslate(useResourceDetailTranslationNs());
	if (!isAllowClone) {
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
	return (
		<ButtonGroup>
			<Button
				component={Link}
				to='../new'
				relative='path'
				disabled={disabled}
				leftSection={<IconPlus size={16} />}
				variant='outline'
				size='compact-md'
				styles={{ section: { marginInlineEnd: 0 } }}
			>
				{t('action.create')}
			</Button>
			<Menu shadow='md' position='bottom-end'>
				<Menu.Target>
					<Button variant='outline' size='compact-md' px={4} aria-label='More actions' disabled={disabled}>
						<IconChevronDown size={12} />
					</Button>
				</Menu.Target>
				<Menu.Dropdown>
					<Menu.Item
						disabled={disabled}
						onClick={() => void useCreatePack.thunkAction(undefined)}
						leftSection={<IconCopy size={16} />}
					>
						{t('action.duplicate')}
					</Menu.Item>
				</Menu.Dropdown>
			</Menu>
		</ButtonGroup>
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
	const { allStatuses, currentStatus, contextualActions, actionHooks } = useResourceUpdateContext();
	const getByIdAct = actionHooks.useGetById();
	const resource = getByIdAct.data?.item as Record<string, unknown> | undefined;
	const curStatusField = currentStatus?.schemaField;
	const status = curStatusField ? getByIdAct?.data?.item?.[curStatusField] : null;
	const hasVisibleContextualActions = resource != null && hasMatchingExtraAction(contextualActions, resource);
	const hasOverflowMenu = Boolean(actionHooks?.useDelete || actionHooks?.useArchive);

	return (
		<Group justify='space-between' wrap='wrap' className={clsx('sticky top-0 py-4', classes.bgBodyColor)}>
			<Group gap='xs' align='center'>
				<ActionIcon variant='subtle' size='sm' onClick={onToggleCollapse} aria-label='Toggle own properties'>
					{expanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
				</ActionIcon>
				<PrimaryActionButtons
					updateMode={updateMode}
					setUpdateMode={setUpdateMode}
					hasUpdate={Boolean(actionHooks?.useUpdate)}
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
	const { dispatch } = useResourceUpdateContext();
	const t = useTranslate(useResourceDetailTranslationNs());
	const actionPack = action.actionHook();
	const isVisible = !action.condition || action.condition(resource);
	if (!isVisible) {
		return null;
	}

	const onClick = () => {
		const request = action.buildRequest ? action.buildRequest(resource) : buildDefaultMutateRequest(resource);
		if (request != null) {
			dispatch(actionPack.thunkAction(request) as any);
		}
	};

	return (
		<Button
			variant='outline'
			size='compact-md'
			disabled={disabled || actionPack.isLoading}
			loading={actionPack.isLoading}
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
		action => !action.condition || action.condition(resource),
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
	const { dispatch, actionHooks } = useResourceUpdateContext();
	const t = useTranslate(useResourceDetailTranslationNs());
	const deletePack = actionHooks.useDelete?.();
	const archivePack = actionHooks.useArchive?.();
	const isBusy = disabled || Boolean(deletePack?.isLoading || archivePack?.isLoading);

	const onDelete = () => {
		const id = resource.id;
		if (typeof id !== 'string' || !deletePack) {
			return;
		}
		dispatch(deletePack.thunkAction({ id }) as any);
	};

	const showArchive = resource.is_archived === false;
	const showUnarchive = resource.is_archived === true;
	const onSetArchived = (archived: boolean) => {
		const request = buildArchiveRequest(resource, archived);
		if (request == null || !archivePack) {
			return;
		}
		dispatch(archivePack.thunkAction(request) as any);
	};

	return (
		<Menu shadow='md' position='bottom-end'>
			<Menu.Target>
				<Button variant='outline' size='compact-md' aria-label='More actions' disabled={isBusy}>
					<IconDots size={16} />
				</Button>
			</Menu.Target>
			<Menu.Dropdown>
				{actionHooks.useDelete ? (
					<Menu.Item leftSection={<IconTrash size={16} />} disabled={isBusy} onClick={onDelete}>
						{t('action.delete')}
					</Menu.Item>
				) : null}
				{actionHooks.useDelete && actionHooks.useArchive ? <Menu.Divider /> : null}
				{actionHooks.useArchive && showArchive ? (
					<Menu.Item
						leftSection={<IconArchive size={16} />}
						disabled={isBusy}
						onClick={() => onSetArchived(true)}
					>
						{t('action.archive')}
					</Menu.Item>
				) : null}
				{actionHooks.useArchive && showUnarchive ? (
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
