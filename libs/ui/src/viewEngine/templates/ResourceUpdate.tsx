import { Collapse, Stack } from '@mantine/core';
import * as dyn from '@nikkierp/common/dynamicModel';
import React from 'react';
import { useParams } from 'react-router';

import classes from './ResourceDetail.module.css';
import { DebugFormErrors, printDebugFormValues, useResourceDetailContext, useResourceDetailTranslationNs } from './ResourceDetailProvider';
import { ResourceUpdateContext, ResourceUpdateContextValue, useResourceUpdateContext } from './resourceUpdateContext';
import { OwnPropertiesBlock, PaperWithBorder, ResourceUpdateHeader, SectionActionBar } from './resourceUpdateParts';
import { CrudFormProvider, FormStyleProvider } from '../../components/form';
import { useCommand } from '../../hookhoc';
import { useLocalize } from '../../i18n';
import { useCommandBus } from '../../microApp';
import { AdapterContext } from '../metadata/registry';
import { RenderNode } from '../metadata/renderNode';
import { MetadataNode } from '../metadata/types';

import type {
	LinkSpec, OwnPropertySection, ResourceDetailContextualActions,
	ResourceDetailStandardActionCommands, SchemaFieldSpec, StatusOption,
} from './ResourceDetail';


export type ResourceUpdateProps = {
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
	return (
		<ResourceUpdateProvider {...props}>
			<ResourceUpdateContent />
		</ResourceUpdateProvider>
	);
}

/** Fetches the resource and provides {@link ResourceUpdateContext} to its subtree. */
export function ResourceUpdateProvider(
	props: ResourceUpdateProps & { children: React.ReactNode },
): React.ReactNode {
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
			{props.children}
		</ResourceUpdateContext.Provider>
	);
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

function AppendedChildren({ nodes }: { nodes?: MetadataNode[] }): React.ReactNode {
	const commandBus = useCommandBus();
	const translationNs = useResourceDetailTranslationNs();
	const ctx = React.useMemo<AdapterContext>(() => ({ commandBus, translationNs }), [commandBus, translationNs]);
	if (!nodes || nodes.length === 0) {
		return null;
	}
	return <>{nodes.map((node, index) => <RenderNode key={index} node={node} ctx={ctx} />)}</>;
}
