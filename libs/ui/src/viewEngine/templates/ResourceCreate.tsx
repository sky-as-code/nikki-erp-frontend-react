import { Collapse, Paper, Stack } from '@mantine/core';
import * as dyn from '@nikkierp/common/dynamicModel';
import React from 'react';
import { useNavigate } from 'react-router';

import classes from './ResourceDetail.module.css';
import { useResourceDetailContext, useResourceDetailTranslationNs } from './ResourceDetailProvider';
import { ResourceCreateContext, ResourceCreateContextValue, useResourceCreateContext } from './resourceCreateContext';
import { ResourceCreateActionBar, ResourceCreateBlock, ResourceCreateHeader } from './resourceCreateParts';
import { CrudFormProvider, FormStyleProvider } from '../../components/form';
import { useCommand } from '../../hookhoc';
import { useLocalize } from '../../i18n';

import type { LinkSpec, OwnPropertySection, ResourceDetailStandardActionCommands, SchemaFieldSpec } from './ResourceDetail';


export type ResourceCreateProps = {
	commands: ResourceDetailStandardActionCommands,
	titleLvl1?: SchemaFieldSpec,
	titleLvl3?: LinkSpec,
	blocks: OwnPropertySection[],
};

export function ResourceCreate(props: ResourceCreateProps): React.ReactNode {
	return (
		<ResourceCreateProvider {...props}>
			<ResourceCreateContent />
		</ResourceCreateProvider>
	);
}

/** Wires the create command and provides {@link ResourceCreateContext} to its subtree. */
export function ResourceCreateProvider(
	props: ResourceCreateProps & { children: React.ReactNode },
): React.ReactNode {
	const createCmd = useCommand<dyn.RestCreateResponse>(props.commands.create ?? '');
	const publishCreate = createCmd.publish;
	const onSubmit = React.useCallback(
		(data: Record<string, any>) => {
			if (props.commands.create) {
				void publishCreate(data);
			}
		},
		[publishCreate, props.commands.create],
	);

	useNavigateAfterCreate(createCmd.data?.id);

	const value = React.useMemo(
		(): ResourceCreateContextValue => ({
			commands: props.commands,
			titleLvl1: props.titleLvl1,
			titleLvl3: props.titleLvl3,
			blocks: props.blocks,
			onSubmit,
			isSubmitting: createCmd.isPending,
		}),
		[props.commands, props.titleLvl1, props.titleLvl3, props.blocks, onSubmit, createCmd.isPending],
	);

	return (
		<ResourceCreateContext.Provider value={value}>
			{props.children}
		</ResourceCreateContext.Provider>
	);
}

function ResourceCreateContent(): React.ReactNode {
	const { schemaPack } = useResourceDetailContext();
	const { commands } = useResourceCreateContext();
	const modelSchema = schemaPack?.modelSchema;

	if (!modelSchema || !commands.create) {
		return null;
	}

	return (
		<>
			<ResourceCreateHeader />
			<ResourceCreateForm />
		</>
	);
}

function useNavigateAfterCreate(createdId: string | undefined): void {
	const navigate = useNavigate();

	React.useEffect(() => {
		if (!createdId) {
			return;
		}
		navigate(`../${createdId}`, { relative: 'path', replace: true });
	}, [createdId, navigate]);
}

function ResourceCreateForm(): React.ReactNode {
	const { schemaPack } = useResourceDetailContext();
	const translationNs = useResourceDetailTranslationNs();
	const { commands, blocks, onSubmit, isSubmitting } = useResourceCreateContext();
	const [expanded, setExpanded] = React.useState(true);
	const localize = useLocalize(translationNs);
	const modelSchema = schemaPack?.modelSchema;

	if (!modelSchema || !commands.create) {
		return null;
	}

	return (
		<FormStyleProvider layout='onecol'>
			<CrudFormProvider
				formVariant='create'
				schemaName={modelSchema.name}
				localize={localize}
				isSubmitting={isSubmitting}
				onSubmit={onSubmit}
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

function PaperWithBorder({ children }: { children: React.ReactNode }): React.ReactNode {
	return (
		<Paper withBorder className='px-4 pb-4'>
			{children}
		</Paper>
	);
}
