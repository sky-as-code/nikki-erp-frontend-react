import { Paper } from '@mantine/core';
import * as dyn from '@nikkierp/common/dynamic_model';
import React from 'react';
import { useParams } from 'react-router-dom';

import {
	DataTable, DataTableAction, SearchData,
} from './DataTable';
import { ThunkPackHookReturn } from '../../appState';
import { LoadingState } from '../../components/Loading';
import { TranslateFn, useLocalize, useTranslate } from '../../i18n';
import { MicroAppDispatchFn } from '../../microApp';
import { usePaperBgColor } from '../../theme';
import {  } from '../../hookhoc';

import type { FieldRendererMap } from './fieldRenderers';


export type ResourceActionHook = DataTableAction;

export type { FieldRendererMap, IFieldRenderer } from './fieldRenderers';
export { AvatarFieldRenderer, BadgeFieldRenderer } from './fieldRenderers';
export type { BadgeFieldRendererProps } from './fieldRenderers';


type ResourceListTemplatePropsParams = {
	schemaName: string,
	translationNs: string,
	dispatch: MicroAppDispatchFn,
	extraActions?: ResourceActionHook[],
	standardActions: {
		createEnabled?: boolean,
		useSearch: () => ThunkPackHookReturn<dyn.RestSearchResponse<any>, dyn.RestSearchRequest>,
		useArchive?: () => ThunkPackHookReturn<dyn.RestMutateResponse, dyn.RestSetIsArchivedRequest>,
		useDelete?: () => ThunkPackHookReturn<dyn.RestDeleteResponse, dyn.RestDeleteRequest>,
		useUpdateBegin?: () => ThunkPackHookReturn<dyn.RestMutateResponse, dyn.RestUpdateRequest>,
		useUpdateCancel?: () => ThunkPackHookReturn<void, void>,
		useUpdateSave?: () => ThunkPackHookReturn<dyn.RestMutateResponse, dyn.RestUpdateRequest>,
	},
	linkField?: string,
	fieldAsLink?: string,
	fieldAsId?: string,
	fieldRenderer?: FieldRendererMap,
};

export class ResourceListTemplateProps {
	public readonly params: ResourceListTemplatePropsParams;

	constructor(params: ResourceListTemplatePropsParams) {
		this.params = params;
	}
}

export type ResourceListProps = {
	props: ResourceListTemplateProps,
	/** View-engine page segment (e.g. `users`); detail URLs are `/:orgSlug/:moduleSlug/{routePath}/:id`. */
	routePath: string,
};


export function ResourceList({ props, routePath }: ResourceListProps): React.ReactNode {
	if (! (props instanceof ResourceListTemplateProps)) {
		throw new Error('props must be an instance of ' + ResourceListTemplateProps.name);
	}
	const params = props.params;
	const pack = useSchemaPack(params.schemaName);
	const searchAct = params.standardActions.useSearch();
	const bgColor = usePaperBgColor();
	const lc = useLocalize(params.translationNs);
	const t = useTranslate(params.translationNs);
	const actions = React.useMemo(
		() => buildResourceActions(params.standardActions, params.extraActions, t),
		[params.standardActions, params.extraActions],
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
	actionHooks: ResourceListTemplatePropsParams['standardActions'],
	extraActions: ResourceActionHook[] | undefined,
	t: TranslateFn,
): ResourceActionHook[] {
	let actions: ResourceActionHook[] = [{
		label: t('action.refresh'),
		actionHook: actionHooks.useSearch,
	}];
	if (actionHooks.createEnabled) {
		actions.push({
			label: t('action.create'),
			// actionHook() {
			// 	return {

			// 	};
			// },
		});
	}
	if (actionHooks.useDelete) {
		actions.push({
			label: t('action.delete'),
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
			label: t('action.archive'),
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
