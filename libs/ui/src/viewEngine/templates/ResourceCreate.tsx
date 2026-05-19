import { ActionIcon, Anchor, Button, Collapse, Group, Paper, Stack, Text, Title } from '@mantine/core';
import * as dyn from '@nikkierp/common/dynamic_model';
import { IconChevronDown, IconChevronRight, IconDeviceFloppy } from '@tabler/icons-react';
import clsx from 'clsx';
import React from 'react';
import { Link, useNavigate } from 'react-router';

import classes from './ResourceDetail.module.css';
import { useResourceDetailContext, useResourceDetailTranslationNs } from './ResourceDetailProvider';
import { ThunkPackHookReturn } from '../../appState';
import { AutoField, CrudFormProvider, FormStyleProvider } from '../../components/form';
import { useLocalize, useTranslate } from '../../i18n';
import { useMicroAppDispatch } from '../../microApp';

import type { LinkSpec, SchemaFieldSpec } from './ResourceDetail';


type OwnPropertySection = {
	header: string,
	fieldType: 'SchemaFields' | 'CustomFields',
	fields?: string[],
};

type ResourceCreateContextValue = {
	actionHooks: {
		useCreate?: () => ThunkPackHookReturn<dyn.RestCreateResponse, any>,
	},
	titleLvl1?: SchemaFieldSpec,
	titleLvl3?: LinkSpec,
	blocks: OwnPropertySection[],
};

const ResourceCreateContext = React.createContext<ResourceCreateContextValue | undefined>(undefined);

type ResourceCreateProps = {
	actionHooks: ResourceCreateContextValue['actionHooks'],
	titleLvl1?: SchemaFieldSpec,
	titleLvl3?: LinkSpec,
	blocks: OwnPropertySection[],
};

export function ResourceCreate(props: ResourceCreateProps): React.ReactNode {
	const value = React.useMemo(
		(): ResourceCreateContextValue => ({
			actionHooks: props.actionHooks,
			titleLvl1: props.titleLvl1,
			titleLvl3: props.titleLvl3,
			blocks: props.blocks,
		}),
		[props.actionHooks, props.titleLvl1, props.titleLvl3, props.blocks],
	);

	return (
		<ResourceCreateContext.Provider value={value}>
			<ResourceCreateContent />
		</ResourceCreateContext.Provider>
	);
}

function useResourceCreateContext(): ResourceCreateContextValue {
	const value = React.useContext(ResourceCreateContext);
	if (value === undefined) {
		throw new Error('useResourceCreateContext must be used within ResourceCreate');
	}
	return value;
}

function ResourceCreateContent(): React.ReactNode {
	const { schemaPack } = useResourceDetailContext();
	const { actionHooks } = useResourceCreateContext();
	const modelSchema = schemaPack?.modelSchema;

	if (!modelSchema || !actionHooks.useCreate) {
		return null;
	}

	return (
		<>
			<ResourceCreateHeader />
			<ResourceCreateForm />
		</>
	);
}

function useNavigateAfterCreate(
	createAct: ThunkPackHookReturn<dyn.RestCreateResponse, unknown> | undefined,
): void {
	const navigate = useNavigate();
	const dispatch = useMicroAppDispatch();

	React.useEffect(() => {
		if (!createAct?.isDone || createAct.isError || !createAct.data?.id) {
			return;
		}
		navigate(`../${createAct.data.id}`, { relative: 'path', replace: true });
		dispatch(createAct.resetAction());
	}, [
		createAct?.isDone, createAct?.isError, createAct?.data?.id,
		createAct?.resetAction, navigate, dispatch,
	]);
}

function ResourceCreateHeader(): React.ReactNode {
	const { schemaPack } = useResourceDetailContext();
	const { titleLvl1, titleLvl3 } = useResourceCreateContext();
	const t = useTranslate(useResourceDetailTranslationNs());
	const localize = useLocalize(useResourceDetailTranslationNs());
	const modelSchema = schemaPack?.modelSchema;
	const resourceName = localize(modelSchema?.label, { count: 99 });
	const showTitleLvl3 = Boolean(titleLvl3 && modelSchema);

	return (
		<Group gap={4}>
			<Stack gap={4}>
				{titleLvl1 ? (
					<Title order={3}>
						<span className='capitalize'>{t('form.newResource', { resource: resourceName })}</span>
					</Title>
				) : null}
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
			</Stack>
		</Group>
	);
}

