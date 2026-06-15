import { Stack } from '@mantine/core';
import * as dyn from '@nikkierp/common/dynamicModel';
import React from 'react';
import { useParams } from 'react-router';

import { ResourceCreate } from './ResourceCreate';
import { ResourceDetailProvider } from './ResourceDetailProvider';
import { ResourceUpdate } from './ResourceUpdate';
import { ThunkPackHookReturn } from '../../appState';
import { useDynamicModel } from '../../hookhoc/useDynamicModel';
import { usePaperBgColor } from '../../theme';
import { ConditionExpression } from '../metadata/expression';

import type { IPageProps } from '../core';
import type { ComponentNode } from '../metadata/types';

/** Contextual action driven by a command name. `condition` is a serializable expression. */
export type ResourceDetailExtraAction<TResource = Record<string, unknown>> = {
	label: string,
	command: string,
	condition?: ConditionExpression,
	buildRequest?: (resource: TResource) => unknown,
};

export type ResourceDetailContextualActions<TResource = Record<string, unknown>> = Record<
	string, ResourceDetailExtraAction<TResource>
>;

export type SchemaFieldSpec = { schemaField: string };
export type LinkSpec = { linkHref: string };

export type StatusOption = { value: string, label: string, color: string };

export type OwnPropertySection = {
	header: string,
	fields?: string[],
};

export type ResourceDetailStandardActionHooks = {
	useArchive?: () => ThunkPackHookReturn<dyn.RestMutateResponse, dyn.RestSetIsArchivedRequest>,
	useCreate?: () => ThunkPackHookReturn<dyn.RestCreateResponse, any>,
	useDelete?: () => ThunkPackHookReturn<dyn.RestDeleteResponse, dyn.RestDeleteRequest>,
	useGetById?: () => ThunkPackHookReturn<dyn.RestGetOneResponse<any>, dyn.RestGetByIdRequest>,
	useUpdate?: () => ThunkPackHookReturn<dyn.RestMutateResponse, dyn.RestUpdateRequest>,
};

/** Command names for standard CRUD actions, resolved to data flow by the owning module. */
export type ResourceDetailStandardActionCommands = {
	getById?: string,
	create?: string,
	update?: string,
	delete?: string,
	archive?: string,
};

type ResourceDetailTemplatePropsParams<TResource = Record<string, unknown>> = {
	schemaName: string,
	translationNs: string,
	titleLvl1?: SchemaFieldSpec,
	titleLvl2?: SchemaFieldSpec,
	titleLvl3?: LinkSpec,
	allStatuses?: StatusOption[],
	currentStatus?: SchemaFieldSpec,
	formSections?: OwnPropertySection[],
	contextualActions?: ResourceDetailContextualActions<TResource>,
	standardActions?: ResourceDetailStandardActionHooks,
	standardActionCommands?: ResourceDetailStandardActionCommands,
	childrenNodes?: ComponentNode[],
};

export class ResourceDetailTemplateProps<TResource = Record<string, unknown>>
implements IPageProps<ResourceDetailTemplatePropsParams<TResource>> {
	public readonly params: ResourceDetailTemplatePropsParams<TResource>;

	constructor(params: ResourceDetailTemplatePropsParams<TResource>) {
		this.params = params;
	}
}

export type ResourceDetailProps = {
	/** Strongly-typed page params, passed as-is from `ResourceDetailTemplateProps.params`. */
	params: ResourceDetailTemplateProps['params'],
	childrenNodes?: ComponentNode[],
};

/**
 * Renders the detail container and {@link ResourceDetailProvider}, delegating the body to
 * {@link ResourceUpdate} / {@link ResourceCreate}, which build their subtrees from a
 * metadata node tree via the component registry.
 */
export const ResourceDetail = React.memo(ResourceDetailView);

function ResourceDetailView({ params, childrenNodes }: ResourceDetailProps): React.ReactNode {
	const pack = useDynamicModel(params.schemaName);
	const bgColor = usePaperBgColor();
	const { id } = useParams();
	const createMode = id === 'new';
	const commands = params.standardActionCommands ?? {};
	const nodes = childrenNodes ?? params.childrenNodes;

	return (
		<ResourceDetailProvider
			translationNs={params.translationNs}
			schemaPack={pack}
			isReading={false}
			isWriting={false}
		>
			<Stack
				bg={bgColor}
				className='absolute top-0 left-0 right-0 bottom-0 p-0 m-0 px-4 pb-4 flex overflow-auto'
				gap='md'
			>
				{createMode ? (
					<ResourceCreate
						commands={commands}
						titleLvl1={params.titleLvl1}
						titleLvl3={params.titleLvl3}
						blocks={params.formSections ?? []}
					/>
				) : (
					<ResourceUpdate
						standardActionCommands={commands}
						allStatuses={params.allStatuses}
						currentStatus={params.currentStatus}
						contextualActions={params.contextualActions}
						titleLvl1={params.titleLvl1}
						titleLvl2={params.titleLvl2}
						titleLvl3={params.titleLvl3}
						blocks={params.formSections ?? []}
						childrenNodes={nodes}
					/>
				)}
			</Stack>
		</ResourceDetailProvider>
	);
}
