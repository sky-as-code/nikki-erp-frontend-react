import { Avatar, Badge, Paper } from '@mantine/core';
import * as dyn from '@nikkierp/common/dynamic_model';
import React from 'react';

import {
	DataTable, DataTableActionHook, FieldRenderHintMap, IFieldRenderHint, SearchData,
} from './DataTable';
import { ThunkPackHookReturn } from '../../appState';
import { LoadingState } from '../../components/Loading';
import { MicroAppDispatchFn } from '../../microApp';
import { usePaperBgColor } from '../../theme';


export type ResourceActionHook = DataTableActionHook;

export type { IFieldRenderHint, FieldRenderHintMap };


export class AvatarRenderHint implements IFieldRenderHint {
	get type(): string {
		return 'avatar';
	}

	render(value: string): React.ReactNode {
		return <Avatar src={value || undefined} size='lg' radius='md' />;
	}
}

export type BadgeRenderHintProps = {
	colorMap: Record<string, string>,
};

export class BadgeRenderHint implements IFieldRenderHint {
	private readonly colorMap: Record<string, string>;

	constructor(props: BadgeRenderHintProps) {
		this.colorMap = props.colorMap;
	}

	get type(): string {
		return 'badge';
	}

	render(value: string): React.ReactNode {
		return <Badge variant='filled' color={this.colorMap[value]}>{value}</Badge>;
	}
}


type ResourceListTemplatePropsParams = {
	schemaName: string,
	resourceName: string,
	resourceNamePlural: string,
	dispatch: MicroAppDispatchFn,
	extraActions?: ResourceActionHook[],
	actionHooks: {
		useSearch: () => ThunkPackHookReturn<dyn.RestSearchResponse<any>, dyn.RestSearchRequest>,
		useArchive?: () => ThunkPackHookReturn<dyn.RestMutateResponse, dyn.RestSetIsArchivedRequest>,
		useCreate?: () => ThunkPackHookReturn<void, void>,
		useDelete?: () => ThunkPackHookReturn<dyn.RestDeleteResponse, dyn.RestDeleteRequest>,
		useUpdateBegin?: () => ThunkPackHookReturn<dyn.RestMutateResponse, dyn.RestUpdateRequest>,
		useUpdateCancel?: () => ThunkPackHookReturn<void, void>,
		useUpdateSave?: () => ThunkPackHookReturn<dyn.RestMutateResponse, dyn.RestUpdateRequest>,
	}
	linkField?: string,
	linkRoutePath?: string,
	fieldAsLink?: string,
	fieldAsId?: string,
	fieldRenderHint?: FieldRenderHintMap,
};

export class ResourceListTemplateProps {
	public readonly params: ResourceListTemplatePropsParams;

	constructor(params: ResourceListTemplatePropsParams) {
		this.params = params;
	}
}

export type ResourceListProps = {
	props: ResourceListTemplateProps,
};


export function ResourceList({ props }: ResourceListProps): React.ReactNode {
	if (! (props instanceof ResourceListTemplateProps)) {
		throw new Error('props must be an instance of ' + ResourceListTemplateProps.name);
	}
	const params = props.params;
	const pack = useSchemaPack(params.schemaName);
	const searchAct = params.actionHooks.useSearch();
	const bgColor = usePaperBgColor();
	const actions = React.useMemo(
		() => buildResourceActions(params.actionHooks, params.extraActions),
		[params.actionHooks, params.extraActions],
	);
	const searchThunkActionRef = React.useRef(searchAct.thunkAction);
	const [searchRequest, setSearchRequest] = React.useState<dyn.RestSearchRequest>({
		page: 0,
		size: 0,
		search_name: 'default',
	});
	const [cachedSearchData, setCachedSearchData] = React.useState<SearchData | null>(null);
	const onSearchRequestChange = React.useCallback((newReq: dyn.RestSearchRequest) => {
		setSearchRequest(oldReq => isSameSearchRequest(oldReq, newReq) ? oldReq : newReq);
	}, []);

	React.useEffect(() => {
		searchThunkActionRef.current = searchAct.thunkAction;
	}, [searchAct.thunkAction]);

	React.useEffect(() => {
		if (searchAct.isDone && searchAct.data) {
			setCachedSearchData(searchAct.data as SearchData);
		}
	}, [searchAct.data, searchAct.isDone]);

	React.useEffect(() => {
		params.dispatch(searchThunkActionRef.current(searchRequest) as any);
	}, [params.dispatch, searchRequest]);

	// Using cache data to prevent flickering when the search is pending.
	const searchData = searchAct.isDone && searchAct.data
		? searchAct.data as SearchData
		: cachedSearchData;
	if (!pack || !searchData) {
		return <LoadingState />;
	}

	const linkField = params.linkField ?? params.fieldAsLink;
	const linkRoutePath = params.linkRoutePath;
	const orderBy = getSearchRequestOrderBy(searchRequest);
	return (
		<Paper className='absolute top-0 left-0 right-0 bottom-0 p-0 m-0 flex' bg={bgColor}>
			<DataTable
				tableName={searchData.total > 0 ? params.resourceNamePlural : params.resourceName}
				data={searchData}
				initialSearchRequest={searchRequest}
				modelSchema={pack.modelSchema}
				onSearchRequestChange={onSearchRequestChange}
				fieldRenderHint={params.fieldRenderHint}
				linkField={linkField}
				linkRoutePath={linkRoutePath}
				allowColumnResizing
				actions={actions}
				hasFixHeader
				sortableFields={searchData.desired_fields}
				orderBy={orderBy}
			/>
		</Paper>
	);
}

function buildResourceActions(
	actionHooks: ResourceListTemplatePropsParams['actionHooks'],
	extraActions?: ResourceActionHook[],
): ResourceActionHook[] {
	let actions: ResourceActionHook[] = [{
		label: 'Refresh',
		actionHook: actionHooks.useSearch,
	}];
	if (actionHooks.useCreate) {
		actions.push({
			label: 'Create',
			actionHook: actionHooks.useCreate,
		});
	}
	if (actionHooks.useDelete) {
		actions.push({
			label: 'Delete',
			requireSelection: true,
			supportMultiple: true,
			actionHook: actionHooks.useDelete,
		});
	}
	actions = actions.concat(extraActions ?? []);
	if (actionHooks.useArchive) {
		actions.push({
			isSeparator: true,
		}, {
			label: 'Archive',
			requireSelection: true,
			supportMultiple: true,
			actionHook: actionHooks.useArchive,
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
	const [pack, setPack] = React.useState<dyn.SchemaPack | null>(null);
	const [etag, setEtag] = React.useState<string | undefined>(undefined);

	React.useEffect(() => {
		dyn.schemaRegistry.get(schemaName).then(next => {
			setPack(next);
			setEtag(next?.modelSchema?.etag);
		});
	}, [schemaName, etag === pack?.modelSchema?.etag]);

	return pack;
}

// function useInitialSearch(dispatch: DispatchActionFn<dyn.RestSearchRequest>) {
// 	// const searchResrc = searchAction.useThunkHook?.();
// 	React.useEffect(() => {
// 		dispatch({
// 			page: 0, size: 50, search_name: 'default',
// 		});
// 	}, []);
// 	return searchResrc;
// }