function ResourceCreateForm(): React.ReactNode {
	const { schemaPack } = useResourceDetailContext();
	const translationNs = useResourceDetailTranslationNs();
	const { actionHooks, blocks } = useResourceCreateContext();
	const createAct = actionHooks.useCreate?.();
	const [expanded, setExpanded] = React.useState(true);
	const localize = useLocalize(translationNs);
	const modelSchema = schemaPack?.modelSchema;

	useNavigateAfterCreate(createAct);

	if (!modelSchema || !actionHooks.useCreate) {
		return null;
	}

	return (
		<FormStyleProvider layout='onecol'>
			<CrudFormProvider
				formVariant='create'
				schemaName={modelSchema.name}
				localize={localize}
				useSubmit={
					actionHooks.useCreate as
						() => ThunkPackHookReturn<dyn.RestCreateResponse | dyn.RestMutateResponse, unknown>
				}
			>
				{({ handleSubmit, isLoading }) => (
					<Stack component={PaperWithBorder} gap='md'>
						<ResourceCreateActionBar
							expanded={expanded}
							onToggleCollapse={() => setExpanded(prev => !prev)}
							onSaveClick={handleSubmit()}
							isLoading={isLoading}
						/>
						<Collapse
							expanded={expanded}
							transitionDuration={500}
							transitionTimingFunction='ease-in-out'
							className={classes.containerInlineSize}
						>
							<div className={classes.formBlockWrapper}>
								{blocks.map(block => (
									<ResourceCreateBlock key={block.header} block={block} isLoading={isLoading} />
								))}
							</div>
						</Collapse>
					</Stack>
				)}
			</CrudFormProvider>
		</FormStyleProvider>
	);
}

function ResourceCreateActionBar({
	expanded, onToggleCollapse, onSaveClick, isLoading,
}: {
	expanded: boolean,
	onToggleCollapse: () => void,
	onSaveClick: () => void,
	isLoading: boolean,
}): React.ReactNode {
	const t = useTranslate(useResourceDetailTranslationNs());
	return (
		<Group gap='xs' align='center' className={clsx('sticky top-0 py-4', classes.bgBodyColor)}>
			<ActionIcon variant='subtle' size='sm' onClick={onToggleCollapse} aria-label='Toggle own properties'>
				{expanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
			</ActionIcon>
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
		</Group>
	);
}

function ResourceCreateBlock({
	block, isLoading,
}: {
	block: OwnPropertySection,
	isLoading: boolean,
}): React.ReactNode {
	const { schemaPack } = useResourceDetailContext();
	const t = useTranslate(useResourceDetailTranslationNs());
	const modelSchema = schemaPack?.modelSchema;

	if (!modelSchema) {
		return null;
	}

	return (
		<Stack gap='sm' className={classes.formBlock}>
			<Title order={4}>{t(block.header)}</Title>
			{block.fieldType === 'SchemaFields' ? (
				<ResourceCreateFieldGroup fields={block.fields ?? []} isLoading={isLoading} modelSchema={modelSchema} />
			) : (
				<Text c='dimmed'>Custom fields placeholder</Text>
			)}
		</Stack>
	);
}

function ResourceCreateFieldGroup({
	fields, isLoading, modelSchema,
}: {
	fields: string[],
	isLoading: boolean,
	modelSchema: dyn.ModelSchema,
}): React.ReactNode {
	if (fields.length === 0) {
		return <Text c='dimmed'>No fields configured</Text>;
	}

	return (
		<div className={classes.formFieldWrapper}>
			{fields.map(field => {
				const fieldDef = modelSchema.fields[field];
				if (!fieldDef || fieldDef.is_system_field || fieldDef.is_primary_key) {
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

function PaperWithBorder({ children }: { children: React.ReactNode }): React.ReactNode {
	return (
		<Paper withBorder className='px-4 pb-4'>
			{children}
		</Paper>
	);
}
