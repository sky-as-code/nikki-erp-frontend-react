import { Paper } from '@mantine/core';
import * as dyn from '@nikkierp/common/dynamicModel';
import React from 'react';
import { useParams } from 'react-router-dom';

import {
	DataTable, DataTableAction, SearchData,
} from './DataTable';
import { LoadingState } from '../../components/Loading';
import { useCommand } from '../../hookhoc';
import { TranslateFn, useLocalize, useTranslate } from '../../i18n';
import { useCommandBus } from '../../microApp';
import { usePaperBgColor } from '../../theme';
import type { IPageProps } from '../core';
import { AdapterContext, resolveFieldRenderer } from '../metadata/registry';

import type { FieldRendererMap } from './fieldRenderers';


export type { FieldRendererMap, IFieldRenderer } from './fieldRenderers';
export { AvatarFieldRenderer, BadgeFieldRenderer } from './fieldRenderers';
export type { BadgeFieldRendererProps } from './fieldRenderers';


export type ResourceListCommandAction = {
	label: string,
	command: string,
	supportMultiple?: boolean,
	requireSelection?: boolean,
};

type ResourceListRuntimeParams = {
	schemaName: string,
	translationNs: string,
	searchCommand: string,
	createEnabled?: boolean,
	deleteCommand?: string,
	archiveCommand?: string,
	updateSaveCommand?: string,
	extraActions?: ResourceListCommandAction[],
	linkField?: string,
	fieldAsLink?: string,
	fieldAsId?: string,
	fieldRenderer?: FieldRendererMap,
};

export class ResourceListTemplateProps implements IPageProps<ResourceListRuntimeParams> {
	public readonly params: ResourceListRuntimeParams;

	constructor(params: ResourceListRuntimeParams) {
		this.params = params;
	}
}

/** Serializable JSON props as authored in page metadata. Action values are command names. */
export type ResourceListJsonProps = {
	schemaName: string,
	translationNs?: string,
	linkField?: string,
	fieldAsLink?: string,
	fieldAsId?: string,
	fieldRenderer?: Record<string, { renderer: string } & Record<string, unknown>>,
	standardActions: {
		createEnabled?: boolean,
		search: string,
		archive?: string,
		delete?: string,
		updateSave?: string,
	},
	extraActions?: ResourceListCommandAction[],
};

export function adaptResourceListProps(
	json: Record<string, unknown> | undefined,
	ctx: AdapterContext,
): ResourceListTemplateProps {
	const props = (json ?? {}) as ResourceListJsonProps;
	return new ResourceListTemplateProps({
		schemaName: props.schemaName,
		translationNs: props.translationNs ?? ctx.translationNs ?? 'common',
		searchCommand: props.standardActions.search,
		createEnabled: props.standardActions.createEnabled,
		deleteCommand: props.standardActions.delete,
		archiveCommand: props.standardActions.archive,
		updateSaveCommand: props.standardActions.updateSave,
		extraActions: props.extraActions,
		linkField: props.linkField,
		fieldAsLink: props.fieldAsLink,
		fieldAsId: props.fieldAsId,
		fieldRenderer: resolveRendererMap(props.fieldRenderer),
	});
}

function resolveRendererMap(
	config?: Record<string, { renderer: string } & Record<string, unknown>>,
): FieldRendererMap | undefined {
	if (!config) {
		return undefined;
	}
	const result: FieldRendererMap = {};
	for (const [field, entry] of Object.entries(config)) {
		const renderer = resolveFieldRenderer(entry.renderer, entry);
		if (renderer) {
			result[field] = renderer;
		}
	}
	return result;
}

export type ResourceListProps = {
	/** Strongly-typed page params, passed as-is from `ResourceListTemplateProps.params`. */
	params: ResourceListRuntimeParams,
	/** View-engine page segment (e.g. `users`); detail URLs are `/:orgSlug/:moduleSlug/{routePath}/:id`. */
	routePath: string,
};


export const ResourceList = React.memo(ResourceListView);

