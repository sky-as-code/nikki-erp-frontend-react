import * as dyn from '@nikkierp/common/dynamicModel';
import { LoadingState } from '@nikkierp/ui/components';
import { DataTable } from '@nikkierp/ui/components/DataTable';
import { useLocalize, useTranslate } from '@nikkierp/ui/i18n';
import { useFieldRenderers } from '@nikkierp/viewengine/render';
import React from 'react';
import { useParams } from 'react-router-dom';

import { resourceTablePropsSchema, ResourceTableProps } from './props';
import { interpolateParams, InterpolateResult } from '../../data/interpolate';
import { getSearchRequestOrderBy } from '../../data/searchRequest';
import { useResourceLinkHref } from '../../data/useResourceLinkHref';
import { useResourceSearch } from '../../data/useResourceSearch';
import { RESOURCE_TABLE } from '../../ids';

import type { IComponentRenderer } from '@nikkierp/viewengine/core';


export const resourceTableRenderer: IComponentRenderer<ResourceTableProps> = {
	type: RESOURCE_TABLE,
	propsSchema: resourceTablePropsSchema,
	render(props) {
		return <ResourceTable params={props} />;
	},
};

function ResourceTable({ params }: { params: ResourceTableProps }): React.ReactNode {
	const graph = useInterpolatedGraph(params.filterGraph);
	const lc = useLocalize(params.translationNs);
	const t = useTranslate(params.translationNs);
	const fieldRenderer = useFieldRenderers(params.fieldRenderers);
	const initialRequest = useInitialRequest(params);

	const { pack, searchData, searchRequest, onSearchRequestChange, refresh } = useResourceSearch({
		schemaName: params.schemaName,
		searchCommand: params.searchCommand,
		initialRequest,
		graphOverride: graph.value,
	});
	const buildLinkHref = useResourceLinkHref(params.linkField, params.linkRoutePath);

	if (!pack || !searchData || graph.missing.length > 0) {
		return <LoadingState />;
	}

	return (
		// Bounded box: unlike the list page this is embedded, so it must not go full-bleed.
		<div className='max-h-[480px] overflow-auto'>
			<DataTable
				tableName={lc(pack.modelSchema.label, { count: searchData.total })}
				data={searchData}
				initialSearchRequest={searchRequest}
				modelSchema={pack.modelSchema}
				onSearchRequestChange={onSearchRequestChange}
				fieldRenderer={fieldRenderer}
				buildLinkHref={buildLinkHref}
				actions={[{ label: t('action.refresh'), onTrigger: refresh }]}
				sortableFields={searchData.desired_fields}
				orderBy={getSearchRequestOrderBy(searchRequest)}
				translationNs={params.translationNs}
				translateFieldName={(field: string) => lc(pack.modelSchema.fields[field]?.label)}
			/>
		</div>
	);
}

function useInitialRequest(params: ResourceTableProps): dyn.RestSearchRequest {
	return React.useMemo(() => ({
		page: 0,
		size: params.pageSize,
		search_name: params.searchName,
		fields: params.fields,
	}), [params.pageSize, params.searchName, params.fields]);
}

/**
 * `useParams()` returns a fresh object every render, so the memo is keyed on a
 * serialised form and re-parses it — keying on the object itself would rebuild
 * the graph every render and refetch forever.
 */
function useInterpolatedGraph(
	filterGraph: ResourceTableProps['filterGraph'],
): InterpolateResult<dyn.SearchGraph | undefined> {
	const paramsKey = JSON.stringify(useParams());

	return React.useMemo(
		() => interpolateParams(filterGraph as dyn.SearchGraph | undefined, JSON.parse(paramsKey)),
		[filterGraph, paramsKey],
	);
}
