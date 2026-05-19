import { Stack } from '@mantine/core';
import * as dyn from '@nikkierp/common/dynamic_model';
import React from 'react';
import { useParams } from 'react-router';

import { ResourceCreate } from './ResourceCreate';
import { ResourceDetailProvider } from './ResourceDetailProvider';
import { ResourceUpdate } from './ResourceUpdate';
import { ThunkPackHookReturn } from '../../appState';
import { useDynamicModel } from '../../hookhoc/useDynamicModel';
import { MicroAppDispatchFn } from '../../microApp';
import { usePaperBgColor } from '../../theme';


export type ResourceDetailExtraAction = {
	label: string,
	actionHook: () => ThunkPackHookReturn<dyn.RestMutateResponse, any>,
	condition?: (resource: any) => boolean,
	buildRequest?: (resource: any) => unknown,
};

export type ResourceDetailContextualActions = Record<string, any>;

export type SchemaFieldSpec = { schemaField: string };
export type LinkSpec = { linkHref: string };

type StatusOption = { value: string, label: string, color: string };

type OwnPropertySection = {
	header: string,
	fieldType: 'SchemaFields' | 'CustomFields',
	fields?: string[],
};

type ResourceDetailTemplatePropsParams = {
	schemaName: string,
	translationNs: string,
	dispatch: MicroAppDispatchFn,
	titleLvl1?: SchemaFieldSpec,
	titleLvl2?: SchemaFieldSpec,
	titleLvl3?: LinkSpec,
	allStatuses?: StatusOption[],
	currentStatus?: SchemaFieldSpec,
	ownPropertiesSection?: OwnPropertySection[],
	contextualActions?: ResourceDetailContextualActions,
	actionHooks: {
		useArchive?: () => ThunkPackHookReturn<dyn.RestMutateResponse, dyn.RestSetIsArchivedRequest>,
		useCreate?: () => ThunkPackHookReturn<dyn.RestCreateResponse, any>,
		useDelete?: () => ThunkPackHookReturn<dyn.RestDeleteResponse, dyn.RestDeleteRequest>,
		useGetById: () => ThunkPackHookReturn<dyn.RestGetOneResponse<any>, dyn.RestGetByIdRequest>,
		useUpdate?: () => ThunkPackHookReturn<dyn.RestMutateResponse, dyn.RestUpdateRequest>,
	},
};

export class ResourceDetailTemplateProps {
	public readonly params: ResourceDetailTemplatePropsParams;

	constructor(params: ResourceDetailTemplatePropsParams) {
		this.params = params;
	}
}

export type ResourceDetailProps = {
	props: ResourceDetailTemplateProps,
};

export function ResourceDetail({ props }: ResourceDetailProps): React.ReactNode {
	if (! (props instanceof ResourceDetailTemplateProps)) {
		throw new Error('props must be an instance of ' + ResourceDetailTemplateProps.name);
	}
	const params = props.params;
	const pack = useDynamicModel(params.schemaName);
	const bgColor = usePaperBgColor();
	const getByIdAct = params.actionHooks.useGetById();
	const createAct = params.actionHooks.useCreate?.();
	const updateAct = params.actionHooks.useUpdate?.();
	const { id } = useParams();
	const createMode = id === 'new';
	const isReading = getByIdAct.isLoading;
	const isWriting = Boolean(createAct?.isLoading || updateAct?.isLoading);

	return (
		<ResourceDetailProvider
			translationNs={params.translationNs}
			schemaPack={pack}
			isReading={isReading}
			isWriting={isWriting}
		>
			<Stack
				bg={bgColor}
				className='absolute top-0 left-0 right-0 bottom-0 p-0 m-0 px-4 pb-4 flex overflow-auto'
				gap='md'
			>
				{createMode ? (
					<ResourceCreate
						actionHooks={params.actionHooks}
						titleLvl1={params.titleLvl1}
						titleLvl3={params.titleLvl3}
						blocks={params.ownPropertiesSection ?? []}
					/>
				) : (
					<ResourceUpdate
						dispatch={params.dispatch}
						allStatuses={params.allStatuses}
						currentStatus={params.currentStatus}
						contextualActions={params.contextualActions}
						actionHooks={params.actionHooks}
						titleLvl1={params.titleLvl1}
						titleLvl2={params.titleLvl2}
						titleLvl3={params.titleLvl3}
						blocks={params.ownPropertiesSection ?? []}
					/>
				)}
			</Stack>
		</ResourceDetailProvider>
	);
}