function ResourceListView({ params, routePath }: ResourceListProps): React.ReactNode {
	const pack = useSchemaPack(params.schemaName);
	const bgColor = usePaperBgColor();
	const lc = useLocalize(params.translationNs);
	const t = useTranslate(params.translationNs);
	const commandBus = useCommandBus();
	const search = useCommand<dyn.RestSearchResponse<any>>(params.searchCommand);

	const [searchRequest, setSearchRequest] = React.useState<dyn.RestSearchRequest>({
		page: 0,
		size: 0,
		search_name: 'default',
	});
	const [cachedSearchData, setCachedSearchData] = React.useState<SearchData | null>(null);
	const onSearchRequestChange = React.useCallback((newReq: dyn.RestSearchRequest) => {
		setSearchRequest(oldReq => isSameSearchRequest(oldReq, newReq) ? oldReq : newReq);
	}, []);

	const publishSearch = search.publish;
	const refreshSearch = React.useCallback(() => {
		void publishSearch(searchRequest);
	}, [publishSearch, searchRequest]);

	React.useEffect(() => {
		void publishSearch(searchRequest);
	}, [publishSearch, searchRequest]);

	React.useEffect(() => {
		if (search.data) {
			setCachedSearchData(search.data as SearchData);
		}
	}, [search.data]);

	const actions = React.useMemo(
		() => buildResourceActions(params, t, commandBus, refreshSearch),
		[params, t, commandBus, refreshSearch],
	);

	// Use cache data to prevent flickering while a search is pending.
	const searchData = (search.data as SearchData | null) ?? cachedSearchData;

	const { orgSlug, moduleSlug } = useParams();
	const linkField = params.linkField ?? params.fieldAsLink;
	const buildLinkHref = React.useCallback((rowData: SearchData['items'][number]) => {
		if (!linkField || !orgSlug || !moduleSlug) {
			return '#';
		}
		const pageSeg = routePath.split('/').filter(Boolean).map(seg => encodeURIComponent(seg)).join('/');
		const raw = rowData[linkField];
		return `/${encodeURIComponent(orgSlug)}/${encodeURIComponent(moduleSlug)}/${pageSeg}/${encodeURIComponent(String(raw))}`;
	}, [linkField, orgSlug, moduleSlug, routePath]);

	if (!pack || !searchData) {
		return <LoadingState />;
	}

	const orderBy = getSearchRequestOrderBy(searchRequest);
	return (
		<Paper className='absolute top-0 left-0 right-0 bottom-0 p-0 m-0 flex' bg={bgColor}>
			<DataTable
				tableName={lc(pack.modelSchema.label, { count: searchData.total })}
				data={searchData}
				initialSearchRequest={searchRequest}
				modelSchema={pack.modelSchema}
				onSearchRequestChange={onSearchRequestChange}
				fieldRenderer={params.fieldRenderer}
				buildLinkHref={buildLinkHref}
				allowColumnResizing
				actions={actions}
				hasFixHeader
				sortableFields={searchData.desired_fields}
				orderBy={orderBy}
				translationNs={params.translationNs}
				translateFieldName={(field: string) => {
					if (field === 'fields') {
						return t('model_fields');
					}
					return lc(pack.modelSchema.fields[field]?.label);
				}}
			/>
		</Paper>
	);
}

function buildResourceActions(
	params: ResourceListRuntimeParams,
	t: TranslateFn,
	commandBus: ReturnType<typeof useCommandBus>,
	refreshSearch: () => void,
): DataTableAction[] {
	const runCommand = (command: string) => (selectedItems: Record<string, unknown>[]) => {
		const ids = selectedItems.map(item => item.id).filter(Boolean) as string[];
		void commandBus.publish({ name: command, payload: { ids } }).then(refreshSearch);
	};

	let actions: DataTableAction[] = [{
		label: t('action.refresh'),
		onTrigger: () => refreshSearch(),
	}];
	if (params.createEnabled) {
		actions.push({ label: t('action.create'), href: '../new' });
	}
	if (params.deleteCommand) {
		actions.push({
			label: t('action.delete'),
			requireSelection: true,
			supportMultiple: true,
			command: params.deleteCommand,
			onTrigger: runCommand(params.deleteCommand),
		});
	}
	actions = actions.concat((params.extraActions ?? []).map(action => ({
		label: action.label,
		supportMultiple: action.supportMultiple,
		requireSelection: action.requireSelection,
		command: action.command,
		onTrigger: runCommand(action.command),
	})));
	if (params.archiveCommand) {
		actions.push({ isSeparator: true }, {
			label: t('action.archive'),
			requireSelection: true,
			supportMultiple: true,
			command: params.archiveCommand,
			onTrigger: runCommand(params.archiveCommand),
		});
	}
	return actions;
}

function shallowEqualStringArray(a?: string[], b?: string[]): boolean {
	if (a === b) {
		return true;
	}
	if (a == null || b == null) {
		return a === b;
	}
	if (a.length !== b.length) {
		return false;
	}
	return a.every((value, index) => value === b[index]);
}

function isSameSearchRequest(prev: dyn.RestSearchRequest, next: dyn.RestSearchRequest): boolean {
	return prev.page === next.page
		&& prev.size === next.size
		&& prev.search_name === next.search_name
		&& prev.language === next.language
		&& prev.graph === next.graph
		&& shallowEqualStringArray(prev.fields, next.fields);
}

function getSearchRequestOrderBy(request: dyn.RestSearchRequest): dyn.OrderBy {
	const rawOrder = (request.graph as Partial<dyn.SearchGraph> | undefined)?.order;
	if (!Array.isArray(rawOrder)) {
		return [];
	}
	return rawOrder.filter(
		(item): item is [string, dyn.SearchOrder] =>
			Array.isArray(item)
			&& item.length === 2
			&& typeof item[0] === 'string'
			&& (item[1] === 'asc' || item[1] === 'desc'),
	);
}

function useSchemaPack(schemaName: string) {
	const commandBus = useCommandBus();
	const [pack, setPack] = React.useState<dyn.SchemaPack | null>(null);
	const [etag, setEtag] = React.useState<string | undefined>(undefined);

	React.useEffect(() => {
		void dyn.publishGetSchema(commandBus, schemaName).then(next => {
			setPack(next);
			setEtag(next?.modelSchema?.etag);
		});
	}, [commandBus, schemaName, etag === pack?.modelSchema?.etag]);

	return pack;
}
